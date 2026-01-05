import { exhaustMap, map } from "rxjs/operators";
import { createEffect } from "../core/effect-creator";
import { ofType } from "../core/actions";
import { mapResponse } from "../core/operators";
import { createEffectsSystem } from "../core/effects-runner";
import { musiciansService } from "../services/musicians.service";
import {
    musiciansPageOpened,
    musiciansLoadedSuccess,
    musiciansLoadedFailure,
    musiciansQueryChanged,
} from "./musicians.actions";
import {
    handlePageOpened,
    handleMusiciansLoadedSuccess,
    handleMusiciansLoadedFailure,
    handleQueryChanged,
} from "./musicians.state";

// ============================================================================
// 7. EFFECTS SYSTEM SETUP
// ============================================================================

const isDebugMode = import.meta.env?.DEV ?? false;

export const { actions$, dispatcher, runner } = createEffectsSystem({
    debug: isDebugMode,
    errorHandler: (error, effectId) => {
        console.error(`❌ Error in ${effectId}:`, error);
    },
});

// ============================================================================
// 8. EFFECTS
// ============================================================================

/**
 * Effect: Load All Musicians
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
 */
export const updateFailureStateEffect = createEffect(
    () =>
        actions$.pipe(
            ofType(musiciansLoadedFailure),
            map((action) => {
                handleMusiciansLoadedFailure(action.payload.message);
                return null;
            })
        ),
    { dispatch: false, id: "update-failure-state" }
);

/**
 * Effect: Update Query State
 */
export const updateQueryStateEffect = createEffect(
    () =>
        actions$.pipe(
            ofType(musiciansQueryChanged),
            map((action) => {
                handleQueryChanged(action.payload.query);
                return null;
            })
        ),
    { dispatch: false, id: "update-query-state" }
);

/**
 * Effect: Log All Actions (Analytics/Debugging)
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
                if (isDebugMode) {
                    console.log("📊 Action:", action.type, action);
                }
                return null;
            })
        ),
    { dispatch: false, id: "logging" }
);

// ============================================================================
// 9. REGISTER EFFECTS
// ============================================================================

runner.registerEffects({
    loadAllMusicians: loadAllMusiciansEffect,
    updateLoadingState: updateLoadingStateEffect,
    updateMusiciansState: updateMusiciansStateEffect,
    updateFailureState: updateFailureStateEffect,
    updateQueryState: updateQueryStateEffect,
    logging: loggingEffect,
});
