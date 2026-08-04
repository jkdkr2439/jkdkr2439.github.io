# Input domain IPOD

## Input

- Canonical paths declared by `D_Data/contracts/source-map.json`.
- Canonical content, manifests, configuration, media, and display sources.

## Process

- Validate that every source and destination is relative and uniquely owned.
- Reject missing sources, path traversal, and destination collisions.
- Copy sources into an ephemeral Jekyll-compatible workspace.

## Output

- A complete conventional Jekyll source tree.
- A sorted report of copied files.

## Data feedback

- Input errors are returned to the process gate as explicit failures.
- Canonical inputs are never modified or silently repaired.
