# debounceTime

## BehaviorIntent
Emit a value only after the source has been **quiet** for a duration.

## BehaviorQualifier
**Silence policy**: a new source value **resets** the timer; only the latest value after silence is emitted.

## Rules

### Start
- Begins on subscription.
- The first value starts a delay timer.

### Emit
- Emits **only after** `dueTime` passes with no new source values.
- If a new value arrives before the timer ends, the pending emission is abandoned and the timer restarts for the newest value.

### State
- Tracks the **latest value**.
- Tracks a **single pending timer**.

### Completion
- Completes when the source completes.
- Pending emission behavior is implementation-specific; the governing intent remains silence-based release.

### Cancellation
- Unsubscribe cancels the pending timer and discards pending emissions.

### Error
- Errors propagate immediately.

## Canonical example (TypeScript)
ts import { fromEvent, map } from "rxjs"; import { debounceTime, distinctUntilChanged } from "rxjs/operators";
const input = document.querySelector("#q")!;
const query$ = fromEvent(input, "input").pipe( map(() => input.value.trim()), debounceTime(300), distinctUntilChanged(), );
query$.subscribe(console.log);
## Pitfall and diagnosis
- **Pitfall**: Using `debounceTime` when you need immediate first feedback.
- **Symptoms**: UI feels unresponsive; nothing emits while the user is actively interacting.
- **Fix**: Use `throttleTime` for leading edge behavior or `sampleTime` for periodic snapshots.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { debounceTime } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); // 30ms if 10ms per frame in run mode const src = cold("a-b--c----|", { a: "a", b: "b", c: "c" }); const out = src.pipe(debounceTime(t));
// Intention: only values followed by a quiet period emit. // Adjust expected timing to your chosen marble conventions. expectObservable(out).toBe("----b---c-|", { b: "b", c: "c" }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-01 | Typeahead Search Stabilization | Emit the settled query after user pauses |
| T-02 | Autosave After Inactivity | Save after inactivity instead of every keystroke |
| T-05 | Scroll and Resize Noise Control | Emit the final value after interaction stops |
| T-06 | Sensor Signal Smoothing | Stabilize jitter by waiting for quiet |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Control bursts"] A["Need silence before emit"] end
subgraph L2["L2 Operator"] direction LR O["debounceTime"] end
I -->|"Yes"| A A -->|"Use"| O
### Leaf notes
- Choose `debounceTime` when the user intent is **final value after quiet**, not periodic or immediate first response.