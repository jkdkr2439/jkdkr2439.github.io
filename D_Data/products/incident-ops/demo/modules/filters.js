const ACTIVE = new Set(["investigating", "mitigating", "monitoring"]);

export function filterIncidents(incidents, filters = {}) {
  const search = String(filters.search || "").trim().toLocaleLowerCase();
  return incidents.filter((incident) => {
    if (filters.severity && filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.owner === "unassigned" && incident.owner) return false;
    if (filters.owner && !["all", "unassigned"].includes(filters.owner) && incident.owner !== filters.owner) return false;
    if (filters.status === "active" && !ACTIVE.has(incident.status)) return false;
    if (filters.status && !["all", "active"].includes(filters.status) && incident.status !== filters.status) return false;
    if (search) {
      const haystack = [incident.id, incident.title, incident.service, incident.owner || "unassigned", incident.summary].join(" ").toLocaleLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function describeFilters(filters, resultCount) {
  const parts = [];
  if (filters.severity && filters.severity !== "all") parts.push(filters.severity);
  if (filters.owner && filters.owner !== "all") parts.push(filters.owner === "unassigned" ? "unassigned" : `owner ${filters.owner}`);
  if (filters.status && filters.status !== "active") parts.push(filters.status === "all" ? "all states" : filters.status);
  if (String(filters.search || "").trim()) parts.push(`matching "${String(filters.search).trim()}"`);
  const scope = parts.length ? ` · ${parts.join(" · ")}` : " · active incidents";
  return `Showing ${resultCount} ${resultCount === 1 ? "incident" : "incidents"}${scope}.`;
}
