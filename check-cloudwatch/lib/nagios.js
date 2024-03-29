import NagiosPlugin from 'nagios-plugin'

const name = 'CloudwatchMetric'

class Nagios {
  constructor() {
    this.plugin = new NagiosPlugin({ shortName: name })
  }

  setThresholds(warning, critical) {
    warning = normalizeRange(warning)
    critical = normalizeRange(critical)
    this.plugin.setThresholds({ warning, critical })
  }

  exitWithError(message) {
    this.plugin.nagiosExit(this.plugin.states.UNKNOWN, message)
  }

  exitWithResult(result) {
    const state = this.plugin.checkThreshold(result)
    this.plugin.addPerfData({ label: name, value: result, uom: '', threshold: this.plugin.threshold })
    this.plugin.nagiosExit(state, `${name} is ${result}`)
  }
}

export default new Nagios()

function normalizeRange(range) {
  range = fixZeroInclusiveRange(range)
  range = addNegativeInfinitySupportToRange(range)

  return range
}

function addNegativeInfinitySupportToRange(range) {
  return range.startsWith('~')
    ? range.replace('~', Number.NEGATIVE_INFINITY)
    : range
}

function fixZeroInclusiveRange(range) {
  return range === '@0:0'
    ? '@0'
    : range
}
