# Check Cloudwatch Nagios Plugin
Nagios plugin to monitor Cloudwatch metrics, with support for Metric Math Expressions

## Usage

```
Usage: check_cloudwatch [options]

Options:
  -V, --version                                 output the version number
  -w, --warning <threshold>                     warning threshold
  -c, --critical <threshold>                    critical threshold
  -m, --metric-data-queries <JSON/YAML string>  MetricDataQueries as expected by the Cloudwatch GetMetricData command. An array of MetricDataQuery objects as documented by AWS:
                                                https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDataQuery.html
  -i, --result-metric-id <id>                   the id of the MetricDataQuery to use for the result
  -r, --region <region>                         AWS region
  -h, --help                                    display help for command
```

The `--metric-data-queries` param is parsed and passed as-is to Cloudwatch's GetMetricData command. The format for it can be found in the [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDataQuery.html).
It should be passed as a JSON/YAML string that describes the MetricDataQueries object when parsed.
