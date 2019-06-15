'use strict'
const { describe, it } = require('mocha')
const assert = require('assert')
const Migration = require('../lib/migration')
const MigrationSet = require('../lib/migration-set')

describe('MigrationSet', () => {
  it('should create a migration set and add migrations', () => {
    const set = new MigrationSet()
    assert.strictEqual(set.lastRun, null)
    assert.strictEqual(set.size, 0)

    // Add a pre-created migration
    const mig1 = new Migration({ title: 'test' })
    assert.strictEqual(set.add(mig1), mig1)
    assert.strictEqual(set.size, 1)
    assert.strictEqual(set['test'], mig1)

    // Create a migration instance from object and return it
    const mig2 = set.add({ title: 'more' })
    assert.strictEqual(set.size, 2)
    assert.strictEqual(set[1], mig2)
    assert.strictEqual(set['more'], mig2)
  })

  it('should add multiple migrations', () => {
    const set = new MigrationSet([{ title: 'one' }, { title: 'two' }])
    assert.strictEqual(set.size, 2)
    assert.strictEqual(set[0].title, 'one')
    assert.strictEqual(set[1].title, 'two')

    set.add([{ title: 'three' }, new Migration({ title: 'four' })])
    assert.strictEqual(set.size, 4)
    assert.strictEqual(set[2].title, 'three')
    assert.strictEqual(set[3].title, 'four')
  })

  it('should get the index of a migration by title', () => {
    const set = new MigrationSet([{ title: 'one' }, { title: 'two' }])
    assert.strictEqual(set.indexOf('one'), 0)
    assert.strictEqual(set.indexOf('two'), 1)
    assert.strictEqual(set.indexOf('three'), -1)
  })

  it('should be iterable', () => {
    const set = new MigrationSet([{ title: 'one' }, { title: 'two' }])
    let i = 0
    for (let m of set) {
      if (i === 0) {
        assert.strictEqual(m.title, 'one')
      } else {
        assert.strictEqual(m.title, 'two')
      }
      i++
    }
    assert.strictEqual(i, 2)
  })
})
