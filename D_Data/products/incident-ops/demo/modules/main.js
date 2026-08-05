import { incidentFixture, initialAudit, services } from './fixture.js";
import { beginRecovery, createAuditEntry, resolveIncident, transferOwner, verifyRecovery } from './incident-domain.js";
import { describeFilters, filterIncidents } from './filters.js";
import { loadFilters, saveFilters } from './store.js";

const state = {
  incidents: structuredClone(incidentFixture),
  audit: structuredClone(initialAudit),
  filters: loadFilters(),
  selectedId: "INC-1042",
  cursor: 0,
};

const dom = {
  rows: byId("incident-rows"), empty: byId("empty-state"), summary: byId("filter-summary"), search: byId("search"),
  ownerFilter: byId("owner-filter"), statusFilter: byId("status-filter"), severityFilter: byId("severity-filter"),
  detailService: byId("detail-service"), detailTitle: byId("detail-title"), detailSeverity: byId("detail-severity"),
  detailSummary: byId("detail-summary"), detailOwner: byId("detail-owner"), detailState: byId("detail-state"),
  detailOpened: byId("detail-opened"), nextAction: byId("next-action"), timeline: byId("timeline"),
  recoveryOpen: byId("recovery-open"), assignOpen: byId("assign-open"), recoveryDialog: byId("recovery-dialog"),
  recoveryIncident: byId("recovery-incident"), recoveryCopy: byId("recovery-copy"), recoveryResult: byId("recovery-result"), recoveryRun: byId("recovery-run"),
  assignDialog: byId("assign-dialog"), assignForm: byId("assign-form"), assignOwner: byId("assign-owner"),
  auditPanel: byId("audit-panel"), auditToggle: byId("audit-toggle"), auditList: byId("audit-list"),
  shortcutsDialog: byId("shortcuts-dialog"),
};

boot();

function boot() {
  renderServices();
  hydrateFilterControls();
  bindControls();
  render();
  exposeBoundedDebugSurface();
}

function render() {
  const visible = filterIncidents(state.incidents, state.filters);
  if (visible.length && !visible.some((item) => item.id === state.selectedId)) state.selectedId = visible[0].id;
  state.cursor = Math.max(0, visible.findIndex((item) => item.id === state.selectedId));
  renderQueue(visible);
  renderDetail(selectedIncident());
  renderAudit();
  renderMetrics();
  dom.summary.textContent = describeFilters(state.filters, visible.length);
  dom.empty.hidden = visible.length !== 0;
  saveFilters(state.filters);
}

function renderServices() {
  const container = byId("services");
  container.replaceChildren(...services.map((service) => {
    const card = element("article", "service-card");
    const top = element("div", "service-top");
    const title = element("h3", "", service.name);
    const label = element("span", `state-label state-${service.state}`, service.label);
    const metric = element("p", "", service.metric);
    top.append(title, label); card.append(top, metric); return card;
  }));
}

function renderQueue(visible) {
  dom.rows.replaceChildren(...visible.map((incident) => {
    const row = document.createElement("tr");
    row.tabIndex = incident.id === state.selectedId ? 0 : -1;
    row.dataset.incidentId = incident.id;
    row.setAttribute("aria-selected", String(incident.id === state.selectedId));
    row.append(
      cell(badge(incident.severity, `severity-badge severity-${incident.severity}`)),
      cell(incidentName(incident)),
      cell(element("span", `owner-pill${incident.owner ? "" : " unassigned"}`, incident.owner || "UNASSIGNED")),
      cell(element("span", `status-text status-${incident.status}`, labelStatus(incident.status))),
      cell(element("span", "age", incident.age)),
    );
    row.addEventListener("click", () => selectIncident(incident.id, true));
    row.addEventListener("keydown", (event) => { if (event.key === "Enter") selectIncident(incident.id, true); });
    return row;
  }));
}

