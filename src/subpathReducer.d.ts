import { AnyAction } from 'redux'

interface Updatable {
  updateIn(
    subpath: Iterable<unknown>,
    updater: (value: unknown) => unknown
  ): this
}

export default function subpathReducer<S extends Updatable, V = unknown>(
  subpath: Iterable<unknown>,
  initialState: V
): <A extends AnyAction = AnyAction>(
  reducer: (state: V, action: A) => V
) => (state: S, action: A) => S
