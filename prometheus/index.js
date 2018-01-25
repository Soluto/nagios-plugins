const program = require('commander');
const axios = require('axios');
const querystring = require('querystring');
const Plugin = require('nagios-plugin');
const package = require('./package.json');

let endpoint, query;

const funnelPlugin = new Plugin({
  shortName: 'prometheus'
});

program
  .version(package.version)
  .option('-e, --endpoint <prometheus_endpoint>', 'Prometheus endpoint (required)')
  .option('-w, --warning <warning>', 'Warning threshold', 0)
  .option('-c, --critical <critical>', 'Critical threshold', 0)
  .option('-t, --time <rfc3339 | unix_timestamp>', 'Evaluation timestamp (optional)')
  .arguments('<query>')
  .action(q => query = q)
  .parse(process.argv);

function checkArgument(name, value) {
  if (typeof value === 'undefined') {
    console.error(`missing ${name} argument`);
    program.outputHelp();
    process.exit(funnelPlugin.states.UNKNOWN);
  }
}

checkArgument('query', query);
checkArgument('endpoint', program.endpoint);

const critical = Number(program.critical);
const warning = Number(program.warning);

const thresholdPrefix = (critical < warning ? '@' : '');
funnelPlugin.setThresholds({
  'critical': thresholdPrefix + critical,
  'warning': thresholdPrefix + warning
});

function handleResponse(response) {
  if (response.data.status !== 'success') {
    console.error('Prometheus responded with an error', JSON.stringify(response.data));
    process.exit(funnelPlugin.states.UNKNOWN);
  }

  const data = response.data.data;
  const { resultType, result: [_, result] } = response.data.data

  if (resultType !== 'scalar') {
    console.error(`Please provide a query that results in scalar instead of ${resultType}`);
    process.exit(funnelPlugin.states.UNKNOWN);
  }

  const state = funnelPlugin.checkThreshold(result);
  funnelPlugin.addMessage(state, `value: ${result}%`);
  funnelPlugin.addPerfData({
      label : 'value',
      value : result,
      threshold : {critical, warning},
  });
}

const instance = axios.create({
  baseURL: program.endpoint
})

const queryParams = {
  query,
  time: program.time,
};

instance.get(`/api/v1/query?${querystring.stringify(queryParams)}`)
  .then(handleResponse)
  .catch((err) => {
    console.error('Unexpected error has occured', err.message || err);
    process.exit(funnelPlugin.states.UNKNOWN);
  });