function renderDetail(incident) {
  if (!incident) {
    dom.detailService.textContent = "No visible incident"; dom.detailTitle.textContent = "Change or clear filters";
    dom.detailSeverity.textContent = "—"; dom.detailSeverity.className = "severity-badge"; dom.detailSummary.textContent = "No incident matches the current filter set.";
    dom.detailOwner.textContent = "—"; dom.detailState.textContent = "—"; dom.detailOpened.textContent = "—"; dom.nextAction.textContent = "Clear filters to resume triage.";
    dom.timeline.replaceChildren(); dom.recoveryOpen.disabled = true; dom.assignOpen.disabled = true; return;
  }
  dom.detailService.textContent = `${incident.id} · ${incident.service}`;
  dom.detailTitle.textContent = incident.title;
  dom.detailSeverity.textContent = incident.severity;
  dom.detailSeverity.className = `severity-badge severity-${incident.severity}`;
  dom.detailSummary.textContent = incident.summary;
  dom.detailOwner.textContent = incident.owner || "UNASSIGNED";
  dom.detailState.textContent = labelStatus(incident.status);
  dom.detailOpened.textContent = incident.openedAt;
  dom.nextAction.textContent = incident.nextAction;
  dom.recoveryOpen.disabled = !incident.owner || incident.status === "resolved";
  dom.assignOpen.disabled = incident.status === "resolved";
  dom.recoveryOpen.lastChild.textContent = incident.status === "monitoring" && incident.recovery?.status === "verified" ? " Confirm resolution" : " Begin recovery";
  dom.timeline.replaceChildren(...incident.timeline.map((event) => {
    const item = document.createElement("li");
    const time = element("span", "timeline-time", event.at);
    const content = document.createElement("div");
    const title = element("strong", "", `${event.actor} · ${event.summary}`);
    const detail = element("p", "", event.detail);
    content.append(title, detail); item.append(time, content); return item;
  }));
}

function renderAudit() {
  dom.auditList.replaceChildren(...state.audit.map((entry) => {
    const item = document.createElement("li");
    const time = document.createElement("time"); time.textContent = entry.at;
    const code = document.createElement("code"); code.textContent = `${entry.actor} / ${entry.action}`;
    const detail = element("span", "", `${entry.target} · ${entry.detail}`);
    item.append(time, code, detail); return item;
  }));
}

function renderMetrics() {
  const active = state.incidents.filter((incident) => incident.status !== "resolved");
  byId("metric-open").textContent = String(active.length).padStart(2, "0");
  byId("metric-unassigned").textContent = String(active.filter((incident) => !incident.owner).length).padStart(2, "0");
  byId("metric-recovery").textContent = String(active.filter((incident) => incident.status === "mitigating").length).padStart(2, "0");
  const critical = active.some((incident) => incident.severity === "SEV-1");
  byId("system-status").textContent = critical ? "DEGRADED" : active.length ? "WATCHING" : "NOMINAL";
}

function bindControls() {
  dom.search.addEventListener("input", () => updateFilters({ search: dom.search.value }));
  dom.ownerFilter.addEventListener("change", () => updateFilters({ owner: dom.ownerFilter.value }));
  dom.statusFilter.addEventListener("change", () => updateFilters({ status: dom.statusFilter.value }));
  dom.severityFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-severity]"); if (!button) return; setSeverity(button.dataset.severity);
  });
  byId("clear-filters").addEventListener("click", clearFilters);
  dom.recoveryOpen.addEventListener("click", openRecovery);
  dom.assignOpen.addEventListener("click", () => { dom.assignOwner.value = ""; dom.assignDialog.showModal(); });
  dom.assignForm.addEventListener("submit", transferSelectedOwner);
  dom.recoveryRun.addEventListener("click", runRecovery);
  dom.auditToggle.addEventListener("click", toggleAudit);
  byId("audit-close").addEventListener("click", () => setAudit(false));
  byId("shortcuts-open").addEventListener("click", () => dom.shortcutsDialog.showModal());
  document.addEventListener("keydown", handleShortcut);
}

