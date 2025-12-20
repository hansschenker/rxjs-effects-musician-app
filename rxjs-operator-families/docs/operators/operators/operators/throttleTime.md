# throttleTime

## BehaviorIntent
Limit emission frequency by allowing an event through, then **suppressing** subsequent events for a time window.

## BehaviorQualifier
**Leading edge policy**: emit now, then lock out for `duration`.

## Rules

### Start
- Begins on subscription.

### Emit
- Emits a value, then ignores subsequent values for `duration`.
- After the window ends, the next incoming value is eligible again.

### State
- Tracks an **open or closed gate**.
- Maintains a **cooldown timer**.

### Completion
- Completes when the source completes.

### Cancellation
- Unsubscribe clears the cooldown timer.

### Error
- Errors propagate immediately.

## Canonical example (TypeScript)
ts import { fromEvent } from "rxjs"; import { throttleTime } from "rxjs/operators";
const button = document.querySelector("#submit")!;
fromEvent(button, "click") .pipe(throttleTime(1000)) .subscribe(() => console.log("submit"));
## Pitfall and diagnosis
- **Pitfall**: Using `throttleTime` when you want the *last* value in each window.
- **Symptoms**: Downstream sees early values but misses the final state after continuous interaction.
- **Fix**: Use `auditTime` for trailing-most behavior.

## Minimal marble test
ts import { TestScheduler } from "rxjs/testing"; import { throttleTime } from "rxjs/operators";
const test = new TestScheduler((a, e) => expect(a).toEqual(e));
test.run(({ cold, expectObservable, time }) => { const t = time("---|"); const src = cold("a-b-c-d--|", { a: "a", b: "b", c: "c", d: "d" }); const out = src.pipe(throttleTime(t));
// Intention: first wins per window. expectObservable(out).toBe("a---c---|", { a: "a", c: "c" }); });
## Use Case Explorer and Specialization Decision Tree

### Use-case index

| ID | Use case | Why this operator |
|---:|:---------|:------------------|
| T-03 | Click and Tap Spam Protection | Allow one action per time window |
| T-05 | Scroll and Resize Noise Control | Reduce frequency while keeping responsiveness |

### Specialization decision tree
mermaid flowchart TD
subgraph L1["L1 Intent"] direction LR I["Control bursts"] A["Need immediate first response"] B["Need max one per window"] end
subgraph L2["L2 Operator"] direction LR O["throttleTime"] end
I -->|"Yes"| A A -->|"Yes"| B B -->|"Use"| O
### Leaf notes
- Choose `throttleTime` when **first event responsiveness** matters more than capturing the final state.