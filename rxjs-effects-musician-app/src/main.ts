import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, fromEvent, map } from "rxjs";
import { musiciansApp, Musician, musiciansLoadedFailure } from "./musicians-app";
import "./index.css";
import "./App.css";
import "./styles/MusicianCard.css";
import "./styles/MusiciansList.css";
import "./styles/SearchBar.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

const app = document.createElement("div");
app.className = "App";

const header = document.createElement("header");
header.className = "page-header";
header.innerHTML = `
  <h1>🎸 Musicians App</h1>
  <p>Discover amazing musicians using RxJS Effects</p>
`;

// Search Bar
const searchBar = document.createElement("div");
searchBar.className = "search-bar";

const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Search musicians...";
searchInput.className = "search-input";
searchInput.setAttribute("aria-label", "Search musicians");

const searchIcon = document.createElement("div");
searchIcon.className = "search-icon";
searchIcon.textContent = "🔍";

searchBar.append(searchInput, searchIcon);

// Error Trigger Button (New Feature)
const errorButton = document.createElement("button");
errorButton.textContent = "⚠️ Trigger Error";
errorButton.style.marginTop = "1rem";
errorButton.style.backgroundColor = "#d32f2f";
errorButton.style.color = "white";
errorButton.onclick = () => {
  musiciansApp.dispatch.queryChanged("ERROR_TEST"); // Using a magic query to trigger error if backend supported it, but here we can just dispatch failure directly for demo
  // Or we can simulate it by dispatching a failure action directly via the store? 
  // The clean way is to let the dispatcher handle it. Since we don't have a "trigger error" action, 
  // we can manually dispatch a failure to show the specific UI state.
  // In a real app we would have a specific action. For this demo, let's just use the exposed dispatcher?
  // But `musiciansLoadedFailure` expects a payload.
  // Let's hack it slightly by assuming the service fails on specific query? No service doesn't.
  // Let's just create a manual failure for visual verification.
  musiciansApp.dispatcher.next(musiciansLoadedFailure({ message: "Simulated Error for Testing" }));
};
// Add button to header or somewhere visible
header.append(errorButton);


const content = document.createElement("div");
content.className = "musicians-content";

const listContainer = document.createElement("div");
listContainer.className = "musicians-list";

const selectionContainer = document.createElement("div");
selectionContainer.className = "musician-selection";

content.append(listContainer, selectionContainer);

const page = document.createElement("div");
page.className = "musicians-page";
page.append(header, searchBar, content);

app.append(page);
root.append(app);

// State
const selectedMusicianId$ = new BehaviorSubject<number | null>(null);

// Keep track of rendered list to avoid full rebuilds
let lastRenderedMusicianIds: number[] = [];
let lastRenderedSelectionId: number | null | undefined = undefined;

const renderList = (
  musicians: Musician[],
  selectedMusicianId: number | null,
  isLoading: boolean,
  error: string | null
) => {
  // 1. Handle Error
  if (error) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const errorState = document.createElement("div");
    errorState.className = "empty-state";
    errorState.setAttribute("role", "alert");
    errorState.innerHTML = `<p style="color: #ef5350">❌ ${error}</p>`;
    listContainer.append(errorState);
    return;
  }

  // 2. Handle Loading
  if (isLoading) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const loading = document.createElement("div");
    loading.className = "loading-container";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading musicians...</p>
    `;
    listContainer.append(loading);
    return;
  }

  // 3. Handle Empty
  if (musicians.length === 0) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<p>No musicians found. Try adjusting your search.</p>`;
    listContainer.append(empty);
    return;
  }

  // 4. Handle List Rendering
  // Check if data changed enough to require full rebuild
  const newIds = musicians.map(m => m.id);
  const dataChanged = newIds.length !== lastRenderedMusicianIds.length ||
    newIds.some((id, i) => id !== lastRenderedMusicianIds[i]);

  if (dataChanged) {
    // Rebuild list
    listContainer.innerHTML = "";
    const list = document.createElement("ul");
    list.className = "musicians-list-items";

    musicians.forEach((musician, index) => {
      const listItem = document.createElement("li");
      listItem.className = "musicians-list-item";
      // Stagger animation
      listItem.style.animationDelay = `${index * 0.05}s`;

      const button = document.createElement("button");
      button.id = `musician-btn-${musician.id}`;
      button.type = "button";
      button.className = "musicians-list-button";

      const name = document.createElement("span");
      name.className = "musician-list-name";
      name.textContent = musician.name;

      const id = document.createElement("span");
      id.className = "musician-list-id";
      id.textContent = `ID: ${musician.id}`;

      button.append(name, id);
      button.addEventListener("click", () => {
        selectedMusicianId$.next(musician.id);
      });

      listItem.append(button);
      list.append(listItem);
    });
    listContainer.append(list);
    lastRenderedMusicianIds = newIds;
  }

  // 5. Update Selection (always run)
  // Remove old selection
  const previousSelected = listContainer.querySelector(".musicians-list-button.is-selected");
  if (previousSelected) {
    previousSelected.classList.remove("is-selected");
    previousSelected.setAttribute("aria-pressed", "false");
  }

  // Add new selection
  if (selectedMusicianId) {
    const newSelected = listContainer.querySelector(`#musician-btn-${selectedMusicianId}`);
    if (newSelected) {
      newSelected.classList.add("is-selected");
      newSelected.setAttribute("aria-pressed", "true");
    }
  }
};

