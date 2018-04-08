const dateFormat = require('dateformat');

const getFunnel = (panel, funnel_id, offset, interval) => {
    let dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - offset - 1);
    const dateFrom = new Date(dateTo);
    dateFrom.setDate(dateFrom.getDate() - interval);

    return panel.funnels({
        funnel_id: funnel_id,
        from_date: dateFormat(dateFrom, "yyyy-mm-dd"),
        to_date: dateFormat(dateTo, "yyyy-mm-dd"),
        interval: interval + 1
    }).then(res => {
        if (res.error) {
            throw new Error(res.error);
        }

        const result = Object.keys(res.data)[0];
        const steps = res.data[result].steps;

        return steps.map(step => { return { stepRatio: step.step_conv_ratio, overallRatio: step.overall_conv_ratio, name: step.goal } });
    });
};

module.exports = getFunnel;
