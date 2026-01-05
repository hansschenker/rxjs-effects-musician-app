# Musicians App - RxJS Effects Version

A **framework-agnostic** conversion of the [NgRx Musicians App](https://github.com/marko-stanimirovic/ngrx-musicians-app) using our pure RxJS Effects system.

## 🎯 What This Demonstrates

This app proves that **NgRx Effects patterns work perfectly without Angular**!

**Original:** NgRx Effects + Angular  
**Converted:** Pure RxJS Effects + No Framework

## 🎸 Features

- ✅ Load musicians from mock API (with delay)
- ✅ Real-time search/filter
- ✅ Loading states
- ✅ Error handling
- ✅ Reactive state management
- ✅ Type-safe with TypeScript
- ✅ **Zero framework dependencies**

## 📦 Installation

```bash
npm install
```

## 🚀 Usage

### Basic Example

```typescript
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

// Initialize the app (loads musicians)
initializeApp();

// Subscribe to state changes
musiciansApp.subscribe.toFilteredMusicians(musicians => {
  console.log('Filtered musicians:', musicians);
});

// Search
searchMusicians('Hendrix');
```

### Run the Demo

```bash
npm run demo
```

### With React

```typescript
import { useEffect, useState } from 'react';
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

function MusiciansApp() {
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    initializeApp();
    
    const sub1 = musiciansApp.subscribe.toFilteredMusicians(setMusicians);
    const sub2 = musiciansApp.subscribe.toIsLoading(setLoading);
    
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      musiciansApp.cleanup();
    };
  }, []);
  
  return (
    <div>
      <input 
        type="text"
        placeholder="Search musicians..."
        onChange={e => searchMusicians(e.target.value)}
      />
      
      {loading && <p>Loading...</p>}
      
      <ul>
        {musicians.map(m => (
          <li key={m.id}>{m.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### With Vue

```vue
<template>
  <div>
    <input 
      v-model="searchQuery"
      @input="handleSearch"
      placeholder="Search musicians..."
    />
    
    <p v-if="loading">Loading...</p>
    
    <ul>
      <li v-for="musician in musicians" :key="musician.id">
        {{ musician.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

const musicians = ref([]);
const loading = ref(false);
const searchQuery = ref('');

let subscriptions = [];

onMounted(() => {
  initializeApp();
  
  subscriptions.push(
    musiciansApp.subscribe.toFilteredMusicians(m => musicians.value = m),
    musiciansApp.subscribe.toIsLoading(l => loading.value = l)
  );
});

onUnmounted(() => {
  subscriptions.forEach(sub => sub.unsubscribe());
  musiciansApp.cleanup();
});

function handleSearch() {
  searchMusicians(searchQuery.value);
}
</script>
```

### With Vanilla JavaScript

```javascript
import { musiciansApp, initializeApp, searchMusicians } from './musicians-app';

// Get DOM elements
const searchInput = document.getElementById('search');
const loadingDiv = document.getElementById('loading');
const musiciansList = document.getElementById('musicians');

// Initialize
initializeApp();

// Subscribe to state
musiciansApp.subscribe.toState(state => {
  // Update loading
  loadingDiv.style.display = state.isLoading ? 'block' : 'none';
  
  // Update search
  searchInput.value = state.query;
  
  // Render musicians
  const filtered = musiciansApp.selectFilteredMusicians();
  musiciansList.innerHTML = filtered
    .map(m => `
      <div class="musician">
        <img src="${m.photoUrl}" alt="${m.name}" />
        <h3>${m.name}</h3>
      </div>
    `)
    .join('');
});

// Handle search input
searchInput.addEventListener('input', (e) => {
  searchMusicians(e.target.value);
});
```

## 🏗️ Architecture

### State Flow

```
User Action
    ↓
Dispatcher (dispatch action)
    ↓
Actions Stream
    ↓
Effects (filter by ofType)
    ↓
  ├─ loadAllMusiciansEffect → API Call → Success/Failure Actions
  ├─ updateLoadingStateEffect → Update State
  ├─ updateMusiciansStateEffect → Update State
  └─ loggingEffect → Console Log
    ↓
Dispatcher (results dispatched back)
    ↓
State Updates (BehaviorSubject)
    ↓
UI Re-renders (subscriptions)
```

### Files Structure

```
musicians-app-rxjs-effects/
├── src/
│   ├── musicians-app.ts      # Main app logic
│   └── demo.ts                # Demo scenarios
├── CONVERSION_GUIDE.md        # NgRx → RxJS Effects guide
├── package.json
├── tsconfig.json
└── README.md
```

## 🎓 Learning Resources

### Key Concepts

1. **Action In → Action Out** - Effects transform actions
2. **BehaviorSubject State** - Reactive state management
3. **Effects for Side Effects** - API calls, state updates
4. **Selectors** - Derived state computation
5. **Type Safety** - Full TypeScript support

### What's Different from NgRx?

| Feature | NgRx | RxJS Effects |
|---------|------|--------------|
| **Store** | NgRx Store | BehaviorSubject |
| **Actions** | createActionGroup | createAction |
| **Reducers** | createReducer | State update functions |
| **Effects** | @ngrx/effects | Our Effects system |
| **DI** | Angular DI | Manual instantiation |
| **Framework** | Angular only | Any or none |

### What's the Same?

- ✅ Action In → Action Out pattern
- ✅ RxJS operators (map, exhaustMap, etc.)
- ✅ Immutable state updates
- ✅ Type safety
- ✅ Reactive streams
- ✅ Effect lifecycle

## 📊 Comparison

### Lines of Code

**NgRx Version (Angular):**
- Actions: 25 lines
- Service: 30 lines
- State: 60 lines
- Effects: 25 lines
- Component: 40 lines
- **Total: ~180 lines + Angular config**

**RxJS Effects Version (Framework-agnostic):**
- Everything: ~300 lines (includes effects, state, actions, API)
- **Total: ~300 lines, zero config**

### Bundle Size

**NgRx Version:**
- Angular: ~140KB
- NgRx: ~40KB
- **Total: ~180KB**

**RxJS Effects Version:**
- RxJS: ~30KB
- Our Effects: ~5KB
- **Total: ~35KB** (5x smaller!)

## 🧪 Testing

```typescript
import { test, expect } from 'vitest';
import { musiciansApp, initializeApp } from './musicians-app';

test('should load musicians on init', async () => {
  initializeApp();
  
  // Wait for async operation
  await new Promise(resolve => setTimeout(resolve, 1100));
  
  const musicians = musiciansApp.selectMusicians();
  expect(musicians.length).toBe(6);
  expect(musicians[0].name).toBe('Eric Clapton');
});

test('should filter musicians by query', async () => {
  initializeApp();
  await new Promise(resolve => setTimeout(resolve, 1100));
  
  musiciansApp.dispatch.queryChanged('Hendrix');
  
  const filtered = musiciansApp.selectFilteredMusicians();
  expect(filtered.length).toBe(1);
  expect(filtered[0].name).toBe('Jimi Hendrix');
});
```

## 🎯 API Reference

### dispatch

```typescript
musiciansApp.dispatch.pageOpened();
musiciansApp.dispatch.queryChanged(query);
```

### subscribe

```typescript
musiciansApp.subscribe.toState(state => { /* ... */ });
musiciansApp.subscribe.toMusicians(musicians => { /* ... */ });
musiciansApp.subscribe.toFilteredMusicians(musicians => { /* ... */ });
musiciansApp.subscribe.toIsLoading(loading => { /* ... */ });
musiciansApp.subscribe.toQuery(query => { /* ... */ });
```

### selectors

```typescript
musiciansApp.selectMusicians()
musiciansApp.selectIsLoading()
musiciansApp.selectQuery()
musiciansApp.selectFilteredMusicians()
```

### state$

```typescript
musiciansApp.state$.subscribe(state => { /* ... */ });
```

### cleanup

```typescript
musiciansApp.cleanup(); // Stop effects, cleanup subscriptions
```

## 💡 Key Takeaways

1. **NgRx Effects patterns are framework-agnostic** - The core ideas work anywhere
2. **RxJS is enough** - No need for a framework to build reactive apps
3. **Simpler is better** - Less abstraction, more clarity
4. **Type safety matters** - TypeScript makes everything better
5. **Patterns > Tools** - The pattern is more important than the library

## 🙏 Credits

**Original App:** [marko-stanimirovic/ngrx-musicians-app](https://github.com/marko-stanimirovic/ngrx-musicians-app)

**Conversion:** Demonstrates our framework-agnostic RxJS Effects system

## 📄 License

MIT

---

**Built with ❤️ to show that great patterns transcend frameworks!** 🎸
