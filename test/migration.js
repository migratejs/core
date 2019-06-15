'use strict'
const { describe, it } = require('mocha')
const assert = require('assert')
const Migration = require('../lib/migration')

describe('Migration', () => {
  it('should create a migration', () => {
    const mig = new Migration({
      title: '123-test-migration.js'
    })
    assert.strictEqual(mig.title, '123-test-migration.js')
    assert.strictEqual(mig.filename, '123-test-migration.js')
    assert.strictEqual(typeof mig.up, 'function')
    assert.strictEqual(typeof mig.down, 'function')
    assert.strictEqual(mig.description, '')
    assert.strictEqual(mig.timestamp, null)
    assert.strictEqual(mig.state, Migration.STATES.NOT_RUN)
    assert.strictEqual(mig.error, null)
  })

  it('should expose migration states', () => {
    assert.strictEqual(Migration.STATES.NOT_RUN, 'not run')
    assert.strictEqual(Migration.STATES.RAN_UP, 'ran up')
    assert.strictEqual(Migration.STATES.RAN_DOWN, 'ran down')
    assert.strictEqual(Migration.STATES.ERRORED, 'errored')
  })
})