function handleShortcut(event) {
  if (event.defaultPrevented) return;
  const typing = ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "Escape") { if (!dom.auditPanel.hidden) setAudit(false); return; }
  if (typing || document.querySelector("dialog[open]")) return;
  const key = event.key.toLowerCase();
  if (key === "/") { event.preventDefault(); dom.search.focus(); return; }
  if (["1", "2", "3"].includes(key)) { event.preventDefault(); setSeverity(`SEV-${key}`); return; }
  if (key === "?") { event.preventDefault(); dom.shortcutsDialog.showModal(); return; }
  if (key === "a") { event.preventDefault(); toggleAudit(); return; }
  if (key === "r" && !dom.recoveryOpen.disabled) { event.preventDefault(); openRecovery(); return; }
  if (["j", "k"].includes(key)) { event.preventDefault(); moveCursor(key === "j" ? 1 : -1); return; }
  if (event.key === "Enter") { const row = document.querySelector('tr[aria-selected="true"]'); if (row) row.focus(); }
}

function moveCursor(delta) {
  const visible = filterIncidents(state.incidents, state.filters); if (!visible.length) return;
  state.cursor = (Math.max(0, visible.findIndex((item) => item.id === state.selectedId)) + delta + visible.length) % visible.length;
  selectIncident(visible[state.cursor].id, true);
}

function selectIncident(id, focus = false) {
  state.selectedId = id; render();
  if (focus) document.querySelector(`[data-incident-id="${id}"]`)?.focus();
}

