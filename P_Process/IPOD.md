# Process domain IPOD

## Input

- Validated canonical Data, staged Jekyll inputs, and explicit build/deployment requests.

## Process

- Run source, manifest, Canvas, topology, staging, artifact, and publication gates.
- Build only through an ephemeral workspace.
- Keep import tools, tests, validation, build, and publishing operations under explicit owners.

## Output

- Verified static artifacts, reports, evidence, and nonzero failures with phase context.

## Data feedback

- Logs and validation evidence return to `O_Output` reports.
- A failed process cannot mutate canonical Data or replace the last successful deployment.
