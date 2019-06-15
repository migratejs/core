'use strict'
const Migration = require('./migration')

module.exports = function downMigrations (set, migrationTitle) {
  const titleIndex = set.indexOf(migrationTitle)
  if (migrationTitle && titleIndex === -1) {
    // @TODO wat to do?
    // throw new Error(`Could not find migration: ${migrationTitle}`)
  }
  const fromIndex = set.indexOf(set.lastRun)
  const toIndex = titleIndex !== -1 ? titleIndex : 0

  return set.filter(function (migration, index) {
    if (index < toIndex) {
      return false
    }

    if (index > fromIndex) {
      // @TODO wat to do? maybe nothing here
      if (migration.state === Migration.STATES.RAN_UP) {
        // set.emit('warning', 'migrations running out of order')
        return true
      }
      return false
    }

    // @TODO wat to do? maybe nothing here
    if (migration.state !== Migration.STATES.RAN_UP) {
      // set.emit('warning', 'migrations running out of order')
      return false
    }

    return true
  }).reverse()
}
