import chai, { expect } from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map, fromJS } from 'immutable'
import { createReducer } from 'mindfront-redux-utils'
import subpathReducer from '../src/subpathReducer'

chai.use(chaiImmutable)

describe('subpathReducer', () => {
  const increment = (state = 0, action) =>
    action.type === 'INCREMENT' ? state + 1 : state

  it('works for reducer without actionHandlers', () => {
    const reducer = subpathReducer(['a', 'b'], Map())(increment)

    expect(reducer(undefined, {})).to.equal(fromJS({ a: { b: 0 } }))
    expect(reducer(undefined, { type: 'INCREMENT' })).to.equal(
      fromJS({ a: { b: 1 } })
    )
    expect(reducer(fromJS({ a: { b: 2 } }), { type: 'INCREMENT' })).to.equal(
      fromJS({ a: { b: 3 } })
    )
  })
  it('works for reducer with actionHandlers', () => {
    const reducer = subpathReducer(['a', 'b'], Map())(
      createReducer(0, {
        INCREMENT: state => state + 1,
      })
    )

    expect(reducer.actionHandlers.INCREMENT).to.be.an.instanceof(Function)

    expect(reducer(undefined, {})).to.equal(fromJS({}))
    expect(reducer(undefined, { type: 'INCREMENT' })).to.equal(
      fromJS({ a: { b: 1 } })
    )
    expect(reducer(fromJS({ a: { b: 2 } }), { type: 'INCREMENT' })).to.equal(
      fromJS({ a: { b: 3 } })
    )
  })
  it("calls subpath with action if it's a function", () => {
    const reducer = subpathReducer(action => action.meta.reduxPath, Map())(
      createReducer(0, {
        INCREMENT: state => state + 1,
      })
    )

    expect(reducer.actionHandlers.INCREMENT).to.be.an.instanceof(Function)

    expect(reducer(undefined, {})).to.equal(fromJS({}))
    expect(
      reducer(undefined, { type: 'INCREMENT', meta: { reduxPath: ['a', 'b'] } })
    ).to.equal(fromJS({ a: { b: 1 } }))
    expect(
      reducer(fromJS({ a: 2 }), {
        type: 'INCREMENT',
        meta: { reduxPath: ['a'] },
      })
    ).to.equal(fromJS({ a: 3 }))
  })
})
