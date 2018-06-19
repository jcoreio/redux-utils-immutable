import { reduce, forEach, mapValues, size } from "lodash"
import {Map} from 'immutable'
import {createReducer, composeReducers} from 'mindfront-redux-utils'

export default function combineReducers(reducers, createInitialState = Map) {
  const actionHandlers = {}
  const otherReducers = {}
  const initialStateObj = {}

  // regroup reducers that have actionHandlers:
  //   from: prop name -> action type -> reducer
  //     to: action type -> prop name -> reducer
  // put reducers without actionHandlers into a prop name -> reducer map

  forEach(reducers, (reducer, key) => {
    initialStateObj[key] = reducer(undefined, {})
    if (reducer.actionHandlers) {
      forEach(reducer.actionHandlers, (actionHandler, type) => {
        (actionHandlers[type] || (actionHandlers[type] = {}))[key] = actionHandler
      })
    } else otherReducers[key] = reducer
  })
  const initialState = createInitialState(initialStateObj)

  // now we can create a more efficient reducer for each action type
  // and one more efficient reducer for the otherReducers

  // creates an efficient reducer from a prop name -> reducer map
  const combineBase = reducers => {
    let result
    if (size(reducers) > 1) {
      // we have to update multiple keys; use state.withMutations
      result = (state = initialState, action) => state.withMutations(mutableState => reduce(
        reducers,
        (nextState, reducer, key) => nextState.update(key, value => reducer(value, action)),
        mutableState)
      )
    } else {
      // we only have to update one key; use state.update
      const key = Object.keys(reducers)[0]
      const reducer = reducers[key]
      result = (state = initialState, action) => state.update(key, value => reducer(value, action))
    }
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
  if (actionHandlerReducer) return actionHandlerReducer
  if (otherReducer) return otherReducer
  return (state = initialState) => state
}


