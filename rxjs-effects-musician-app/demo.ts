/**
 * Demo: Musicians App - Framework-Agnostic Version
 *
 * This demonstrates how to use the converted Musicians app
 * without Angular or any framework dependency
 */

import {
  musiciansApp,
  initializeApp,
  searchMusicians,
  watchFilteredMusicians,
  getCurrentState,
  Musician,
} from "./musicians-app";

// ============================================================================
// DEMO SCENARIO
// ============================================================================

async function runDemo() {
  console.log("=".repeat(60));
  console.log("🎸 MUSICIANS APP DEMO - RxJS Effects Version");
  console.log("=".repeat(60));

  // Helper for delays
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // -------------------------------------------------------------------------
  // Step 1: Subscribe to state changes
  // -------------------------------------------------------------------------
  console.log("\n[Step 1] Setting up subscriptions...\n");

  // Subscribe to loading state
  const loadingSubscription = musiciansApp.subscribe.toIsLoading(
    (isLoading) => {
      console.log(
        `📊 Loading state: ${isLoading ? "⏳ Loading..." : "✅ Ready"}`
      );
    }
  );

  // Subscribe to musicians list
  const musiciansSubscription = musiciansApp.subscribe.toMusicians(
    (musicians) => {
      console.log(`📊 Musicians loaded: ${musicians.length} total`);
    }
  );

  // Subscribe to filtered results
  const filteredSubscription = musiciansApp.subscribe.toFilteredMusicians(
    (musicians) => {
      console.log(`🔍 Filtered results: ${musicians.length} musician(s)`);
      if (musicians.length > 0) {
        musicians.forEach((m) => console.log(`   - ${m.name}`));
      }
    }
  );

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 2: Initialize app (triggers load)
  // -------------------------------------------------------------------------
  console.log("\n[Step 2] Initializing effects system...\n");
  musiciansApp.initializeEffects();

  console.log(
    "\n[Step 2b] Initializing app (dispatching pageOpened action)...\n"
  );
  initializeApp();

  // Wait for API to respond (1 second delay)
  await wait(1500);

  // -------------------------------------------------------------------------
  // Step 3: Check state
  // -------------------------------------------------------------------------
  console.log("\n[Step 3] Checking current state...\n");
  const state = getCurrentState();
  console.log("Current State:", {
    totalMusicians: state.musicians.length,
    isLoading: state.isLoading,
    query: state.query || "(empty)",
  });

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 4: Search for "Eric"
  // -------------------------------------------------------------------------
  console.log('\n[Step 4] Searching for "Eric"...\n');
  searchMusicians("Eric");

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 5: Search for "King"
  // -------------------------------------------------------------------------
  console.log('\n[Step 5] Searching for "King"...\n');
  searchMusicians("King");

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 6: Search for "Vaughan"
  // -------------------------------------------------------------------------
  console.log('\n[Step 6] Searching for "Vaughan"...\n');
  searchMusicians("Vaughan");

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 7: Clear search
  // -------------------------------------------------------------------------
  console.log("\n[Step 7] Clearing search...\n");
  searchMusicians("");

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 8: Search for non-existent
  // -------------------------------------------------------------------------
  console.log('\n[Step 8] Searching for "Mozart" (not found)...\n');
  searchMusicians("Mozart");

  await wait(500);

  // -------------------------------------------------------------------------
  // Step 9: Show final state
  // -------------------------------------------------------------------------
  console.log("\n[Step 9] Final state...\n");
  const finalState = getCurrentState();
  console.log("Final State:", finalState);

  // -------------------------------------------------------------------------
  // Step 10: Cleanup
  // -------------------------------------------------------------------------
  console.log("\n[Step 10] Cleaning up...\n");

  loadingSubscription.unsubscribe();
  musiciansSubscription.unsubscribe();
  filteredSubscription.unsubscribe();

  musiciansApp.cleanup();

  console.log("\n" + "=".repeat(60));
  console.log("✅ DEMO COMPLETED");
  console.log("=".repeat(60));
}

// ============================================================================
// ALTERNATIVE DEMO: REACTIVE UI SIMULATION
// ============================================================================

/**
 * Simulates a reactive UI that responds to state changes
 */
