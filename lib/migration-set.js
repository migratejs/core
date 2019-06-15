'use strict'
const Migration = require('./migration')

module.exports = function MigrationSet (_migrations, sortFnc) {
  let sorted = true
  let lastRun = null
  let migrations = []
  add(_migrations)

  // Add to migrations
  function add (mig) {
    if (!mig) {
      return
    }

    // Add an array of migrations
    if (Array.isArray(mig)) {
      return mig.map(add)
    }

    // Adding single migration
    let migration = mig
    if (!(migration instanceof Migration)) {
      migration = new Migration(migration)
    }
    migrations.push(migration)
    sorted = false
    return migration
  }

  // Sort by sort function if dirty
  function sort () {
    if (sorted) {
      return
    }
    migrations.sort(sortFnc)
    sorted = true
    return p
  }

  function indexOf (title) {
    sort()

    for (let i = 0; i < migrations.length; ++i) {
      if (migrations[i].title === title) {
        return i
      }
    }
    return -1
  }

  function filter (fnc) {
    sort()
    return migrations.filter(fnc)
  }

  const p = new Proxy({}, {
    get: (target, prop) => {
      // Accessable fields
      switch (prop) {
        case 'lastRun':
          return lastRun
        case 'add':
          return add
        case 'indexOf':
          return indexOf
        case 'sort':
          return sort
        case 'filter':
          return filter
        case 'size':
          return migrations.length
        case Symbol.iterator:
          return () => {
            return {
              _i: -1,
              next: function () {
                sort()
                this._i++
                if (migrations[this._i]) {
                  return { value: migrations[this._i], done: false }
                } else {
                  return { done: true }
                }
              }
            }
          }
      }

      if (typeof prop === 'string') {
        // Get by index
        const i = parseInt(prop, 10)
        if (!isNaN(i)) {
          return migrations[i]
        }

        // Get by title
        return migrations.find((m) => m.title === prop)
      }

      return undefined
    },
    has: (target, prop) => {
      if (typeof prop === 'string') {
        // Get by index
        const i = parseInt(prop, 10)
        if (!isNaN(i)) {
          return !!migrations[i]
        }

        // Get by title
        return !!migrations.find((m) => m.title === prop)
      }

      return false
    },
    set: (target, prop, value) => {
      if (prop === 'lastRun') {
        if (!migrations.find((m) => m.title === value)) {
          throw new Error(`lastRun does not exist in MigrationSet: ${value}`)
        }
        lastRun = value
        return true
      }

      // dont allow calling set on other keys
      return false
    },
    ownKeys: () => {
      return migrations.map((m) => m.title)
    }
  })

  return p
}
