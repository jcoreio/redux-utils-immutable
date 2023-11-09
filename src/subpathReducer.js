import { createReducer } from 'mindfront-redux-utils'
import { mapValues } from 'lodash'

export default function subpathReducer(subpath, initialState) {
  if (typeof subpath !== 'function') {
    const fixedSubpath = subpath
    subpath = () => fixedSubpath
  }
  return (reducer) => {
    const { actionHandlers } = reducer
    if (actionHandlers instanceof Object) {
      const initialSubState = reducer.initialState
      return createReducer(
        initialState,
        mapValues(
          actionHandlers,
          (reducer) => (state, action) =>
            state.updateIn(subpath(action), (substate = initialSubState) =>
              reducer(substate, action)
            )
        )
      )
    }
    return (state = initialState, action) =>
      state.updateIn(subpath(action), (substate) => reducer(substate, action))
  }
}
