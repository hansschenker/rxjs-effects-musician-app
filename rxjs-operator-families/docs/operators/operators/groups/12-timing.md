# Timing

**Governing statement:** Timing operators change the temporal semantics of a stream: not “what values are,” but **when values are allowed to appear downstream**.

Timing is distinct from:
- **Concurrency**: how inner observables are subscribed/canceled (merge/concat/switch/exhaust policies).
- **Scheduling**: the execution context that runs subscriptions and delivers notifications.

---

## Dominant use cases (10)

- **T-01 Typeahead Search Stabilization** — Wait for a pause before firing a query to avoid request storms.
- **T-02 Autosave After Inactivity** — Save only after the user stops interacting for a short period.
- **T-03 Click and Tap Spam Protection** — Allow one user action per window to prevent duplicate submissions.
- **T-04 UI Rendering Cadence Control** — Emit UI updates at a controlled cadence so rendering stays smooth.
- **T-05 Scroll and Resize Noise Control** — Reduce high-frequency DOM events into meaningful updates.
- **T-06 Sensor Signal Smoothing** — Suppress jitter and emit stabilized readings.
- **T-07 Throughput Batching** — Batch events into timed buckets for efficient writes or analytics.
- **T-08 SLA and Deadline Enforcement** — Fail or recover when expected events do not arrive within a time budget.
- **T-09 Simulated Latency and Staging** — Delay emissions to align with animations or to mimic network timing.
- **T-10 Heartbeat and Liveness Monitoring** — Detect stalled streams by requiring emissions within a time budget.

---

## Anchor operators

Rate gating (burst control):
- `debounceTime`
- `throttleTime`
- `auditTime`
- `sampleTime`

Other timing intents:
- `delay` (time shift)
- `bufferTime` (time batching)
- `timeout` (deadline)

---

## Decision questions

- **Do I want to control bursts?** If yes, do I want **silence**, **first per window**, **last per window**, or **periodic snapshots**?
- **Do I want the same values later?** If yes → `delay`.
- **Do I want values grouped into timed buckets?** If yes → `bufferTime`.
- **Do I need to enforce a deadline?** If yes → `timeout` (often paired with Error Handling).

---

## Operator map

### Rate gating (burst control)
- **Silence before emit** → `debounceTime`
- **Leading edge, then lockout** → `throttleTime`
- **Trailing-most per window** → `auditTime`
- **Periodic snapshot** → `sampleTime`

### Time shifting
- **Same values, later** → `delay`

### Time batching
- **Arrays per time window** → `bufferTime`

### Deadlines
- **Fail or switch when too slow** → `timeout`

---

## Specialization decision tree
mermaid flowchart TD
%% ========================= %% L1: Primary intent %% ========================= subgraph L1["L1 Intent"] direction LR L1I["What is your timing intent"] L1A["Control bursty emissions"] L1B["Shift emissions later"] L1C["Batch into time windows"] L1D["Enforce a deadline"] end
%% ========================= %% L2: Burst control chooser %% ========================= subgraph L2["L2 Burst control policy"] direction LR L2I["How should burst control behave"] L2A["Emit only after silence"] L2B["Emit first then ignore window"] L2C["Emit most recent after window"] L2D["Emit most recent on periodic tick"] end
%% ========================= %% L3: Operator leaves %% ========================= subgraph L3["L3 Operators"] direction LR O1["debounceTime"] O2["throttleTime"] O3["auditTime"] O4["sampleTime"] O5["delay"] O6["bufferTime"] O7["timeout"] end
%% ========================= %% Edges %% ========================= L1I -->|"Burst control"| L1A L1I -->|"Time shift"| L1B L1I -->|"Batching"| L1C L1I -->|"Deadline"| L1D
L1A -->|"Choose policy"| L2I
L2I -->|"Wait for quiet"| L2A L2I -->|"Leading edge"| L2B L2I -->|"Trailing most"| L2C L2I -->|"Periodic sampling"| L2D
L2A -->|"Use"| O1 L2B -->|"Use"| O2 L2C -->|"Use"| O3 L2D -->|"Use"| O4
L1B -->|"Use"| O5 L1C -->|"Use"| O6 L1D -->|"Use"| O7
### Leaf notes
- If your stream is **bursty**, choose among four gating policies:
  - silence → `debounceTime`
  - first per window → `throttleTime`
  - last per window → `auditTime`
  - periodic snapshots → `sampleTime`
- If your intent is not burst control:
  - shift → `delay`
  - batch → `bufferTime`
  - deadline → `timeout`

---

## Retrieval practice
- **T+1 day**: Re-derive the decision tree from memory.
- **T+3 days**: Rewrite the 6 rules for `debounceTime` without looking.
- **T+7 days**: Implement a typeahead scenario using a different dataset.