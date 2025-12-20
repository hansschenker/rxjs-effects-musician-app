# <Group Name>

**Governing statement:** <One sentence describing the governing behavior of this group.>

## Dominant use cases (10)
1) <Use case> — <Short description>
2) ...

## Anchor operators
- <operator>
- <operator>
- <operator>

## Decision questions
- <Question that maps intent to operator choice>
- ...

## Operator map
### Anchors
- ...

### Variants
- ...

## Specialization decision tree

## Retrieval practice
- T+1 day: Re-derive the decision tree from memory.
- T+3 days: Rewrite the 6 rules for one anchor operator without looking.
- T+7 days: Implement a scenario using a different dataset.
### `docs/operators/_templates/operator-page.template.md`
md

BehaviorIntent

BehaviorQualifier

Rules
Start
Emit
State
Completion
Cancellation
Error
Canonical example (TypeScript)
// minimal example
Pitfall and diagnosis
Pitfall:
Symptoms:
Fix:
Minimal marble test
// TestScheduler example
Use Case Explorer and Specialization Decision Tree
Primary use cases
: 
Specialization decision tree
flowchart TD
Leaf notes
…
### `docs/operators/_templates/decision-tree.template.mmd`
md
flowchart TD

%% Subgraphs stacked vertically; LR inside each
subgraph L1["L1 Intent"]
direction LR
I["What do you want to control"]
end

%% Add L2, L3...

%% Edges declared after nodes
```