import { Observable } from "rxjs";

export interface EffectConfig {
  dispatch?: boolean;
  id?: string;
}

export interface Effect<T = any> {
  id: string;
  observable: Observable<T>;
  dispatch: boolean;
}

export function createEffect<T = any>(
  observableFactory: () => Observable<T>,
  config: EffectConfig = {}
): Effect<T> {
  const { dispatch = true, id = "effect" } = config;

  return {
    id,
    observable: observableFactory(),
    dispatch,
  };
}
