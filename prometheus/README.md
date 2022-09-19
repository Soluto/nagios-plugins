# Icinga Prometheus Check

Checks a Prometheus metric and compares it to the given thresholds.

## Prerequisites

You should have Node.js installed.

## Installation

```sh
$ npm install
```

## Usage
 ```sh
$ node index.js [options] <query>
```

### Options
-V, --version                          output the version number
-e, --endpoint <prometheus_endpoint>   Prometheus endpoint (required)
-w, --warning <warning>                Warning threshold (default: 0)
-c, --critical <critical>              Critical threshold (default: 0)
-u, --unit                             Metric unit - display only (optional)
-t, --time <rfc3339 | unix_timestamp>  Evaluation timestamp (optional)
-h, --help                             output usage information

### Example
```
node index.js -e 'prom-endpoint.com' -w 75 -c 60 'some-prometheus-query'
```
