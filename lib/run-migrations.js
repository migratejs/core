'use strict'
const Migration = require('./migration')

module.exports = async function * runMigrations (migrations, _methods) {
  for (let migration of migrations) {
    let methods = _methods
    if (!Array.isArray(methods)) {
      methods = [methods]
    }

    // Run each method in the array
    for (let method of methods) {
      // Missing direction method
      if (typeof migration[method] !== 'function') {
        throw new TypeError(`Migration ${migration.title} does not have method ${method}`)
      }

      try {
        // Execute migration
        await migration[method]()

        // Set state
        switch (method) {
          case 'up':
            migration.state = Migration.STATES.RAN_UP
            break
          case 'down':
            migration.state = Migration.STATES.RAN_DOWN
            break
        }
      } catch (e) {
        // Set error state
        migration.state = Migration.STATES.ERRORED
        migration.error = e
        e.migration = migration
        throw e
      } finally {
        // Set timestamp of action
        migration.timestamp = new Date()
      }
    }
    yield migration
  }
}
