# Check Cloudwatch Nagios Plugin
Nagios plugin to monitor Cloudwatch metrics, with support for Metric Math Expressions

## Usage

```
Usage: check_cloudwatch [options]

Options:
  -V, --version                            output the version number
  -w, --warning <threshold>                warning threshold
  -c, --critical <threshold>               critical threshold
  -m, --metric-data-queries <JSON string>  MetricDataQueries as expected by the Cloudwatch GetMetricData command
  -i, --result-metric-id <id>              the id of the MetricDataQuery to use for the result
  -r, --region <region>                    AWS region
  -h, --help                               display help for command
```
