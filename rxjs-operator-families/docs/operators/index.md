# RxJS Operator Families

This is the **start page** for navigating RxJS operators using **16 behavioral groups**.

**How to use this repo**
1. Start from your *intent* (what you need to accomplish).
2. Choose the matching **group**.
3. Use the group’s **decision questions** and **specialization decision tree** to select an operator.
4. Jump to the operator page for rules, pitfalls, and tests.

## Navigation
- [Groups Index](./groups-index.md)
- [Use Case Index](./use-cases/index.md)
- [Glossary](./glossary.md)

---

## Groups

1. [Creation / Generation](./groups/01-creation-generation.md) — Create sources and define where events come from.
2. [Projection](./groups/02-projection.md) — Transform values (mostly 1→1) without changing topology.
3. [Partitioning](./groups/03-partitioning.md) — Keep/drop/segment values (filter, take, buffer, window).
4. [Combining](./groups/04-combining.md) — Merge/sequence multiple streams into one.
5. [Joining](./groups/05-joining.md) — Pair/correlate streams (latest snapshot, index pairing, completion join).
6. [Grouping](./groups/06-grouping.md) — Split into keyed substreams.
7. [Set Operations](./groups/07-set-operations.md) — Uniqueness/equality policies over emissions.
8. [Concurrency](./groups/08-concurrency.md) — Inner subscription and cancellation policies.
9. [Single Value](./groups/09-single-value.md) — Select exactly one value then complete.
10. [Quantifiers](./groups/10-quantifiers.md) — Prove boolean properties over a stream.
11. [Aggregation](./groups/11-aggregation.md) — Fold values into accumulated state/results.
12. [Timing](./groups/12-timing.md) — Control *when* values are allowed to appear downstream.
13. [Scheduling](./groups/13-scheduling.md) — Control execution context for subscription/notifications.
14. [Error Handling](./groups/14-error-handling.md) — Recovery/retry/replace semantics.
15. [Testing](./groups/15-testing.md) — Virtual time, deterministic assertions, cancellation proofs.
16. [Testing](./groups/16-testing.md) — Testing.
17. [Inspection](./groups/17-inspection.md) — Observe/debug/measure without changing meaning.