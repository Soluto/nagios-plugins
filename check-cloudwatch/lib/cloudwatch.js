import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import nagios from './nagios.js'

export default async function getCloudwatchResult(region, metricDataQueries, resultMetricId) {
  const metricDataResults = await getMetricData(region, metricDataQueries)
  return parseMetricDataResults(metricDataResults, resultMetricId)
}

function parseMetricDataResults(metricDataResults, resultMetricId) {
  const numberOfResultMetrics = metricDataResults?.MetricDataResults?.length ?? 0
  if (numberOfResultMetrics === 0) nagios.exitWithError('Got empty result from Cloudwatch API, check input option validity of metricDataQueries')

  const resultObject = metricDataResults?.MetricDataResults?.find(({ Id }) => Id === resultMetricId)
  if (!resultObject) nagios.exitWithError(`resultMetricId '${resultMetricId}' not found in the results returned from Cloudwatch, make sure it is present as one of the ids in the metricDataQueries option`)

  const result = resultObject?.Values?.[0]
  if ([undefined, null].includes(result)) nagios.exitWithError('Got no value in the result from Cloudwatch API, check input option validity of the queries in metricDataQueries')

  return result
}

async function getMetricData(region, metricDataQueries) {
  const client = new CloudWatchClient({ region })

  const period = getLongestPeriod(metricDataQueries)
  const startTime = getStartTime(period)
  const endTime = new Date()

  const input = { StartTime: startTime, EndTime: endTime, MetricDataQueries: metricDataQueries }
  const command = new GetMetricDataCommand(input)

  try {
    return await client.send(command)
  } catch (err) {
    nagios.exitWithError(`Error while calling Cloudwatch API: ${err.message}`)
  }
}

function getLongestPeriod(metricDataQueries) {
  const period = metricDataQueries?.reduce?.((maxPeriod, metricDataQuery) => {
    const period = metricDataQuery?.Period ?? metricDataQuery?.MetricStat?.Period
    if (!period) return maxPeriod

    return period > maxPeriod ? period : maxPeriod
  }, 0)

  return period === 0 ? undefined : period
}

function getStartTime(period) {
  const startTimeMs = Date.now() - (period * 1000)
  return new Date(startTimeMs)
}
