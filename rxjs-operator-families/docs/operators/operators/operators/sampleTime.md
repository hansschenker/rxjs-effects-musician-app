# sampleTime

## BehaviorIntent
Emit the most recent value on a **periodic sampling clock**.

## BehaviorQualifier
**Periodic snapshot policy**: emission is driven by ticks, not by source bursts.

## Rules

### Start
- Begins on subscription.
- Starts a periodic timer.

### Emit
- On each tick, emits the latest value observed since the previous tick (if any).

### State
- Stores the **latest seen value**.
- Maintains a **repeating timer**.

### Completion
- Completes when the source completes.

### Cancellation
- Unsubscribe stops the timer.

### Error
- Errors propagate immediately.

## Canonical example (TypeScript)
ts import { fromEvent, map } from "rxjs"; import { sampleTime } from "rxjs/operators";
const el = document.querySelector("#pane")!;
fromEvent(el, "mousemove").pipe( map((e) => ({ x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY })), sampleTime(16), ).subscribe(console.log);
## Pitfall and diagnosis
- **Pitfall**: Expecting a value to be emitted immediately when a burst starts.
- **Symptoms**: First output appears at the next tick, not on the first input.
- **Fix**: Use `throttleTime` for leading edge responsiveness.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { sampleTime } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a-b--c---d-|", { a: "a", b: "b", c: "c", d: "d" }); const out = src.pipe(sampleTime(t));
// Intention: periodic snapshots. expectObservable(out).toBe("---b---c--d|", { b: "b", c: "c", d: "d" }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-04 | UI Rendering Cadence Control | Emit on a steady cadence |
| T-06 | Sensor Signal Smoothing | Periodic sample of latest reading |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Control bursts"] A["Want periodic snapshots"] end
subgraph L2["L2 Operator"] direction LR O["sampleTime"] end
I -->|"Yes"| A A -->|"Use"| O
### Leaf notes
- Choose `sampleTime` when you want **cadence-first** behavior, driven by a clock.