/* eslint-disable @typescript-eslint/no-unused-vars */
import { Map as iMap, RecordOf, Record as makeRecord } from 'immutable'
import { Reducer } from 'redux'
import combineReducers from '../src/combineReducers'
import { subpathReducer } from '../src'

export type AuthFields = {
  error: string | null | undefined
}
export const authInit: AuthFields = {
  error: null,
}
export const AuthRecord = makeRecord(authInit)
export type Auth = RecordOf<AuthFields>

export const LOGIN = 'login'
export const LOGOUT = 'logout'

export type LoginAction = {
  type: typeof LOGIN
  payload: {
    password: string
  }
}
export type LogoutAction = {
  type: typeof LOGOUT
  error?: true
  payload?: {
    error?: string
  }
}

export type AuthAction = LoginAction | LogoutAction

const reducer1: Reducer<Auth, AuthAction> = combineReducers<Auth, AuthAction>(
  {
    error: (state: string | null | undefined, action: AuthAction) =>
      action.type === LOGOUT ? action.payload?.error : state,
  },
  AuthRecord
)

const reducer2: Reducer<
  iMap<'a' | 'b', string | null | undefined>,
  AuthAction
> = combineReducers<iMap<'a' | 'b', string | null | undefined>, AuthAction>(
  {
    a: (state: string | null | undefined, action: AuthAction) =>
      action.type === LOGOUT ? action.payload?.error : state,
    b: (state: string | null | undefined, action: AuthAction) =>
      action.type === LOGOUT ? action.payload?.error : state,
  },
  iMap
)

const reducer3 = subpathReducer<iMap<string, Auth>, Auth>(
  ['auth'],
  AuthRecord()
)((state: Auth, action: AuthAction) => state)
