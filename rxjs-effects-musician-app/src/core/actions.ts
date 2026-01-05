import { Observable, OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

export interface Action<T = any> {
  type: string;
  payload?: T;
}

export function createAction<T extends string>(
  type: T
): () => Action<undefined>;
export function createAction<T extends string, P>(
  type: T
): (payload: P) => Action<P>;
export function createAction<T extends string, P = undefined>(type: T) {
  return (payload?: P) => ({
    type,
    payload,
  });
}

export function ofType<T extends Action>(
  ...allowedTypes: string[]
): OperatorFunction<T, T> {
  return filter((action: T) => allowedTypes.includes(action.type));
}
