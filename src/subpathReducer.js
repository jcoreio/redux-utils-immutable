import {createReducer} from 'mindfront-redux-utils'
import mapValues from 'lodash.mapvalues'

export default function subpathReducer(subpath, initialState) {
  return reducer => {
    const {actionHandlers} = reducer
    if (actionHandlers instanceof Object) {
      const initialSubState = reducer.initialState
      return createReducer(initialState, mapValues(actionHandlers, reducer => (state, action) =>
        state.updateIn(subpath, (substate = initialSubState) => reducer(substate, action))
      ))
    }
    return (state = initialState, action) =>
      state.updateIn(subpath, substate => reducer(substate, action))
  }
}

