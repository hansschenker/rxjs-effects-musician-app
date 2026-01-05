# Musicians App: NgRx Effects → RxJS Effects Conversion

## Overview

This document shows the conversion of the Musicians app from **NgRx Effects + Angular** to our **framework-agnostic RxJS Effects** system.

**Original:** https://github.com/marko-stanimirovic/ngrx-musicians-app

---

## Architecture Comparison

### NgRx Effects Version (Angular-specific)

```
Angular Component
    ↓
NgRx Store (dispatch actions)
    ↓
NgRx Effects (react to actions)
    ↓
Angular Service (@Injectable)
    ↓
NgRx Store (update via reducer)
    ↓
Angular Component (subscribes to selectors)
```

### RxJS Effects Version (Framework-agnostic)

```
Any UI / Code
    ↓
Dispatcher (dispatch actions)
    ↓
RxJS Effects (react to actions)
    ↓
Plain Service Class
    ↓
BehaviorSubject State
    ↓
Any UI / Code (subscribes to state$)
```

---

## File-by-File Conversion

### 1. Actions

#### NgRx Version

```typescript
// musicians-page.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const musiciansPageActions = createActionGroup({
  source: 'Musicians Page',
  events: {
    opened: emptyProps(),
    queryChanged: props<{ query: string }>(),
  },
});

// musicians-api.actions.ts
import { createActionGroup, props } from '@ngrx/store';

export const musiciansApiActions = createActionGroup({
  source: 'Musicians API',
  events: {
    musiciansLoadedSuccess: props<{ musicians: Musician[] }>(),
    musiciansLoadedFailure: props<{ message: string }>(),
  },
});
```

#### RxJS Effects Version

```typescript
import { createAction } from './core/actions';

// Page Actions
export const musiciansPageOpened = createAction<'musicians/page/opened'>('musicians/page/opened');
export const musiciansQueryChanged = createAction<'musicians/page/queryChanged', { query: string }>('musicians/page/queryChanged');

// API Actions
export const musiciansLoadedSuccess = createAction<'musicians/api/loadedSuccess', { musicians: Musician[] }>('musicians/api/loadedSuccess');
export const musiciansLoadedFailure = createAction<'musicians/api/loadedFailure', { message: string }>('musicians/api/loadedFailure');
```

**Changes:**
- ✅ No `createActionGroup` (not needed)
- ✅ Individual `createAction` calls
- ✅ Type-safe with generics
- ✅ Same action pattern maintained

---

### 2. Service

#### NgRx Version

```typescript
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MusiciansService {
  getAll(): Observable<Musician[]> {
    return of(musiciansMock).pipe(delay(1_000));
  }
}
```

#### RxJS Effects Version

```typescript
import { delay, Observable, of } from 'rxjs';

class MusiciansService {
  getAll(): Observable<Musician[]> {
    return of(musiciansMock).pipe(delay(1000));
  }
}

const musiciansService = new MusiciansService();
```

**Changes:**
- ❌ Removed `@Injectable` decorator
- ❌ Removed Angular DI
- ✅ Plain TypeScript class
- ✅ Manual instantiation
- ✅ Same API, same behavior

---

### 3. State Management

#### NgRx Version (Reducer + Store)

```typescript
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

interface State {
  musicians: Musician[];
  isLoading: boolean;
  query: string;
}

const initialState: State = {
  musicians: [],
  isLoading: false,
  query: '',
};

const reducer = createReducer(
  initialState,
  on(musiciansPageActions.opened, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(musiciansPageActions.queryChanged, (state, { query }) => ({
    ...state,
    query,
  })),
  on(musiciansApiActions.musiciansLoadedSuccess, (state, { musicians }) => ({
    ...state,
    musicians,
    isLoading: false,
  })),
  on(musiciansApiActions.musiciansLoadedFailure, (state) => ({
    ...state,
    isLoading: false,
  }))
);

export const musiciansFeature = createFeature({
  name: 'musicians',
  reducer,
  extraSelectors: ({ selectMusicians, selectQuery }) => ({
    selectFilteredMusicians: createSelector(
      selectMusicians,
      selectQuery,
      (musicians, query) =>
        musicians.filter(({ name }) => name.toLowerCase().includes(query))
    ),
  }),
});
```

#### RxJS Effects Version (BehaviorSubject)

```typescript
import { BehaviorSubject } from 'rxjs';

interface MusiciansState {
  musicians: Musician[];
  isLoading: boolean;
  query: string;
}

const initialState: MusiciansState = {
  musicians: [],
  isLoading: false,
  query: '',
};

const state$ = new BehaviorSubject<MusiciansState>(initialState);

function updateState(updater: (state: MusiciansState) => MusiciansState): void {
  state$.next(updater(state$.value));
}

// Selectors
export const selectMusicians = () => state$.value.musicians;
export const selectIsLoading = () => state$.value.isLoading;
export const selectQuery = () => state$.value.query;
export const selectFilteredMusicians = () => {
  const musicians = selectMusicians();
  const query = selectQuery().toLowerCase();
  return musicians.filter(musician => 
    musician.name.toLowerCase().includes(query)
  );
};

// State updaters (replace reducer)
export function handlePageOpened(): void {
  updateState(state => ({ ...state, isLoading: true }));
}

export function handleQueryChanged(query: string): void {
  updateState(state => ({ ...state, query }));
}

export function handleMusiciansLoadedSuccess(musicians: Musician[]): void {
  updateState(state => ({ 
    ...state, 
    musicians, 
    isLoading: false 
  }));
}

export function handleMusiciansLoadedFailure(): void {
  updateState(state => ({ ...state, isLoading: false }));
}
```

