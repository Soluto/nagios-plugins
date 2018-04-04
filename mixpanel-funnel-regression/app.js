#!/usr/bin/env node
const MixpanelExport = require('mixpanel-data-export');
const Plugin = require('nagios-plugin');
const getFunnel = require('./getFunnel');
const getOpt = require('node-getopt')
    .create([['i', 'interval=<NUMBER>', 'The number of days you want your results bucketed into. The default value is 7']
        , ['o', 'offset=<NUMBER>', 'The number of days you want to look back to compare your interval result. The default value is 7.']
        , ['w', 'warning=<NUMBER>', 'Warning threshold. The default value is 5']
        , ['c', 'critical=<NUMBER>', 'Critical threshold. The default value is 10']
        , ['s', 'step=<NUMBER>', 'Step indexes to check, default is last step']
        , ['r', 'overall-ratio', 'use overall ratio instead of step ratio']
        , ['h', 'help', 'display this help']])
    .bindHelp();
getOpt.setHelp('Usage: node app.js [Options] -- '
    + '<api_key> <api_secret> <funnel_id>\nOptions:\n[[OPTIONS]]');

const args = getOpt.parseSystem();

if (args.argv.length < 3) {
    getOpt.showHelp();
    process.exit(3);
}

const funnelPlugin = new Plugin({
    shortName: 'get_funnel'
});

const critical = Number(args.options.critical || 10);
const warning = Number(args.options.warning || 5);
const thresholdPrefix = (critical < warning ? '@' : '');

funnelPlugin.setThresholds({
    'critical': thresholdPrefix + critical,
    'warning': thresholdPrefix + warning
});

const interval = Number(args.options.interval || 7);
const offset = Number(args.options.offset || 7);
const mixpanelData = {
    api_key: args.argv[0],
    api_secret: args.argv[1]
}
const funnelId = args.argv[2];
const panel = new MixpanelExport(mixpanelData);
const ratio = args.options['overall-ratio'] ? 'overallRatio' : 'stepRatio';

Promise.all([
    getFunnel(panel, funnelId, 0, interval),
    getFunnel(panel, funnelId, offset, interval)]
)
    .then(([currSteps, prevSteps]) => {
        if (currSteps.length !== prevSteps.length) {
            funnelPlugin.addMessage(funnelPlugin.states.UNKNOWN, `mismatch between funnels`);
            return;
        }

        const indexes = args.options.step || [currSteps.length - 1];
        indexes.forEach(index => {
            if (index < 0 || index >= currSteps.length) {
                funnelPlugin.addMessage(funnelPlugin.states.UNKNOWN, `step[${index}]: step not found in funnel`);
                return;
            }

            const prevResult = prevSteps[index][ratio] * 100;
            const roundedPrevResult = Math.round(prevResult * 100) / 100;

            const currResult = currSteps[index][ratio] * 100;
            const roundedCurrResult = Math.round(currResult * 100) / 100;

            const result = prevResult - currResult;
            const roundedResult = Math.round(result * 100) / 100;

            const state = funnelPlugin.checkThreshold(result);
            funnelPlugin.addMessage(state, `step[${index}]: ${roundedResult}%`);
            funnelPlugin.addPerfData({
                label: `step-${index}_${currSteps[index].name}`,
                value: result,
                uom: "%",
                threshold: { critical, warning },
                min: 0
            });
        });
        const messageObj = funnelPlugin.checkMessages();
        funnelPlugin.nagiosExit(messageObj.state, messageObj.message);
    })
    .catch(e => {
        console.error(e);
        throw e;
    });