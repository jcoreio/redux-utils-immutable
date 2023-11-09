import { AnyAction, Reducer } from 'redux'
import { Map as iMap, RecordOf } from 'immutable'

type RecordProps<S extends RecordOf<any>> = S extends RecordOf<infer P>
  ? P
  : never

type MapKey<S extends iMap<any, any>> = S extends iMap<infer K, any> ? K : never
type MapValue<S extends iMap<any, any>> = S extends iMap<any, infer V>
  ? V
  : never

export default function combineReducers<
  S extends RecordOf<any> = RecordOf<any>,
  A extends AnyAction = AnyAction
>(
  reducers: {
    [K in keyof RecordProps<S>]: (
      state: RecordProps<S>[K],
      action: A
    ) => RecordProps<S>[K]
  },
  createInitialState: (props: RecordProps<S>) => S
): Reducer<S, A>
export default function combineReducers<
  S extends iMap<any, any> = iMap<any, any>,
  A extends AnyAction = AnyAction
>(
  reducers: {
    [K in MapKey<S>]: (state: MapValue<S>, action: A) => MapValue<S>
  },
  createInitialState: (props: Record<MapKey<S>, MapValue<S>>) => S
): Reducer<S, A>