**Changes:**
- ❌ No `createReducer` or `createFeature`
- ❌ No NgRx Store
- ✅ `BehaviorSubject` for reactive state
- ✅ `updateState` helper for immutable updates
- ✅ Explicit state update functions
- ✅ Same immutability patterns
- ✅ Selectors work the same way

---

### 4. Effects

#### NgRx Version

```typescript
import { inject } from '@angular/core';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { musiciansPageActions } from './actions/musicians-page.actions';
import { musiciansApiActions } from './actions/musicians-api.actions';
import { MusiciansService } from './musicians.service';

export const loadAllMusicians = createEffect(
  (actions$ = inject(Actions), musiciansService = inject(MusiciansService)) => {
    return actions$.pipe(
      ofType(musiciansPageActions.opened),
      exhaustMap(() => {
        return musiciansService.getAll().pipe(
          map((musicians) =>
            musiciansApiActions.musiciansLoadedSuccess({ musicians })
          ),
          catchError(({ message }: { message: string }) =>
            of(musiciansApiActions.musiciansLoadedFailure({ message }))
          )
        );
      })
    );
  },
  { functional: true }
);
```

#### RxJS Effects Version

```typescript
import { exhaustMap } from 'rxjs/operators';
import { createEffect } from './core/effect-creator';
import { ofType } from './core/actions';
import { mapResponse } from './core/operators';

export const loadAllMusiciansEffect = createEffect(
  () => actions$.pipe(
    ofType(musiciansPageOpened),
    exhaustMap(() =>
      musiciansService.getAll().pipe(
        mapResponse({
          next: (musicians) => musiciansLoadedSuccess({ musicians }),
          error: (error: Error) => musiciansLoadedFailure({ message: error.message })
        })
      )
    )
  ),
  { id: 'load-all-musicians' }
);
```

**Changes:**
- ❌ No `inject()` from Angular
- ❌ No `{ functional: true }`
- ✅ Direct access to `actions$` and `musiciansService`
- ✅ Same RxJS operators
- ✅ `mapResponse` instead of `map` + `catchError`
- ✅ Cleaner, more concise

---

### 5. Additional Effects for State Updates

#### RxJS Effects Version (New)

In NgRx, the reducer handles state updates. In our system, we use effects:

```typescript
// Effect: Update loading state when page opens
export const updateLoadingStateEffect = createEffect(
  () => actions$.pipe(
    ofType(musiciansPageOpened),
    map(() => {
      handlePageOpened();
      return null;
    })
  ),
  { dispatch: false, id: 'update-loading-state' }
);

// Effect: Update state on successful load
export const updateMusiciansStateEffect = createEffect(
  () => actions$.pipe(
    ofType(musiciansLoadedSuccess),
    map(action => {
      handleMusiciansLoadedSuccess(action.payload.musicians);
      return null;
    })
  ),
  { dispatch: false, id: 'update-musicians-state' }
);

// Effect: Update query
export const updateQueryStateEffect = createEffect(
  () => actions$.pipe(
    ofType(musiciansQueryChanged),
    map(action => {
      handleQueryChanged(action.payload.query);
      return null;
    })
  ),
  { dispatch: false, id: 'update-query-state' }
);
```

**Why?**
- In NgRx, reducers are synchronous and react to actions
- In our system, effects can handle state updates
- More flexible - can combine with async operations
- Same reactive pattern

---

### 6. System Initialization

#### NgRx Version (Angular Module)

```typescript
// app.config.ts or app.module.ts
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { musiciansFeature } from './musicians/musicians.state';
import * as musiciansEffects from './musicians/musicians.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      [musiciansFeature.name]: musiciansFeature.reducer,
    }),
    provideEffects(musiciansEffects),
  ],
};
```

#### RxJS Effects Version

```typescript
// Create effects system
const { actions$, dispatcher, runner } = createEffectsSystem({
  debug: true,
  errorHandler: (error, effectId) => {
    console.error(`❌ Error in ${effectId}:`, error);
  },
});

// Register effects
runner.registerEffects({
  loadAllMusicians: loadAllMusiciansEffect,
  updateLoadingState: updateLoadingStateEffect,
  updateMusiciansState: updateMusiciansStateEffect,
  updateFailureState: updateFailureStateEffect,
  updateQueryState: updateQueryStateEffect,
  logging: loggingEffect,
});

// Start system
runner.start();
```

**Changes:**
- ❌ No Angular providers
- ❌ No DI system
- ✅ Explicit instantiation
- ✅ Manual registration
- ✅ Explicit start
- ✅ Full control over lifecycle

---

### 7. Component Usage

