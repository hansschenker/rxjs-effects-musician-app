# RxJS Operator Families

A docs-first repository that organizes **RxJS operators into behavioral families**

(operator groups) to make the RxJS surface area teachable and navigable.

## Goals

- Reduce the apparent complexity of 100+ RxJS operators into **16 operator groups**.
- Provide a consistent, reusable documentation format for each operator and group.
- Provide decision trees and a use-case index so learners can start from intent, not operator names.

## Operator groups

See: `docs/operators/groups-index.md`

## Documentation conventions

- All documentation artefacts are written in **Markdown**.
- Each operator page follows:
  - BehaviorIntent
  - BehaviorQualifier
  - 6 rules: Start, Emit, State, Completion, Cancellation, Error
  - Ends with a **Use Case Explorer and Specialization Decision Tree** section.

## Local development

## Credits

This library concept and API shape were inspired by a series of design sessions with ChatGPT (GPT-5.1 Thinking), exploring behavioral operator families, decision trees, and docs-first learning workflows for RxJS.