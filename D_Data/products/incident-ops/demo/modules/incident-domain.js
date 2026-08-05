export const STATUSES = Object.freeze(["investigating", "mitigating", "monitoring", "resolved"]);
export const SEVERITIES = Object.freeze(["SEV-1", "SEV-2", "SEV-3"]);

const TRANSITIONS = Object.freeze({
  investigating: new Set(["mitigating"]),
  mitigating: new Set(["investigating", "monitoring"]),
  monitoring: new Set(["mitigating", "resolved"]),
  resolved: new Set(["investigating"]),
});

export function validateIncident(incident) {
  if (!incident || typeof incident !== "object") throw new TypeError("incident_required");
  if (!/^INC-\d{4}$/.test(incident.id)) throw new TypeError("invalid_incident_id");
  if (!SEVERITIES.includes(incident.severity)) throw new TypeError("invalid_severity");
  if (!STATUSES.includes(incident.status)) throw new TypeError("invalid_status");
  if (!Array.isArray(incident.timeline)) throw new TypeError("timeline_required");
  return true;
}

export function transitionIncident(incident, nextStatus, event) {
  validateIncident(incident);
  if (!STATUSES.includes(nextStatus)) throw new TypeError("invalid_status");
  if (!TRANSITIONS[incident.status].has(nextStatus)) {
    throw new Error(`invalid_transition:${incident.status}->${nextStatus}`);
  }
  const timelineEvent = normalizeEvent(event, `State changed to ${nextStatus}`);
  return { ...incident, status: nextStatus, updatedAt: timelineEvent.at, timeline: [timelineEvent, ...incident.timeline] };
}

export function transferOwner(incident, owner, event) {
  validateIncident(incident);
  const normalizedOwner = typeof owner === "string" ? owner.trim().toUpperCase() : "";
  if (!normalizedOwner) throw new TypeError("owner_required");
  if (incident.status === "resolved") throw new Error("resolved_owner_locked");
  const timelineEvent = normalizeEvent(event, `Ownership transferred to ${normalizedOwner}`);
  return { ...incident, owner: normalizedOwner, updatedAt: timelineEvent.at, timeline: [timelineEvent, ...incident.timeline] };
}

export function beginRecovery(incident, event) {
  const next = incident.status === "mitigating" ? incident : transitionIncident(incident, "mitigating", event);
  const attempt = Number(incident.recovery?.attempt || 0) + 1;
  return { ...next, recovery: { attempt, status: "verifying", failureSignature: null } };
}

export function verifyRecovery(incident, outcome, event) {
  validateIncident(incident);
  if (incident.status !== "mitigating" || incident.recovery?.status !== "verifying") {
    throw new Error("recovery_not_verifying");
  }
  if (outcome === "failed") {
    const failureSignature = "edge-cache-verification-failed";
    const failed = transitionIncident(incident, "investigating", normalizeEvent(event, `Recovery verification failed · ${failureSignature}`));
    return { ...failed, recovery: { ...incident.recovery, status: "failed", failureSignature } };
  }
  if (outcome !== "passed") throw new TypeError("invalid_recovery_outcome");
  const passed = transitionIncident(incident, "monitoring", normalizeEvent(event, "Recovery verified · service entered monitoring"));
  return { ...passed, recovery: { ...incident.recovery, status: "verified", failureSignature: null } };
}

export function resolveIncident(incident, event) {
  if (incident.status !== "monitoring" || incident.recovery?.status !== "verified") {
    throw new Error("verified_recovery_required");
  }
  return transitionIncident(incident, "resolved", event);
}

export function createAuditEntry({ at, actor = "MAI", action, target, detail }) {
  if (!at || !action || !target) throw new TypeError("audit_fields_required");
  return Object.freeze({ at, actor, action, target, detail: String(detail || "") });
}

function normalizeEvent(event, fallbackSummary) {
  if (!event || !event.at) throw new TypeError("event_timestamp_required");
  return {
    at: String(event.at),
    actor: String(event.actor || "MAI"),
    summary: String(event.summary || fallbackSummary),
    detail: String(event.detail || ""),
  };
}
