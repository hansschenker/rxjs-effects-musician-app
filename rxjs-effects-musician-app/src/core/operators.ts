import { Observable, OperatorFunction, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

export interface MapResponseConfig<T, R> {
  next: (value: T) => R;
  error: (error: any) => R;
}

export function mapResponse<T, R>(
  config: MapResponseConfig<T, R>
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    source.pipe(
      map(config.next),
      catchError((error) => of(config.error(error)))
    );
}
