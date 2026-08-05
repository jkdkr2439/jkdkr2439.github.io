export const services = Object.freeze([
  { name: "Checkout API", state: "critical", label: "Critical", metric: "18.4% errors · 4m" },
  { name: "Edge cache", state: "degraded", label: "Degraded", metric: "312ms p95 · 12m" },
  { name: "Events pipeline", state: "degraded", label: "Degraded", metric: "8.2k lag · 19m" },
  { name: "Identity", state: "nominal", label: "Nominal", metric: "99.99% · 24h" },
]);

export const incidentFixture = Object.freeze([
  {
    id: "INC-1042", severity: "SEV-1", service: "Checkout API", title: "Payment authorization error rate above threshold",
    summary: "Authorization requests in the EU region are returning timeout responses. No charge duplication is observed in the local fixture.",
    owner: "MAI", status: "investigating", openedAt: "14:08", updatedAt: "14:29", age: "24m", recovery: { attempt: 0, status: "idle", failureSignature: null },
    nextAction: "Apply the bounded edge-routing mitigation, then verify authorization latency before resolving.",
    timeline: [
      { at: "14:29", actor: "MAI", summary: "Scope narrowed to EU authorization path", detail: "Order creation remains nominal; timeout begins after provider handoff." },
      { at: "14:18", actor: "SYSTEM", summary: "Owner acknowledged", detail: "MAI became primary incident owner." },
      { at: "14:08", actor: "MONITOR", summary: "Incident opened", detail: "Five-minute error rate crossed the SEV-1 fixture boundary." },
    ],
  },
  {
    id: "INC-1039", severity: "SEV-2", service: "Edge cache", title: "Stale catalog responses in two regions",
    summary: "A cache generation mismatch affects product metadata. Traffic remains available with stale reads.",
    owner: "SRE-WEST", status: "mitigating", openedAt: "13:51", updatedAt: "14:27", age: "41m", recovery: { attempt: 1, status: "verifying", failureSignature: null },
    nextAction: "Verify cache generation convergence. Preserve the current attempt if the check fails.",
    timeline: [
      { at: "14:27", actor: "SRE-WEST", summary: "Recovery verification started", detail: "Cache purge applied to bounded canary nodes." },
      { at: "14:02", actor: "NOAH", summary: "Ownership transferred", detail: "SRE-WEST accepted primary responsibility." },
      { at: "13:51", actor: "MONITOR", summary: "Incident opened", detail: "Catalog freshness SLO crossed warning threshold." },
    ],
  },
  {
    id: "INC-1036", severity: "SEV-2", service: "Events pipeline", title: "Consumer lag delaying fulfillment events",
    summary: "Event consumers are processing below ingress rate. Fulfillment remains correct but delayed.",
    owner: null, status: "investigating", openedAt: "13:23", updatedAt: "14:11", age: "1h 09m", recovery: { attempt: 0, status: "idle", failureSignature: null },
    nextAction: "Assign a responder before mitigation. Ownership is required to keep recovery accountable.",
    timeline: [
      { at: "14:11", actor: "SYSTEM", summary: "Escalation reminder issued", detail: "Incident remains unassigned after forty-eight minutes." },
      { at: "13:23", actor: "MONITOR", summary: "Incident opened", detail: "Consumer lag crossed the operational fixture boundary." },
    ],
  },
  {
    id: "INC-1028", severity: "SEV-3", service: "Identity", title: "Elevated sign-in latency for legacy clients",
    summary: "Legacy clients retry once before success. Modern clients and token issuance remain nominal.",
    owner: "NOAH", status: "monitoring", openedAt: "11:42", updatedAt: "14:02", age: "2h 50m", recovery: { attempt: 1, status: "verified", failureSignature: null },
    nextAction: "Observe two more fixture intervals, then explicitly confirm resolution.",
    timeline: [
      { at: "14:02", actor: "NOAH", summary: "Recovery verified", detail: "Latency returned below 180ms for two intervals." },
      { at: "12:34", actor: "NOAH", summary: "Connection pool adjusted", detail: "Bounded change applied to legacy client pool." },
      { at: "11:42", actor: "MONITOR", summary: "Incident opened", detail: "Legacy sign-in latency crossed the SEV-3 fixture boundary." },
    ],
  },
  {
    id: "INC-1017", severity: "SEV-3", service: "Search", title: "Index refresh completed after retry",
    summary: "A failed index refresh recovered on the second deterministic attempt.", owner: "MAI", status: "resolved", openedAt: "09:05", updatedAt: "10:12", age: "Resolved", recovery: { attempt: 2, status: "verified", failureSignature: null },
    nextAction: "No action required. Retain the audit record for review.", timeline: [{ at: "10:12", actor: "MAI", summary: "Incident resolved", detail: "Second refresh attempt passed verification." }],
  },
]);

export const initialAudit = Object.freeze([
  { at: "14:29:12", actor: "MAI", action: "SCOPE_UPDATED", target: "INC-1042", detail: "EU authorization path isolated" },
  { at: "14:27:04", actor: "SRE-WEST", action: "RECOVERY_STARTED", target: "INC-1039", detail: "Canary cache purge" },
  { at: "14:18:33", actor: "MAI", action: "ACKNOWLEDGED", target: "INC-1042", detail: "Primary ownership accepted" },
  { at: "14:11:09", actor: "SYSTEM", action: "OWNER_REQUIRED", target: "INC-1036", detail: "Unassigned escalation threshold reached" },
]);
