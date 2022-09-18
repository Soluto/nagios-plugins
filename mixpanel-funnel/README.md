# Mixpanel-funnel
Gets the results of a Mixpanel funnel and compares the results of each step to the thresholds. Can also optionally use the overall ratio instead of the step ratio.

## Prerequisites
You  should have Node.js installed.

## Installation
```sh
$ npm install
```

## Usage
 ```sh
$ node app.js [Options] -- <api_key> <api_secret> <funnel_id>
```

### Options
- -i, --interval=NUMBER  The number of days you want your results bucketed into. The default value is 7
- -w, --warning=NUMBER   Warning threshold. The default value is 85
- -c, --critical=NUMBER  Critical threshold. The default value is 70
- -s, --step=NUMBER+     Step indexes to check, default is last step
- -o, --overall-ratio      use overall ratio instead of step ratio
- -h, --help               display this help           

### Example
```
mixpanel-funnel/app.js '-i' '14' '-w' '75' '-c' '60' -s '2' -s '4' -- 'SOME_API_KEY' 'SOME_API_SECRET' 'SOME_FUNNEL_ID'
```
