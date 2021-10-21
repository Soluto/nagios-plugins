#!/usr/bin/env node

import parseAndValidateCliOptions from './lib/cli.js'
import nagios from './lib/nagios.js'
import getCloudwatchResult from './lib/cloudwatch.js'

async function main() {
  const { warning, critical, resultMetricId, region, metricDataQueries } = parseAndValidateCliOptions()
  nagios.setThresholds(warning, critical)

  const cloudwatchResult = await getCloudwatchResult(region, metricDataQueries, resultMetricId)
  nagios.exitWithResult(cloudwatchResult)
}

main()
