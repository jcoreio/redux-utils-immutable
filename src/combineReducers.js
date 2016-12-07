import reduce from 'lodash.reduce'
import forEach from 'lodash.foreach'
import mapValues from 'lodash.mapvalues'
import size from 'lodash.size'
import {Map} from 'immutable'
import {createReducer, composeReducers} from 'mindfront-redux-utils'

export default function combineReducers(reducers, createInitialState = Map) {
  const actionHandlers = {}
  const otherReducers = {}
  const initialStateObj = {}
  forEach(reducers, (reducer, key) => {
    initialStateObj[key] = reducer(undefined, {})
    if (reducer.actionHandlers) {
      // invert from prop name -> action type -> reducer
      //          to action type -> prop name -> reducer
      forEach(reducer.actionHandlers, (actionHandler, type) => {
        (actionHandlers[type] || (actionHandlers[type] = {}))[key] = actionHandler
      })
    } else otherReducers[key] = reducer
  })
  const initialState = createInitialState(initialStateObj)

  const combineBase = reducers => {
    const result = (state = initialState, action) => state.withMutations(mutableState => reduce(
      reducers,
      (nextState, reducer, key) => nextState.update(key, value => reducer(value, action)),
      mutableState)
    )
    result.domainHandlers = reducers
    return result
  }

  const actionHandlerReducer = size(actionHandlers)
    ? createReducer(initialState, mapValues(actionHandlers, combineBase))
    : undefined

  const otherReducer = size(otherReducers)
    ? combineBase(otherReducers)
    : undefined

  if (actionHandlerReducer && otherReducer) return composeReducers(actionHandlerReducer, otherReducer)
  else if (actionHandlerReducer) return actionHandlerReducer
  else if (otherReducer) return otherReducer
  else return (state = initialState) => state
}


