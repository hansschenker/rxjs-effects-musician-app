import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
} from "rxjs";
import { musiciansApp, Musician } from "./musicians-app";
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

const selectedMusicianId$ = new BehaviorSubject<number | null>(null);
let lastListState:
  | {
      ids: number[];
      selectedId: number | null;
      isLoading: boolean;
      error: string | null;
    }
  | null = null;
let lastSelectedMusicianId: number | null = null;

const createFallbackImage = (name: string) => {
  const safeName = name.trim() || "Unknown Musician";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" role="img" aria-label="${safeName}">
      <rect width="100%" height="100%" fill="#1f2937" />
      <text x="50%" y="50%" fill="#f9fafb" font-size="20" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="middle">
        ${safeName}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const renderList = (
  musicians: Musician[],
  selectedMusicianId: number | null,
  isLoading: boolean,
  error: string | null
) => {
  listContainer.innerHTML = "";

  if (error) {
    const errorState = document.createElement("div");
    errorState.className = "empty-state";
    errorState.setAttribute("role", "alert");
    errorState.innerHTML = `<p>${error}</p>`;
    listContainer.append(errorState);
    return;
  }

  if (isLoading) {
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

  if (musicians.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<p>No musicians found. Try adjusting your search.</p>`;
    listContainer.append(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "musicians-list-items";

  musicians.forEach((musician) => {
    const listItem = document.createElement("li");
    listItem.className = "musicians-list-item";

    const button = document.createElement("button");
    const isSelected = musician.id === selectedMusicianId;
    button.type = "button";
    button.className = `musicians-list-button${isSelected ? " is-selected" : ""}`;
    button.setAttribute("aria-pressed", String(isSelected));

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
};

const renderSelection = (musician: Musician | null) => {
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

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "musician-image";

  const image = document.createElement("img");
  image.src = musician.photoUrl;
  image.alt = musician.name;
  const handleImageError = () => {
    image.removeEventListener("error", handleImageError);
    image.src = createFallbackImage(musician.name);
  };
  image.addEventListener("error", handleImageError);

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

const resolveSelection = (
  musicians: Musician[],
  current: number | null
): number | null => {
  if (musicians.length === 0) {
    return null;
  }

  if (current !== null && musicians.some((musician) => musician.id === current)) {
    return current;
  }

  return musicians[0].id;
};

const stateSubscription = combineLatest([
  musiciansApp.state$,
  selectedMusicianId$.pipe(distinctUntilChanged()),
]).subscribe(([state, selectedId]) => {
  if (searchInput.value !== state.query) {
    searchInput.value = state.query;
  }

  const nextSelectedId = resolveSelection(state.musicians, selectedId);
  if (nextSelectedId !== selectedId) {
    selectedMusicianId$.next(nextSelectedId);
    return;
  }

  const query = state.query.toLowerCase();
  const filteredMusicians = state.musicians.filter((musician) =>
    musician.name.toLowerCase().includes(query)
  );

  const filteredIds = filteredMusicians.map((musician) => musician.id);
  const shouldRenderList =
    !lastListState ||
    lastListState.isLoading !== state.isLoading ||
    lastListState.error !== state.error ||
    lastListState.selectedId !== selectedId ||
    lastListState.ids.length !== filteredIds.length ||
    lastListState.ids.some((id, index) => id !== filteredIds[index]);

  if (shouldRenderList) {
    renderList(filteredMusicians, selectedId, state.isLoading, state.error);
    lastListState = {
      ids: filteredIds,
      selectedId,
      isLoading: state.isLoading,
      error: state.error,
    };
  }

  if (lastSelectedMusicianId !== selectedId) {
    const selected = state.musicians.find(
      (musician) => musician.id === selectedId
    );
    renderSelection(selected ?? null);
    lastSelectedMusicianId = selectedId;
  }
});

fromEvent(searchInput, "input")
  .pipe(
    map((event) => (event.target as HTMLInputElement).value),
    debounceTime(300),
    distinctUntilChanged()
  )
  .subscribe((query) => {
    musiciansApp.dispatch.queryChanged(query);
  });

window.addEventListener("beforeunload", () => {
  stateSubscription.unsubscribe();
  musiciansApp.cleanup();
});

musiciansApp.initializeEffects();
musiciansApp.dispatch.pageOpened();
