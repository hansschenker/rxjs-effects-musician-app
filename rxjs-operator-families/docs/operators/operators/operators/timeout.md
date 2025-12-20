# timeout

## BehaviorIntent
Enforce a **deadline**: if the stream is too slow, fail fast (or switch).

## BehaviorQualifier
**Expiry policy**: missing emissions within the configured time budget triggers timeout.

## Rules

### Start
- Begins on subscription.
- Establishes initial deadline(s) depending on configuration.

### Emit
- Mirrors source emissions while monitoring time between emissions.

### State
- Maintains deadline timers.
- Tracks whether the stream is within the allowed time budget.

### Completion
- Completes if the source completes before a timeout triggers.

### Cancellation
- Unsubscribe cancels the deadline timers.

### Error
- When the configured time budget is violated, the operator errors or switches to a configured fallback observable.

## Canonical example (TypeScript)
ts import { interval } from "rxjs"; import { timeout } from "rxjs/operators";
// Interval emits every 1000ms; timeout set to 500ms will fail. interval(1000) .pipe(timeout({ each: 500 })) .subscribe({ next: console.log, error: (e) => console.log("timeout", e), });
## Pitfall and diagnosis
- **Pitfall**: Using `timeout` without a recovery plan.
- **Symptoms**: Stream terminates and downstream logic stops.
- **Fix**: Pair with Error Handling (e.g., catch and replace, retry with backoff) using your errors-as-data approach.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { timeout } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a----b----|", { a: "a", b: "b" }); const out = src.pipe(timeout({ each: t }));
// Intention: if the gap exceeds the budget, error. expectObservable(out).toBe("a---#"); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-08 | SLA and Deadline Enforcement | Bound latency; fail fast when too slow |
| T-10 | Heartbeat and Liveness Monitoring | Detect stalled streams |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Enforce a deadline"] end
subgraph L2["L2 Operator"] direction LR O["timeout"] end
I -->|"Use"| O
### Leaf notes
- Choose `timeout` when time is a **correctness constraint**, not merely a UX preference.
- In production, pair with an **explicit recovery strategy**.