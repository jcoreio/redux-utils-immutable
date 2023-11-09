# mindfront-redux-utils-immutable

[![Build Status](https://travis-ci.org/jcoreio/redux-utils-immutable.svg?branch=master)](https://travis-ci.org/jcoreio/redux-utils-immutable)
[![Coverage Status](https://codecov.io/gh/jcoreio/redux-utils-immutable/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/redux-utils-immutable)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/mindfront-redux-utils-immutable.svg)](https://badge.fury.io/js/mindfront-redux-utils-immutable)

## Legacy build note

If you are building for legacy browsers with webpack or a similar bundler, make
sure to add a rule to transpile this package to ES5.

## combineReducers

```es6
import { combineReducers } from 'mindfront-redux-utils-immutable'
```

```es6
function combineReducers(
  reducers: {[key: any]: Reducer},
  createInitialState?: (initialValues: Object) => Immutable.Collection.Keyed | Record = Immutable.Map
): Reducer
```

Like `combineReducers` from `redux`, except that the combined reducer operates on immutable keyed collections or
records.

Unlike the `combineReducers` implementation from the `redux-immutable` package, this implementation is
highly optimized. If multiple reducers have `actionHandlers`, they will be recombined so that all mutations for
one of those actions are done inside a single `state.withMutations` call.

As an example, let's say we have the following reducer:

```js
const setUser = (oldUser, action) => action.newUser
const updateUser = (user, action) => user.merge(action.payload)
const incUserChangeCount = (count = 0) => count + 1

const reducer = combineReducers({
  user: createReducer({
    [SET_USER]: setUser,
    [UPDATE_USER]: updateUser,
  }),
  userChangeCount: createReducer({
    [SET_USER]: incUserChangeCount,
  }),
})
```

`combineReducers` essentially works like the following:

```js
const reducer = createReducer({
  [SET_USER]: (state, action) =>
    state.withMutations((state) => {
      state.update('user', (oldUser) => setUser(oldUser, action))
      state.update('userChangeCount', (count) =>
        incUserChangeCount(count, action)
      )
    }),
  [UPDATE_USER]: (state, action) =>
    state.update('user', (user) => updateUser(user, action)),
})
```

### Caveats

Due to this optimization, unlike other `combineReducers` implementations, if you call the combined reducer with an
empty collection, it will not set the initial values for any reducers skipped by optimization. For example:

```es6
import { Map } from 'immutable'
import { createReducer } from 'mindfront-redux-utils'
import { combineReducers } from 'mindfront-redux-utils-immutable'

const reducer = combineReducers({
  a: createReducer(0, {
    a: (state) => state + 1,
    ab: (state) => state + 1,
  }),
  b: createReducer(0, {
    ab: (state) => state + 1,
    b: (state) => state + 1,
  }),
})

reducer(undefined, { type: 'a' }) // Map({a: 1, b: 0})
reducer(Map(), { type: 'a' }) // Map({a: 1})
reducer(Map(), { type: 'b' }) // Map({b: 1})
reducer(Map(), { type: 'ab' }) // Map({a: 1, b: 1})
```

As long as you handle missing keys everywhere in your code, this is not a problem.

Another workaround is to use `Record`s with the desired initial values in the `Record` constructor:

```es6
import { Record } from 'immutable'
import { createReducer } from 'mindfront-redux-utils'
import { combineReducers } from 'mindfront-redux-utils-immutable'

const MyRecord = Record({ a: 0, b: 0 })

const reducer = combineReducers(
  {
    a: createReducer(0, {
      a: (state) => state + 1,
      ab: (state) => state + 1,
    }),
    b: createReducer(0, {
      ab: (state) => state + 1,
      b: (state) => state + 1,
    }),
  },
  MyRecord
)

reducer(undefined, { type: 'a' }) // MyRecord({a: 1, b: 0})
reducer(MyRecord(), { type: 'a' }) // MyRecord({a: 1, b: 0})
reducer(MyRecord(), { type: 'b' }) // MyRecord({b: 1, b: 0})
reducer(MyRecord(), { type: 'ab' }) // MyRecord({a: 1, b: 1})
```

## subpathReducer

```es6
import { subpathReducer } from 'mindfront-redux-utils-immutable'
```

```es6
function subpathReducer(
  path: Array<any> | (action: Action) => Array<any>,
  initialState?: Immutable.Collection.Keyed | Record
): Reducer => Reducer
```

Creates a reducer that applies the decorated reducer at the given `path` within the `state`. This is basically
equivalent to `(state = initialState, action) => state.updateIn(path, reducer)` except that if the decorated reducer
has `actionHandlers`, the created reducer will have corresponding `actionHandlers` so that other utils can optimize it.

If you pass a function for `path`, `subpathReducer` will get the actual path by calling `path(action)` for each
`action`.
