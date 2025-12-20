# auditTime

## BehaviorIntent
During bursts, emit the **most recent** value at the **end** of each time window.

## BehaviorQualifier
**Trailing-most policy**: ignore values during the window; emit the latest seen when the window closes.

## Rules

### Start
- Begins on subscription.
- A window starts when a value arrives (or when configured window begins).

### Emit
- During each window, remembers the latest value.
- When the window ends, emits that latest value.

### State
- Tracks the **active window timer**.
- Stores the **latest seen value** during the window.

### Completion
- Completes when the source completes.

### Cancellation
- Unsubscribe clears the window timer and discards pending latest value.

### Error
- Errors propagate immediately.

## Canonical example (TypeScript)
ts import { fromEvent, map } from "rxjs"; import { auditTime } from "rxjs/operators";
const el = document.querySelector("#pane")!;
fromEvent(el, "mousemove").pipe( map((e) => ({ x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY })), auditTime(100), ).subscribe(console.log);
## Pitfall and diagnosis
- **Pitfall**: Expecting immediate feedback like `throttleTime`.
- **Symptoms**: Values appear only after the window ends.
- **Fix**: Use `throttleTime` for leading edge behavior.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { auditTime } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a-b-c---d--|", { a: "a", b: "b", c: "c", d: "d" }); const out = src.pipe(auditTime(t));
// Intention: emit last value seen per window. expectObservable(out).toBe("---c---d-|", { c: "c", d: "d" }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-04 | UI Rendering Cadence Control | Emit latest state at window end |
| T-05 | Scroll and Resize Noise Control | Reduce noise but keep the latest position |
| T-06 | Sensor Signal Smoothing | Emit stabilized latest reading per window |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Control bursts"] A["Want final value per window"] end
subgraph L2["L2 Operator"] direction LR O["auditTime"] end
I -->|"Yes"| A A -->|"Use"| O
### Leaf notes
- Choose `auditTime` when you want **the latest value**, but only **once per window**, and you can accept trailing delivery.