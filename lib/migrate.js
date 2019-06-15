'use strict'
const upMigrations = require('./up-migrations')
const downMigrations = require('./down-migrations')
const runMigrations = require('./run-migrations')

// @TODO more needs to be done here to make sure this is a good direction
module.exports = async function * (direction, set) {
  const migrations = (direction === 'up' ? upMigrations : downMigrations)(set)

  // Run migration methods
  try {
    for await (let migration of runMigrations(migrations, direction)) {
      yield {
        operation: `migration ${direction}`,
        migration: migration
      }
    }
  } catch (e) {
    yield {
      operation: `migration error`,
      migration: e.migration,
      error: e
    }
  } finally {
    yield {
      operation: `migration complete`
    }
  }
}
