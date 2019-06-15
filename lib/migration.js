'use strict'

module.exports = class Migration {
  constructor ({ title, filename, up, down, description, timestamp, state, error } = {}) {
    this.title = title || ''
    this.filename = filename || title || ''
    this.up = up || (async () => {})
    this.down = down || (async () => {})
    this.description = description || ''
    this.timestamp = timestamp || null
    this.state = state || STATES.NOT_RUN
    this.error = error || null
  }
}

const STATES = module.exports.STATES = {
  NOT_RUN: 'not run',
  RAN_UP: 'ran up',
  RAN_DOWN: 'ran down',
  ERRORED: 'errored'
}
