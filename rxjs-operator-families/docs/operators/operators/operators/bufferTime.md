# bufferTime

## BehaviorIntent
Batch values into arrays using **time windows**.

## BehaviorQualifier
**Time window closure policy**: buffers close and flush based on time.

## Rules

### Start
- Begins on subscription.

### Emit
- Collects values into an array and emits arrays on time boundaries.

### State
- Maintains the current buffer (array).
- Maintains timer(s) governing flush.

### Completion
- Emits remaining buffered values and completes.

### Cancellation
- Unsubscribe clears timers and discards the current buffer.

### Error
- Errors propagate immediately.

## Canonical example (TypeScript)
ts import { fromEvent, map } from "rxjs"; import { bufferTime } from "rxjs/operators";
const el = document.querySelector("#pane")!;
fromEvent(el, "mousemove").pipe( map((e) => ({ x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY })), bufferTime(200), ).subscribe((batch) => console.log("batch", batch.length));
## Pitfall and diagnosis
- **Pitfall**: Expecting `bufferTime` to reduce latency.
- **Symptoms**: Output is delayed until the window closes.
- **Fix**: Use `throttleTime` / `sampleTime` for lower-latency gating.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { bufferTime } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a-b--c---d-|", { a: "a", b: "b", c: "c", d: "d" }); const out = src.pipe(bufferTime(t));
// Intention: arrays per time window. // Expected values depend on your marble frame assumptions. expectObservable(out).toBe("---x---y---(z|)", { x: ["a", "b"], y: ["c"], z: ["d"], }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-07 | Throughput Batching | Efficient bulk writes and analytics buckets |
| T-04 | UI Rendering Cadence Control | Batched UI updates rather than per event |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Batch into time windows"] end
subgraph L2["L2 Operator"] direction LR O["bufferTime"] end
I -->|"Use"| O
### Leaf notes
- Choose `bufferTime` when downstream benefits from **batch processing** rather than per-event processing.