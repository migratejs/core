'use strict'
const Migration = require('./migration')

module.exports = function upMigrations (set, migrationTitle) {
  const titleIndex = set.indexOf(migrationTitle)
  if (migrationTitle && titleIndex === -1) {
    // @TODO wat to do?
    // throw new Error(`Could not find migration: ${migrationTitle}`)
  }
  const toIndex = titleIndex !== -1 ? titleIndex : set.length
  const fromIndex = set.indexOf(set.lastRun) + 1

  return set.filter(function (migration, index) {
    if (index > toIndex) {
      return false
    }

    if (index < fromIndex) {
      // @TODO wat to do? maybe nothing here
      if (migration.state !== Migration.STATES.RAN_UP) {
        // set.emit('warning', 'migrations running out of order')
        return true
      }
      return false
    }

    // @TODO wat to do? maybe nothing here
    if (migration.state === Migration.STATES.RAN_UP) {
      // set.emit('warning', 'migrations running out of order')
      return false
    }

    return true
  })
}
