# delay

## BehaviorIntent
Emit the same values as the source, but **later**.

## BehaviorQualifier
**Time shift policy**: delay by a duration or until a specific time.

## Rules

### Start
- Begins on subscription.

### Emit
- Each emission is scheduled to occur after the configured delay.

### State
- Stores pending scheduled emissions.

### Completion
- Completes after all scheduled emissions have been delivered.

### Cancellation
- Unsubscribe cancels scheduled emissions.

### Error
- Errors propagate; this operator is not an error handler.

## Canonical example (TypeScript)
ts import { of } from "rxjs"; import { delay } from "rxjs/operators";
of("a", "b", "c") .pipe(delay(300)) .subscribe(console.log);
## Pitfall and diagnosis
- **Pitfall**: Using `delay` to solve backpressure or burst control.
- **Symptoms**: Downstream still receives bursts, just later.
- **Fix**: Use a burst-control operator (`debounceTime`, `throttleTime`, `auditTime`, `sampleTime`) or batching (`bufferTime`).

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { delay } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a-b-c-|", { a: "a", b: "b", c: "c" }); const out = src.pipe(delay(t));
expectObservable(out).toBe("---a-b-c-|", { a: "a", b: "b", c: "c" }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-09 | Simulated Latency and Staging | Shift timing without changing values |
| T-04 | UI Rendering Cadence Control | Stage visual transitions intentionally |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Shift emissions later"] end
subgraph L2["L2 Operator"] direction LR O["delay"] end
I -->|"Use"| O
### Leaf notes
- Choose `delay` when you want **the same stream**, but shifted forward in time.