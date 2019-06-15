'use strict'
const { describe, it } = require('mocha')
const assert = require('assert')
const Migration = require('../lib/migration')
const MigrationSet = require('../lib/migration-set')
const upMigrations = require('../lib/up-migrations')
const downMigrations = require('../lib/down-migrations')
const runMigrations = require('../lib/run-migrations')
const migrate = require('../lib/migrate')

describe('migrate', () => {
  describe('run', () => {
    it('should run migrations', async () => {
      let called = 0
      function m (title) {
        return new Migration({
          title: title,
          up: async function isCalled () {
            called++
            if (title === 'four') {
              throw new Error('fourth')
            }
          },
          down: async function notCalled () {
            throw new Error('should not be called')
          }
        })
      }
      const set = new MigrationSet([m('one'), m('two'), m('three'), m('four')])

      try {
        for await (let migration of runMigrations(set, 'up')) {
          assert.strictEqual(migration.state, Migration.STATES.RAN_UP)
          assert(migration.timestamp instanceof Date)
        }
      } catch (e) {
        assert.strictEqual(e.message, 'fourth')
      }
      assert.strictEqual(called, 4)
      assert.strictEqual(set.four.state, Migration.STATES.ERRORED)
      assert.strictEqual(set.four.error.message, 'fourth')
    })

    it('should choose and run migrations', async () => {
      let called = 0
      function m (title, state) {
        return new Migration({
          title: title,
          state: state,
          up: async function isCalled () {
            called++
            if (title === 'four') {
              throw new Error('fourth')
            }
          },
          down: async function notCalled () {
            throw new Error('should not be called')
          }
        })
      }
      const set = new MigrationSet([
        m('one', Migration.STATES.RAN_UP),
        m('two'),
        m('three'),
        m('four')
      ])

      for await (let evt of migrate('up', set)) {
        assert.strictEqual(typeof evt.operation, 'string')
        if (evt.operation === 'migration up') {
          assert(evt.migration instanceof Migration)
        }
      }
      assert.strictEqual(called, 3)
    })
  })

  describe('up', () => {
    it('should get migrations from a set', () => {
      const set = new MigrationSet()
      set.add({ title: 'one' })
      set.add({ title: 'two' })
      set.add({ title: 'three' })

      const migs = upMigrations(set)
      assert.strictEqual(migs.length, 3)
      assert.strictEqual(migs[0].title, 'one')
      assert.strictEqual(migs[1].title, 'two')
      assert.strictEqual(migs[2].title, 'three')
    })
    it('should get migrations from a paritially run set', () => {
      const set = new MigrationSet()
      set.add({ title: 'one', state: Migration.STATES.RAN_UP })
      set.add({ title: 'two' })
      set.add({ title: 'three' })
      set.lastRun = 'one'

      const migs = upMigrations(set)
      assert.strictEqual(migs.length, 2)
      assert.strictEqual(migs[0].title, 'two')
      assert.strictEqual(migs[1].title, 'three')
    })
    it('should get migrations from a set run out of order', () => {
      const set = new MigrationSet()
      set.add({ title: 'one', state: Migration.STATES.RAN_UP })
      set.add({ title: 'two' })
      set.add({ title: 'three', state: Migration.STATES.RAN_DOWN })
      set.add({ title: 'four', state: Migration.STATES.RAN_UP })
      set.add({ title: 'five' })
      set.lastRun = 'three'

      const migs = upMigrations(set)
      assert.strictEqual(migs.length, 3)
      assert.strictEqual(migs[0].title, 'two')
      assert.strictEqual(migs[1].title, 'three')
      assert.strictEqual(migs[2].title, 'five')
    })
  })

  describe('down', () => {
    it('should get down migrations from a set', () => {
      const set = new MigrationSet()
      set.add({ title: 'one', state: Migration.STATES.RAN_UP })
      set.add({ title: 'two', state: Migration.STATES.RAN_UP })
      set.add({ title: 'three', state: Migration.STATES.RAN_UP })
      set.lastRun = 'three'

      const migs = downMigrations(set)
      assert.strictEqual(migs.length, 3)
      assert.strictEqual(migs[0].title, 'three')
      assert.strictEqual(migs[1].title, 'two')
      assert.strictEqual(migs[2].title, 'one')
    })
    it('should get down migrations from a paritially run set', () => {
      const set = new MigrationSet()
      set.add({ title: 'one', state: Migration.STATES.RAN_UP })
      set.add({ title: 'two', state: Migration.STATES.RAN_UP })
      set.add({ title: 'three' })
      set.lastRun = 'two'

      const migs = downMigrations(set)
      assert.strictEqual(migs.length, 2)
      assert.strictEqual(migs[0].title, 'two')
      assert.strictEqual(migs[1].title, 'one')
    })
    it('should get migrations from a set run out of order', () => {
      const set = new MigrationSet()
      set.add({ title: 'one', state: Migration.STATES.RAN_UP })
      set.add({ title: 'two' })
      set.add({ title: 'three', state: Migration.STATES.RAN_DOWN })
      set.add({ title: 'four', state: Migration.STATES.RAN_UP })
      set.add({ title: 'five' })
      set.lastRun = 'four'

      const migs = downMigrations(set)
      assert.strictEqual(migs.length, 2)
      assert.strictEqual(migs[0].title, 'four')
      assert.strictEqual(migs[1].title, 'one')
    })
  })
})
