const dateFormat = require('dateformat');

const getFunnel = (panel, funnel_id, interval) => {
    const dateTo = new Date();
    const dateFrom = new Date().setDate(dateTo.getDate() - interval);

    return panel.funnels({
        funnel_id: funnel_id,
        from_date: dateFormat(dateFrom, "yyyy-mm-dd"),
        to_date: dateFormat(dateTo, "yyyy-mm-dd"),
        interval: interval+1
    }).then(data => {
        const result = Object.keys(data.data)[0];
        const steps = data.data[result].steps;
        return steps.map(step => { return {stepRatio: step.step_conv_ratio, overallRatio: step.overall_conv_ratio, name: step.goal} });
    });
};

module.exports = getFunnel;
