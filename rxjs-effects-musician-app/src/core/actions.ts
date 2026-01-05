import { Observable, OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

export interface Action<T = any> {
  type: string;
  payload?: T;
}

export type ActionCreator<T extends string = string, P = undefined> =
  ((payload?: P) => Action<P>) & { type: T };

export function createAction<T extends string>(
  type: T
): () => Action<undefined>;
export function createAction<T extends string, P>(
  type: T
): (payload: P) => Action<P>;
export function createAction<T extends string, P = undefined>(type: T) {
  const actionCreator = (payload?: P) => ({
    type,
    payload,
  });
  return Object.assign(actionCreator, { type });
}

export function ofType<T extends Action>(
  ...allowedTypes: Array<string | ActionCreator>
): OperatorFunction<T, T> {
  const allowed = allowedTypes.map((allowedType) =>
    typeof allowedType === "string" ? allowedType : allowedType.type
  );
  return filter((action: T) => allowed.includes(action.type));
}
