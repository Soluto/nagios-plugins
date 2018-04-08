# Mixpanel-funnel-regression
The following script samples a given Mixpanel funnel in 2 different intervals and checks for potential regression based on the offset of the two.

## Prerequisites
You  should have Node.js installed.

## Installation
```sh
$ yarn
```

## Usage
```sh
$ node app.js [Options] -- <api_key> <api_secret> <funnel_id>
```

### Options
- -i,   --interval=NUMBER   The number of days you want your results bucketed into. The default value is 7
- -o,   --offset=NUMBER     The number of days you want to look back to compare your interval result. The default value is 7.
- -w,   --warning=NUMBER    Warning threshold. The default value is 5
- -c,   --critical=NUMBER   Critical threshold. The default value is 10
- -s,   --step=NUMBER+      Step indexes to check, default is last step
- -r,   --overall-ratio     use overall ratio instead of step ratio
- -h,   --help              display this help

### Example
```
mixpanel-funnel-regression/app.js '-i' '14' '-o' '14' '-w' '5' '-c' '10' -s '2' -- 'SOME_API_KEY' 'SOME_API_SECRET' 'SOME_FUNNEL_ID'
```
