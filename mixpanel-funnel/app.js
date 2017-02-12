#!/usr/bin/env node
const getOpt = require('node-getopt')
    .create([ [ 'i', 'interval=<NUMBER>', 'The number of days you want your results bucketed into. The default value is 7' ]
        , [ 'w', 'warning=<NUMBER>', 'Warning threshold. The default value is 85' ]
        , [ 'c', 'critical=<NUMBER>', 'Critical threshold. The default value is 70' ]
        , [ 's', 'step=<NUMBER>+', 'Step indexes to check, default is last step' ]
        , [ 'o' , 'overall-ratio', 'use overall ratio instead of step ratio']
        , [ 'h', 'help', 'display this help' ] ])
    .bindHelp();

getOpt.setHelp('Usage: node app.js [Options] -- '
    + '<api_key> <api_secret> <funnel_id>\nOptions:\n[[OPTIONS]]');

const args = getOpt.parseSystem();
if (args.argv.length < 3) {
    getOpt.showHelp();
    process.exit(3);
}

const Plugin = require('nagios-plugin');
const o = new Plugin({
    shortName : 'get_funnel'
});

const critical = Number(args.options.critical || 70);
const warning = Number(args.options.warning || 85);

const thresholdPrefix = (critical < warning ? '@' : '');
o.setThresholds({
    'critical' : thresholdPrefix + critical,
    'warning' : thresholdPrefix + warning
});

const getFunnel = require('./getFunnel');

const interval = Number(args.options.interval || 7);
const mixpanelData = {
    api_key: args.argv[0],
    api_secret: args.argv[1]
}
const funnelId = args.argv[2];

const MixpanelExport = require('mixpanel-data-export');
const panel = new MixpanelExport(mixpanelData);

const ratio = args.options['overall-ratio'] ? 'overallRatio' : 'stepRatio';

getFunnel(panel, funnelId, interval).then(steps => {
    const indexes = args.options.step || [steps.length - 1];
    indexes.forEach(index => {
        if (index < 0 || index >= steps.length) {
            o.addMessage(p.states.UNKNOWN, `step[${index}]: step not found in funnel`);
            return;
        }
        const result = steps[index][ratio] * 100;
        const roundedResult = Math.round(result * 100)/100;
        const state = o.checkThreshold(result);
        o.addMessage(state, `step[${index}]: ${roundedResult}%`);
        o.addPerfData({
            label : `step-${index}_${steps[index].name}`,
            value : result,
            uom : "%",
            threshold : {critical, warning},
            min : 0
        });
    });
    const messageObj = o.checkMessages();
    o.nagiosExit(messageObj.state, messageObj.message);
});