function simulateReactiveUI() {
  console.log("\n" + "=".repeat(60));
  console.log("🎨 SIMULATING REACTIVE UI");
  console.log("=".repeat(60));

  // Initialize effects system
  musiciansApp.initializeEffects();

  // UI State
  let currentMusicians: Musician[] = [];
  let currentQuery = "";
  let currentLoading = false;

  // Subscribe to state changes and "render" UI
  musiciansApp.subscribe.toState((state) => {
    console.log("\n🖼️  UI RENDER:");
    console.log("─".repeat(40));

    if (state.isLoading !== currentLoading) {
      currentLoading = state.isLoading;
      console.log(`Loading: ${currentLoading ? "⏳ Yes" : "✅ No"}`);
    }

    if (state.query !== currentQuery) {
      currentQuery = state.query;
      console.log(`Search Query: "${currentQuery || "(empty)"}"`);
    }

    const filtered = musiciansApp.selectFilteredMusicians();
    if (JSON.stringify(filtered) !== JSON.stringify(currentMusicians)) {
      currentMusicians = filtered;
      console.log(`\nMusicians (${currentMusicians.length}):`);
      if (currentMusicians.length === 0) {
        console.log("  (no results)");
      } else {
        currentMusicians.forEach((m, i) => {
          console.log(`  ${i + 1}. ${m.name}`);
        });
      }
    }

    console.log("─".repeat(40));
  });

  // Simulate user interactions
  setTimeout(() => {
    console.log("\n👤 User opens the page...");
    initializeApp();
  }, 500);

  setTimeout(() => {
    console.log('\n👤 User types "Hendrix" in search...');
    searchMusicians("Hendrix");
  }, 2500);

  setTimeout(() => {
    console.log("\n👤 User clears search...");
    searchMusicians("");
  }, 4000);

  setTimeout(() => {
    console.log('\n👤 User types "King" in search...');
    searchMusicians("King");
  }, 5500);

  setTimeout(() => {
    console.log("\n\n✅ UI Simulation Complete\n");
    musiciansApp.cleanup();
  }, 7000);
}

// ============================================================================
// INTEGRATION EXAMPLE: WITH A REAL UI
// ============================================================================

/**
 * Example: How you might integrate with a real UI framework
 */
export class MusiciansUI {
  private subscriptions: any[] = [];

  constructor(private rootElement: HTMLElement) {
    this.setupSubscriptions();
    this.setupEventListeners();
    this.initialize();
  }

  private setupSubscriptions() {
    // Subscribe to state and update DOM
    this.subscriptions.push(
      musiciansApp.subscribe.toIsLoading((isLoading) => {
        this.updateLoadingIndicator(isLoading);
      })
    );

    this.subscriptions.push(
      musiciansApp.subscribe.toFilteredMusicians((musicians) => {
        this.renderMusiciansList(musicians);
      })
    );

    this.subscriptions.push(
      musiciansApp.subscribe.toQuery((query) => {
        this.updateSearchBox(query);
      })
    );
  }

  private setupEventListeners() {
    // Search input
    const searchBox = this.rootElement.querySelector(
      "#search"
    ) as HTMLInputElement;
    if (searchBox) {
      searchBox.addEventListener("input", (e) => {
        const query = (e.target as HTMLInputElement).value;
        searchMusicians(query);
      });
    }
  }

  private initialize() {
    initializeApp();
  }

  private updateLoadingIndicator(isLoading: boolean) {
    const loader = this.rootElement.querySelector("#loader");
    if (loader) {
      loader.classList.toggle("hidden", !isLoading);
    }
  }

  private renderMusiciansList(musicians: Musician[]) {
    const list = this.rootElement.querySelector("#musicians-list");
    if (!list) return;

    if (musicians.length === 0) {
      list.innerHTML = "<p>No musicians found</p>";
      return;
    }

    list.innerHTML = musicians
      .map(
        (m) => `
        <div class="musician-card">
          <img src="${m.photoUrl}" alt="${m.name}" />
          <h3>${m.name}</h3>
        </div>
      `
      )
      .join("");
  }

  private updateSearchBox(query: string) {
    const searchBox = this.rootElement.querySelector(
      "#search"
    ) as HTMLInputElement;
    if (searchBox && searchBox.value !== query) {
      searchBox.value = query;
    }
  }

  destroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    musiciansApp.cleanup();
  }
}

// ============================================================================
// RUN THE DEMO
// ============================================================================

// Choose which demo to run:
// runDemo();
// simulateReactiveUI();

export { runDemo, simulateReactiveUI, MusiciansUI };
