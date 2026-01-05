/**
 * Musicians App - Framework-Agnostic RxJS Effects Version
 *
 * Converted from NgRx Effects + Angular to pure RxJS/TypeScript
 *
 * Original: https://github.com/marko-stanimirovic/ngrx-musicians-app
 */

import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, exhaustMap, map, catchError } from "rxjs/operators";

// Import our framework-agnostic Effects system
import { createAction, ofType } from "./core/actions";
import { createEffect } from "./core/effect-creator";
import { mapResponse } from "./core/operators";
import { createEffectsSystem } from "./core/effects-runner";

// ============================================================================
// 1. MODEL
// ============================================================================

export interface Musician {
  id: number;
  name: string;
  photoUrl: string;
}

// ============================================================================
// 2. MOCK DATA (simulates backend API)
// ============================================================================

const musiciansMock: Musician[] = [
  {
    id: 1,
    name: "Eric Clapton",
    photoUrl: "/assets/musicians/eric-clapton.jpg",
  },
  {
    id: 2,
    name: "Stevie Ray Vaughan",
    photoUrl: "/assets/musicians/srv.jpg",
  },
  {
    id: 3,
    name: "B.B. King",
    photoUrl: "/assets/musicians/bb-king.jpg",
  },
  {
    id: 4,
    name: "Gary Moore",
    photoUrl: "/assets/musicians/gary-moore.jpg",
  },
  {
    id: 5,
    name: "Jimi Hendrix",
    photoUrl: "/assets/musicians/jimi-hendrix.jpg",
  },
  {
    id: 6,
    name: "Keith Richards",
    photoUrl: "/assets/musicians/keith-richards.jpg",
  },
];

// ============================================================================
// 3. SERVICE (replaces Angular @Injectable service)
// ============================================================================

class MusiciansService {
  /**
   * Simulates API call with 1 second delay
   */
  getAll(): Observable<Musician[]> {
    return of(musiciansMock).pipe(delay(1000));
  }
}

const musiciansService = new MusiciansService();

// ============================================================================
// 4. ACTIONS
// ============================================================================

// Page Actions (User Interactions)
export const musiciansPageOpened = createAction<"musicians/page/opened">(
  "musicians/page/opened"
);
export const musiciansQueryChanged = createAction<
  "musicians/page/queryChanged",
  { query: string }
>("musicians/page/queryChanged");

// API Actions (Results from backend)
export const musiciansLoadedSuccess = createAction<
  "musicians/api/loadedSuccess",
  { musicians: Musician[] }
>("musicians/api/loadedSuccess");
export const musiciansLoadedFailure = createAction<
  "musicians/api/loadedFailure",
  { message: string }
>("musicians/api/loadedFailure");

// ============================================================================
// 5. STATE MANAGEMENT
// ============================================================================

interface MusiciansState {
  musicians: Musician[];
  isLoading: boolean;
  query: string;
}

const initialState: MusiciansState = {
  musicians: [],
  isLoading: false,
  query: "",
};

// State as BehaviorSubject (replaces NgRx Store)
const state$ = new BehaviorSubject<MusiciansState>(initialState);

/**
 * Update state immutably
 */
function updateState(updater: (state: MusiciansState) => MusiciansState): void {
  state$.next(updater(state$.value));
}

/**
 * Selectors - query current state
 */
export const selectMusicians = () => state$.value.musicians;
export const selectIsLoading = () => state$.value.isLoading;
export const selectQuery = () => state$.value.query;
export const selectFilteredMusicians = () => {
  const musicians = selectMusicians();
  const query = selectQuery().toLowerCase();
  return musicians.filter((musician) =>
    musician.name.toLowerCase().includes(query)
  );
};

// Expose state as observable for reactive subscriptions
export const musiciansState$ = state$.asObservable();

// ============================================================================
// 6. REDUCER LOGIC (handled via updateState + action listeners)
// ============================================================================

/**
 * Instead of a traditional reducer, we handle state updates in effects
 * or via explicit state updaters called by the UI
 */

export function handlePageOpened(): void {
  updateState((state) => ({ ...state, isLoading: true }));
}

export function handleQueryChanged(query: string): void {
  console.log("Updating query state to:", query);
  updateState((state) => ({ ...state, query }));
}

export function handleMusiciansLoadedSuccess(musicians: Musician[]): void {
  updateState((state) => ({
    ...state,
    musicians,
    isLoading: false,
  }));
}

export function handleMusiciansLoadedFailure(): void {
  updateState((state) => ({ ...state, isLoading: false }));
}

// ============================================================================
// 7. EFFECTS SYSTEM SETUP
// ============================================================================

const { actions$, dispatcher, runner } = createEffectsSystem({
  debug: true,
  errorHandler: (error, effectId) => {
    console.error(`❌ Error in ${effectId}:`, error);
  },
});

// ============================================================================
// 8. EFFECTS
// ============================================================================

/**
 * Effect: Load All Musicians
 *
 * Listens for: musiciansPageOpened
 * Triggers: API call to load musicians
 * Dispatches: musiciansLoadedSuccess | musiciansLoadedFailure
 *
 * Original NgRx Effect:
 * ```typescript
 * export const loadAllMusicians = createEffect(
 *   (actions$ = inject(Actions), musiciansService = inject(MusiciansService)) => {
 *     return actions$.pipe(
 *       ofType(musiciansPageActions.opened),
 *       exhaustMap(() => {
 *         return musiciansService.getAll().pipe(
 *           map((musicians) =>
 *             musiciansApiActions.musiciansLoadedSuccess({ musicians })
 *           ),
 *           catchError(({ message }: { message: string }) =>
 *             of(musiciansApiActions.musiciansLoadedFailure({ message }))
 *           )
 *         );
 *       })
 *     );
 *   },
 *   { functional: true }
 * );
 * ```
 */