const renderSelection = (musician: Musician | null) => {
  const newId = musician ? musician.id : null;
  if (newId === lastRenderedSelectionId) {
    return;
  }
  lastRenderedSelectionId = newId;
  selectionContainer.innerHTML = "";

  if (!musician) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<p>Select a musician to see their profile.</p>`;
    selectionContainer.append(empty);
    return;
  }

  const card = document.createElement("div");
  card.className = "musician-card";
  // Add entrance animation
  card.animate([
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 300, easing: 'ease-out' });

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "musician-image";

  const image = document.createElement("img");
  image.src = musician.photoUrl;
  image.alt = musician.name;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(musician.name)}`;
  });

  imageWrapper.append(image);

  const info = document.createElement("div");
  info.className = "musician-info";

  const name = document.createElement("h3");
  name.className = "musician-name";
  name.textContent = musician.name;

  const id = document.createElement("p");
  id.className = "musician-id";
  id.textContent = `ID: ${musician.id}`;

  info.append(name, id);
  card.append(imageWrapper, info);
  selectionContainer.append(card);
};



// Combine streams for efficient updates
const subscription = combineLatest([
  musiciansApp.state$,
  selectedMusicianId$
]).subscribe(([state, selectedId]) => {
  // Synchronize Input
  if (searchInput.value !== state.query) {
    searchInput.value = state.query;
  }

  const query = state.query.toLowerCase();
  const filteredMusicians = state.musicians.filter((musician) =>
    musician.name.toLowerCase().includes(query)
  );

  // Auto-selection Logic
  // We need to be careful not to create infinite loops.
  // updateSelection() might emit to selectedMusicianId$.
  // Ideally this logic should be in the store/effects, but for now we keep it here.
  const currentSelectedId = selectedId;
  let effectiveSelectedId = currentSelectedId;

  if (filteredMusicians.length > 0) {
    if (!currentSelectedId || !filteredMusicians.find(m => m.id === currentSelectedId)) {
      // If nothing selected or selection lost, select first
      // We do this by side-effect but without emitting if we can avoid it, 
      // but here we just render with the first one and emit later?
      // Better: just emit and let next loop handle it?
      // But we are in the subscription.
      // Let's just calculate "what SHOULD be rendered" as the selection.
      effectiveSelectedId = filteredMusicians[0].id;
      // Only emit if it actually changed to keep sync
      if (effectiveSelectedId !== currentSelectedId) {
        // Defer emission to avoid interference with current render cycle
        setTimeout(() => selectedMusicianId$.next(effectiveSelectedId), 0);
      }
    }
  } else {
    effectiveSelectedId = null;
  }

  renderList(filteredMusicians, effectiveSelectedId, state.isLoading, state.error);

  const selectedMusician = filteredMusicians.find(m => m.id === effectiveSelectedId);
  renderSelection(selectedMusician ?? null);
});

// Search Input Logic
fromEvent(searchInput, "input")
  .pipe(
    map((event) => (event.target as HTMLInputElement).value),
    debounceTime(300),
    distinctUntilChanged()
  )
  .subscribe((query) => {
    musiciansApp.dispatch.queryChanged(query);
  });

// Cleanup
window.addEventListener("beforeunload", () => {
  subscription.unsubscribe();
  musiciansApp.cleanup();
});

// Init
musiciansApp.initializeEffects();
musiciansApp.dispatch.pageOpened();
