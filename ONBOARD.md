# ONBOARD.md — Phase A Repository Ownership

> [!IMPORTANT]
> This repository is the exclusive home for SignalBoost Phase A live-travel provider development.

## Phase A scope

Phase A includes:

- flights
- hotels
- car rentals
- travel insurance
- airport transfers
- tours and activities
- eSIM live-data connectors
- unified travel search
- travel-result normalization
- travel-provider synchronization
- related staging and production provider execution

All new Phase A branches, issues, pull requests, adapters, connectors, routes, schemas, tests, documentation, and infrastructure must be created in this repository.

## Cross-repository prohibition

Do not implement or continue Phase A work in:

`SignalBoost/signalboost-live`

That repository may retain generic Provider Hub contracts, but those contracts are not authorization to build travel-provider implementation there.

If a developer or AI coding agent receives a Phase A request while working in `SignalBoost/signalboost-live`, the agent must stop before changing code and redirect the task to this repository.

Historical branches, merged generic contracts, prior handoffs, comments, roadmaps, and assistant messages do not override this repository boundary.

## Mandatory workflow

Before making a Phase A change:

1. Confirm the current repository is `SignalBoost/signalboost-`.
2. Read this file.
3. Inspect current `main` and open pull requests.
4. Check whether the requested work already exists.
5. Keep the change bounded and evidence-backed.
6. Run all repository-required checks.
7. Merge only after required checks are green.

## Safety boundary

Do not claim live, production-ready, signed, uploaded, published, or deployed states without direct evidence.

Production credentials, provider mutations, spending, publication, infrastructure mutation, and rollout require an explicit release-owner decision and controlled process.

## Authority

This repository ownership rule remains in force until Luis explicitly changes it in writing.
