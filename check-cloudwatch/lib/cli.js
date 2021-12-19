import { program } from 'commander/esm.mjs'
import nagios from './nagios.js'

const requiredOptions = [ 'warning', 'critical', 'metricDataQueries', 'resultMetricId', 'region' ]
const jsonOptions = [ 'metricDataQueries' ]

export default function parseAndValidateCliOptions() {
  const options = parseCliOptions()
  validateRequiredOptions(options)
  parseJsonOptions(options)

  return options
}

// We are not using Commander's built-in required option feature because we still have to format the output
// according to Nagios' output format
function parseCliOptions() {
  program
    .version('1.0.0')
    .option('-w, --warning <threshold>', 'warning threshold')
    .option('-c, --critical <threshold>', 'critical threshold')
    .option('-m, --metric-data-queries <JSON string>', 'MetricDataQueries as expected by the Cloudwatch GetMetricData command')
    .option('-i, --result-metric-id <id>', 'the id of the MetricDataQuery to use for the result')
    .option('-r, --region <region>', 'AWS region')
    .parse()

  return program.opts()
}

function validateRequiredOptions(options) {
  for (const option of requiredOptions) {
    if (!options.hasOwnProperty(option)) nagios.exitWithError(`Missing required option '${option}'`)
  }
}

function parseJsonOptions(options) {
  for (const option of jsonOptions) {
    try {
      if (!options.hasOwnProperty(option)) continue

      options[option] = JSON.parse(options[option])
    } catch (err) {
      nagios.exitWithError(`${option} option contains invalid JSON`)
    }
  }
}
