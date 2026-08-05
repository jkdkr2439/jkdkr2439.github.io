# Products Showcase Publication Design

**Date:** 2026-08-05  
**Status:** Approved  
**Scope:** Publish SIGNAL Newsroom and Common Form Digital Goods at `/products/` through the existing DIPOD/IPOD site compiler and GitHub Pages pipeline.

## Intent

Products becomes a first-class Site Canvas destination. The blog will publish two verified product demonstrations and their case studies without importing Fullstack Agent memory, SQLite stores, machine paths, private pipeline logs, or generated implementation state as canonical blog data.

## Ownership and boundaries

- `D_Data/products/` owns the public-safe product manifest, product metadata, demonstrations, case-study content, and architecture summaries.
- `D_Data/platform/registry/modules.json` declares Products active and routes it to `/products/`.
- `I_Input/products/` loads and validates canonical product data into a bounded build input.
- `P_Process/products/` owns product contracts and deterministic publication logic.
- `P_Process/build/build_products.py` builds the isolated Products artifact.
- `P_Process/build/compose_site.py` mounts that artifact at `/products/` and rejects collisions with Platform or Writing.
- `D_Display/products/` owns the Products shell, styles, and browser behavior. It does not own product facts.
- `O_Output/` stores validation reports and evidence only; generated output is never canonical input.

The existing Fullstack Agent repository remains the verified upstream producer. Publication is a deliberate public-safe export into the blog's canonical Product owner, not a runtime dependency between repositories.

## Public information model

The manifest contains stable identifiers, bilingual labels, family, summary, status, routes, stack, proof labels, and explicit asset entries. Each product package contains:

- a gallery card;
- a local static demonstration;
- a case study covering behavior, design rationale, implemented architecture, target backend architecture, and data flow;
- public verification facts such as deterministic test counts and recovery behavior.

Internal paths, database files, raw journals, prompts, tokens, secrets, and machine-specific metadata are forbidden. Browser acceptance that was blocked by host tooling is presented as pending rather than passed.

## Build and data flow

```text
Verified Fullstack Agent export
  -> reviewed public-safe canonical package in D_Data/products
  -> I_Input product loader and contract validation
  -> isolated Products builder
  -> /products/ artifact
  -> atomic Site compositor alongside /writing/
  -> GitHub validation and Pages deployment
```

The product builder copies only allow-listed canonical assets and Display runtime files. The compositor fails on ownership collision or a missing Products entry page and does not replace the last successful destination on failure.

## Display behavior

`/products/` provides a responsive, keyboard-accessible gallery for SIGNAL and Common Form Digital Goods. Every card links to its demo and case study. Case studies expose folder architecture and backend target boundaries so the portfolio demonstrates maintainability and scale, not only visual output. Navigation returns to the Site Canvas without coupling Products to Writing internals.

## Validation and testing

TDD adds failing contracts before implementation for:

- active Products registry ownership and route uniqueness;
- manifest schema, stable routes, and public-safe content;
- deterministic product build and allow-list enforcement;
- compositor mounting at `/products/` without affecting `/writing/`;
- semantic landmarks, responsive CSS, keyboard focus, safe resource paths, and two complete products;
- full canonical validation, Python tests, Node browser contracts, and production build.

The final generated artifact is inspected locally. If browser tooling remains unavailable, automated browser contracts pass while manual browser acceptance remains explicitly pending.

## Publication

After all local gates pass, commits are pushed to `main`. Existing `validate.yml` and `pages.yml` build from canonical source, upload the verified composed artifact, and deploy GitHub Pages. The workflow run is monitored to a successful conclusion; failures stop publication and are reported with evidence.

## Non-goals

- No changes to authored Writing content.
- No coupling Products to Jekyll's Writing implementation.
- No publication of internal Agent stores or raw execution journals.
- No payment processing, backend service, or live commerce API.
- No redesign of unrelated Site Canvas modules.