#### NgRx Version (Angular Component)

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { musiciansPageActions } from './actions/musicians-page.actions';
import { musiciansFeature } from './musicians.state';

@Component({
  selector: 'app-musicians',
  template: `
    <input 
      (input)="onQueryChange($event)"
      [value]="query()"
    />
    
    <div *ngIf="isLoading()">Loading...</div>
    
    <div *ngFor="let musician of musicians()">
      {{ musician.name }}
    </div>
  `
})
export class MusiciansComponent {
  private store = inject(Store);
  
  musicians = this.store.selectSignal(musiciansFeature.selectFilteredMusicians);
  isLoading = this.store.selectSignal(musiciansFeature.selectIsLoading);
  query = this.store.selectSignal(musiciansFeature.selectQuery);
  
  ngOnInit() {
    this.store.dispatch(musiciansPageActions.opened());
  }
  
  onQueryChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.store.dispatch(musiciansPageActions.queryChanged({ query }));
  }
}
```

#### RxJS Effects Version (Vanilla JS)

```typescript
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

// Initialize
initializeApp();

// Subscribe to state
const subscription = musiciansApp.subscribe.toState(state => {
  renderUI(state);
});

// Handle user input
searchInput.addEventListener('input', (e) => {
  const query = (e.target as HTMLInputElement).value;
  searchMusicians(query);
});

// Render UI
function renderUI(state) {
  // Update loading indicator
  loadingEl.style.display = state.isLoading ? 'block' : 'none';
  
  // Update search box
  searchInput.value = state.query;
  
  // Render musicians
  const filtered = musiciansApp.selectFilteredMusicians();
  musiciansListEl.innerHTML = filtered
    .map(m => `<div>${m.name}</div>`)
    .join('');
}

// Cleanup
window.addEventListener('beforeunload', () => {
  subscription.unsubscribe();
  musiciansApp.cleanup();
});
```

**Or with React:**

```typescript
import { useEffect, useState } from 'react';
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

function MusiciansComponent() {
  const [state, setState] = useState(musiciansApp.state$.value);
  
  useEffect(() => {
    initializeApp();
    
    const subscription = musiciansApp.subscribe.toState(newState => {
      setState(newState);
    });
    
    return () => {
      subscription.unsubscribe();
      musiciansApp.cleanup();
    };
  }, []);
  
  const filteredMusicians = musiciansApp.selectFilteredMusicians();
  
  return (
    <div>
      <input 
        value={state.query}
        onChange={(e) => searchMusicians(e.target.value)}
      />
      
      {state.isLoading && <div>Loading...</div>}
      
      {filteredMusicians.map(m => (
        <div key={m.id}>{m.name}</div>
      ))}
    </div>
  );
}
```

---

## Summary: What Changed

### Removed (Angular-specific)

- ❌ `@angular/core` - No Angular dependency
- ❌ `@ngrx/store` - No NgRx Store
- ❌ `@ngrx/effects` - Using our Effects system
- ❌ `@Injectable()` - No DI
- ❌ `provideStore()` / `provideEffects()` - No providers
- ❌ Angular Component decorators
- ❌ Angular lifecycle hooks
- ❌ `createActionGroup` - Individual actions instead
- ❌ `createFeature` - BehaviorSubject instead
- ❌ `createReducer` - State update functions instead

### Added (Framework-agnostic)

- ✅ Our RxJS Effects system
- ✅ `BehaviorSubject` for state
- ✅ Plain TypeScript classes
- ✅ Manual instantiation
- ✅ Explicit lifecycle management
- ✅ State update helper functions
- ✅ Public API for dispatch/subscribe

### Kept (Same patterns)

- ✅ Action In → Action Out pattern
- ✅ RxJS operators (map, exhaustMap, etc.)
- ✅ Immutable state updates
- ✅ Selectors for derived data
- ✅ Effects for side effects
- ✅ Type safety with TypeScript
- ✅ Reactive streams
- ✅ Unidirectional data flow

---

## Benefits of the Conversion

### 1. **Zero Framework Dependencies**
- Works in Node.js, browsers, React, Vue, Svelte, vanilla JS
- No build configuration required
- Smaller bundle size

### 2. **Explicit Control**
- Clear system initialization
- Manual effect registration
- Explicit start/stop lifecycle

### 3. **Simpler Mental Model**
- No DI to understand
- No Angular magic
- Just functions and observables

### 4. **Easier Testing**
- No TestBed required
- Pure functions
- Mock services easily

### 5. **Same Power**
- All NgRx Effects features
- Same reactive patterns
- Same type safety

---

## Migration Guide

If you have an NgRx app and want to convert it:

1. **Replace NgRx Actions** → Use `createAction` from our system
2. **Replace NgRx Store** → Use `BehaviorSubject`
3. **Replace NgRx Reducers** → Use state update functions
4. **Replace NgRx Selectors** → Use plain functions
5. **Replace NgRx Effects** → Use `createEffect` from our system
6. **Remove Angular Services** → Use plain TypeScript classes
7. **Setup Effects System** → Create, register, start
8. **Update UI Integration** → Subscribe to state$

The **core logic stays the same** - just remove the framework!
