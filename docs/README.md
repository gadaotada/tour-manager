# Tour Manager Docs

This directory is the planning home for the app. Keep it lightweight, current, and useful while the product shape is still forming.

## Map

- [Current State](./CURRENT_STATE.md): what exists today and what the codebase appears optimized for.
- [Roadmap](./ROADMAP.md): product direction, ordered by useful milestones.
- [Plans](./plans/): concrete implementation plans for the next slices of work.
- [Decisions](./decisions/): short architecture and product decision records.

## Planning Rhythm

1. Keep `CURRENT_STATE.md` honest when a meaningful capability lands.
2. Add or update a plan in `plans/` before starting a larger feature.
3. Capture decisions that affect future work in `decisions/`.
4. Prefer small, shippable vertical slices over broad infrastructure-only work.

## Plan Template

```md
# Plan: Short Name

Date: YYYY-MM-DD
Status: Draft | Active | Done | Paused

## Goal

What user or operator outcome this plan enables.

## Scope

- Included item
- Included item

## Out Of Scope

- Explicit non-goal

## Work

1. First implementation step
2. Second implementation step

## Validation

- Test, typecheck, or manual check
```
