import { expect } from 'chai'
import { Map, Record } from 'immutable'

import combineReducers from '../src/combineReducers'
import { createReducer } from 'mindfront-redux-utils'

const createBasicReducer = (...args) => {
  const reducer = createReducer(...args)
  delete reducer.initialState
  delete reducer.actionHandlers
  return reducer
}

describe('combineReducers', () => {
  it('with no reducers', () => {
    expect(combineReducers({})(undefined, {})).to.equal(Map())
  })
  it('basic test', () => {
    const increment = (state = 0) => state + 1

    const reducer = combineReducers({
      a: createReducer(0, {
        a: increment,
        ab: increment,
        abc: increment,
      }),
      b: createReducer(0, {
        ab: increment,
        abc: increment,
      }),
      c: createReducer(0, {
        abc: increment,
      }),
    })

    expect(reducer(undefined, { type: 'a' })).to.equal(
      Map({ a: 1, b: 0, c: 0 })
    )
    expect(reducer(undefined, { type: 'ab' })).to.equal(
      Map({ a: 1, b: 1, c: 0 })
    )
    expect(reducer(undefined, { type: 'abc' })).to.equal(
      Map({ a: 1, b: 1, c: 1 })
    )
  })
  it('on reducers without actionHandlers', () => {
    const increment = (state = 0) => state + 1

    const reducer = combineReducers({
      a: createBasicReducer(0, {
        a: increment,
        ab: increment,
        abc: increment,
      }),
      b: createBasicReducer(0, {
        ab: increment,
        abc: increment,
      }),
      c: createBasicReducer(0, {
        abc: increment,
      }),
    })

    expect(reducer(undefined, { type: 'a' })).to.equal(
      Map({ a: 1, b: 0, c: 0 })
    )
    expect(reducer(undefined, { type: 'ab' })).to.equal(
      Map({ a: 1, b: 1, c: 0 })
    )
    expect(reducer(undefined, { type: 'abc' })).to.equal(
      Map({ a: 1, b: 1, c: 1 })
    )
  })
  it('on mix of reducers with and without actionHandlers', () => {
    const increment = (state = 0) => state + 1

    const reducer = combineReducers({
      a: createReducer(0, {
        a: increment,
        ab: increment,
        abc: increment,
        abcd: increment,
      }),
      b: createReducer(0, {
        ab: increment,
        abc: increment,
        abcd: increment,
      }),
      c: createBasicReducer(0, {
        abc: increment,
        abcd: increment,
      }),
      d: createBasicReducer(0, {
        abcd: increment,
      }),
    })

    expect(reducer(undefined, { type: 'a' })).to.equal(
      Map({ a: 1, b: 0, c: 0, d: 0 })
    )
    expect(reducer(undefined, { type: 'ab' })).to.equal(
      Map({ a: 1, b: 1, c: 0, d: 0 })
    )
    expect(reducer(undefined, { type: 'abc' })).to.equal(
      Map({ a: 1, b: 1, c: 1, d: 0 })
    )
    expect(reducer(undefined, { type: 'abcd' })).to.equal(
      Map({ a: 1, b: 1, c: 1, d: 1 })
    )
    expect(reducer(Map({ a: 5, b: 6, c: 7, d: 8 }), { type: 'abcd' })).to.equal(
      Map({ a: 6, b: 7, c: 8, d: 9 })
    )
  })
  it('missing initial value edge case', () => {
    const increment = (state = 0) => state + 1

    const reducer = combineReducers({
      a: createReducer(0, {
        a: increment,
        ab: increment,
        abc: increment,
      }),
      b: createReducer(0, {
        ab: increment,
        abc: increment,
      }),
    })

    expect(reducer(Map({}), { type: 'a' })).to.equal(Map({ a: 1 }))
    expect(reducer(Map({ c: 0 }), { type: 'ab' })).to.equal(
      Map({ a: 1, b: 1, c: 0 })
    )
  })
  it('with createInitialState', () => {
    const Counters = Record({ a: 0, b: 0, c: 0 })

    const increment = (state = 0) => state + 1

    const reducer = combineReducers(
      {
        a: createReducer(0, {
          a: increment,
          ab: increment,
          abc: increment,
        }),
        b: createReducer(0, {
          ab: increment,
          abc: increment,
        }),
        c: createReducer(0, {
          abc: increment,
        }),
      },
      Counters
    )

    expect(reducer(undefined, { type: 'a' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 0, c: 0 }).toJS()
    )
    expect(reducer(undefined, { type: 'ab' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 1, c: 0 }).toJS()
    )
    expect(reducer(undefined, { type: 'abc' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 1, c: 1 }).toJS()
    )
    expect(reducer(Counters(), { type: 'a' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 0, c: 0 }).toJS()
    )
    expect(reducer(Counters(), { type: 'ab' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 1, c: 0 }).toJS()
    )
    expect(reducer(Counters(), { type: 'abc' }).toJS()).to.deep.equal(
      Counters({ a: 1, b: 1, c: 1 }).toJS()
    )
  })
})