function updateFilters(patch) { state.filters = { ...state.filters, ...patch }; render(); }
function setSeverity(severity) {
  updateFilters({ severity });
  document.querySelectorAll("[data-severity]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.severity === severity)));
}
function clearFilters() {
  state.filters = { search: "", severity: "all", owner: "all", status: "active" };
  hydrateFilterControls(); render(); dom.search.focus();
}
function hydrateFilterControls() {
  dom.search.value = state.filters.search; dom.ownerFilter.value = state.filters.owner; dom.statusFilter.value = state.filters.status;
  document.querySelectorAll("[data-severity]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.severity === state.filters.severity)));
}

function openRecovery() {
  const incident = selectedIncident(); if (!incident || !incident.owner || incident.status === "resolved") return;
  dom.recoveryIncident.textContent = `${incident.id} · ${incident.service} · ${incident.owner}`;
  dom.recoveryResult.className = "recovery-result"; dom.recoveryResult.textContent = "";
  dom.recoveryCopy.textContent = incident.status === "monitoring" && incident.recovery.status === "verified"
    ? "Recovery is verified. Resolution requires one explicit confirmation."
    : "The current incident context and owner will be preserved if the deterministic verification fails.";
  dom.recoveryRun.textContent = incident.status === "monitoring" && incident.recovery.status === "verified" ? "Confirm incident resolution" : "Run recovery verification";
  updateRecoverySteps(incident); dom.recoveryDialog.showModal();
}

function runRecovery() {
  let incident = selectedIncident(); if (!incident) return;
  if (incident.status === "monitoring" && incident.recovery.status === "verified") {
    incident = resolveIncident(incident, eventNow("Incident resolved after explicit verification", "Recovery evidence retained in the local audit."));
    replaceIncident(incident); appendAudit("RESOLVED", incident.id, "Verified recovery explicitly confirmed");
    dom.recoveryDialog.close(); render(); return;
  }
  try {
    if (incident.status !== "mitigating" || incident.recovery.status !== "verifying") {
      incident = beginRecovery(incident, eventNow("Recovery attempt started", "Bounded local fixture; no production action."));
      appendAudit("RECOVERY_STARTED", incident.id, `Attempt ${incident.recovery.attempt}`);
    }
    const outcome = incident.recovery.attempt === 1 ? "failed" : "passed";
    incident = verifyRecovery(incident, outcome, eventNow(outcome === "failed" ? "Recovery verification failed" : "Recovery verification passed", outcome === "failed" ? "Context preserved; retry remains available." : "Service returned to the monitoring boundary."));
    replaceIncident(incident);
    if (outcome === "failed") {
      appendAudit("RECOVERY_FAILED", incident.id, `${incident.recovery.failureSignature}; context preserved`);
      dom.recoveryResult.className = "recovery-result failed";
      dom.recoveryResult.textContent = "Verification failed with edge-cache-verification-failed. Nothing was discarded. Retry from the same incident context.";
      dom.recoveryRun.textContent = "Retry recovery verification";
    } else {
      appendAudit("RECOVERY_VERIFIED", incident.id, `Attempt ${incident.recovery.attempt} passed`);
      dom.recoveryResult.className = "recovery-result passed";
      dom.recoveryResult.textContent = "Verification passed. The incident is monitoring; resolution still requires explicit confirmation.";
      dom.recoveryRun.textContent = "Confirm incident resolution";
    }
    updateRecoverySteps(incident); render();
  } catch (error) {
    dom.recoveryResult.className = "recovery-result failed";
    dom.recoveryResult.textContent = `Recovery blocked: ${safeReason(error)}.`;
  }
}

function transferSelectedOwner(event) {
  event.preventDefault();
  const incident = selectedIncident();
  try {
    const updated = transferOwner(incident, dom.assignOwner.value, eventNow(`Ownership transferred to ${dom.assignOwner.value}`, "Transfer recorded with local operator context."));
    replaceIncident(updated); appendAudit("OWNER_TRANSFERRED", updated.id, `${incident.owner || "UNASSIGNED"} → ${updated.owner}`);
    dom.assignDialog.close(); render();
  } catch (error) { dom.assignOwner.setCustomValidity(safeReason(error)); dom.assignOwner.reportValidity(); dom.assignOwner.setCustomValidity(""); }
}

function updateRecoverySteps(incident) {
  const steps = [...document.querySelectorAll(".step")]; steps.forEach((step) => step.classList.remove("complete", "failed"));
  if (incident.recovery.attempt > 0) steps[0].classList.add("complete");
  if (["verifying", "verified"].includes(incident.recovery.status)) steps[1].classList.add("complete");
  if (incident.recovery.status === "verified") steps[2].classList.add("complete");
  if (incident.recovery.status === "failed") steps[2].classList.add("failed");
}

function toggleAudit() { setAudit(dom.auditPanel.hidden); }
function setAudit(open) { dom.auditPanel.hidden = !open; dom.auditToggle.setAttribute("aria-expanded", String(open)); if (open) byId("audit-close").focus(); else dom.auditToggle.focus(); }
function selectedIncident() { return state.incidents.find((incident) => incident.id === state.selectedId) || null; }
function replaceIncident(updated) { state.incidents = state.incidents.map((incident) => incident.id === updated.id ? updated : incident); }
function appendAudit(action, target, detail) { state.audit.unshift(createAuditEntry({ at: clock(), actor: "MAI", action, target, detail })); }
function eventNow(summary, detail) { return { at: clock().slice(0, 5), actor: "MAI", summary, detail }; }
function clock() { return new Date().toISOString().slice(11, 19); }
function safeReason(error) { return String(error?.message || "unknown_failure").replace(/[^a-zA-Z0-9 _:\-→]/g, "").slice(0, 120); }
function labelStatus(status) { return status.charAt(0).toUpperCase() + status.slice(1); }
function byId(id) { return document.getElementById(id); }
function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; node.textContent = text; return node; }
function badge(text, className) { return element("span", className, text); }
function cell(content) { const node = document.createElement("td"); node.append(content); return node; }
function incidentName(incident) { const node = element("span", "incident-name"); node.append(element("strong", "", incident.title), element("span", "", `${incident.id} · ${incident.service}`)); return node; }
function exposeBoundedDebugSurface() { window.__RELAY_DEBUG__ = Object.freeze({ product: "incident-operations-001", pipeline: "ready_for_execution", getState: () => ({ selectedId: state.selectedId, filters: { ...state.filters }, incidentCount: state.incidents.length, incidentStates: state.incidents.map(({ id, status }) => ({ id, status })), auditCount: state.audit.length }) }); }