export const loadAllMusiciansEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(musiciansPageOpened),
      exhaustMap(() =>
        musiciansService.getAll().pipe(
          mapResponse({
            next: (musicians) => musiciansLoadedSuccess({ musicians }),
            error: (error: Error) =>
              musiciansLoadedFailure({ message: error.message }),
          })
        )
      )
    ),
  { id: "load-all-musicians" }
);

/**
 * Effect: Update Loading State
 *
 * Side effect that updates state when page opens
 */
export const updateLoadingStateEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(musiciansPageOpened),
      map(() => {
        handlePageOpened();
        return null; // No action to dispatch
      })
    ),
  { dispatch: false, id: "update-loading-state" }
);

/**
 * Effect: Update Musicians State on Success
 *
 * Side effect that updates state when musicians are loaded
 */
export const updateMusiciansStateEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(musiciansLoadedSuccess),
      map((action) => {
        handleMusiciansLoadedSuccess(action.payload.musicians);
        return null;
      })
    ),
  { dispatch: false, id: "update-musicians-state" }
);

/**
 * Effect: Update State on Failure
 *
 * Side effect that updates state when loading fails
 */
export const updateFailureStateEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(musiciansLoadedFailure),
      map(() => {
        handleMusiciansLoadedFailure();
        return null;
      })
    ),
  { dispatch: false, id: "update-failure-state" }
);

/**
 * Effect: Update Query State
 *
 * Side effect that updates state when query changes
 */
export const updateQueryStateEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(musiciansQueryChanged),
      map((action) => {
        console.log(
          "Effect received queryChanged action:",
          action.payload.query
        );
        handleQueryChanged(action.payload.query);
        return null;
      })
    ),
  { dispatch: false, id: "update-query-state" }
);

/**
 * Effect: Log All Actions (Analytics/Debugging)
 *
 * Non-dispatching effect that logs all actions
 */
export const loggingEffect = createEffect(
  () =>
    actions$.pipe(
      ofType(
        musiciansPageOpened,
        musiciansQueryChanged,
        musiciansLoadedSuccess,
        musiciansLoadedFailure
      ),
      map((action) => {
        console.log("📊 Action:", action.type, action);
        return null;
      })
    ),
  { dispatch: false, id: "logging" }
);

// ============================================================================
// 9. REGISTER AND START EFFECTS
// ============================================================================

runner.registerEffects({
  loadAllMusicians: loadAllMusiciansEffect,
  updateLoadingState: updateLoadingStateEffect,
  updateMusiciansState: updateMusiciansStateEffect,
  updateFailureState: updateFailureStateEffect,
  updateQueryState: updateQueryStateEffect,
  logging: loggingEffect,
});

// runner.start(); // Remove auto-start

/**
 * Initialize the effects system
 */
export function initializeEffects(): void {
  runner.start();
}

// ============================================================================
// 10. PUBLIC API
// ============================================================================

/**
 * Dispatch actions (replaces Angular component methods)
 */
export const dispatch = {
  pageOpened: () => dispatcher.next(musiciansPageOpened()),
  queryChanged: (query: string) => {
    console.log("Dispatching queryChanged action with:", query);
    dispatcher.next(musiciansQueryChanged({ query }));
  },
};

/**
 * Subscribe to state changes (replaces Angular Store selectors)
 */
export const subscribe = {
  toState: (callback: (state: MusiciansState) => void) =>
    state$.subscribe(callback),

  toMusicians: (callback: (musicians: Musician[]) => void) =>
    state$.subscribe((state) => callback(state.musicians)),

  toFilteredMusicians: (callback: (musicians: Musician[]) => void) =>
    state$.subscribe((state) => {
      const query = state.query.toLowerCase();
      const filtered = state.musicians.filter((m) =>
        m.name.toLowerCase().includes(query)
      );
      callback(filtered);
    }),

  toIsLoading: (callback: (isLoading: boolean) => void) =>
    state$.subscribe((state) => callback(state.isLoading)),

  toQuery: (callback: (query: string) => void) =>
    state$.subscribe((state) => callback(state.query)),
};

/**
 * Cleanup function
 */
export function cleanup(): void {
  runner.stop();
}

// ============================================================================
// 11. EXPORT FOR EXTERNAL USE
// ============================================================================

export const musiciansApp = {
  // State access
  state$: musiciansState$,
  selectMusicians,
  selectIsLoading,
  selectQuery,
  selectFilteredMusicians,

  // Actions
  dispatch,

  // Subscriptions
  subscribe,

  // System control
  initializeEffects,
  cleanup,

  // Direct access to runner for advanced use
  runner,
  actions$,
  dispatcher,
};

/**
 * Example 1: Initialize the app
 */
export function initializeApp(): void {
  console.log("🎸 Musicians App Initialized");
  // Note: Call initializeEffects() first, then dispatch.pageOpened()
}

/**
 * Example 2: Search for musicians
 */
export function searchMusicians(query: string): void {
  dispatch.queryChanged(query);
}

/**
 * Example 3: Subscribe to filtered musicians
 */
export function watchFilteredMusicians(
  callback: (musicians: Musician[]) => void
): () => void {
  const subscription = subscribe.toFilteredMusicians(callback);

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

/**
 * Example 4: Get current state synchronously
 */
export function getCurrentState(): MusiciansState {
  return state$.value;
}
