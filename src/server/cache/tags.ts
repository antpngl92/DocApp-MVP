const CACHE_TAGS = {
  appointments: "appointments",
  clinicSettings: "clinic-settings",
  services: "services",
} as const;

const createScopedCacheTag = (tag: string, scopeId: string) => `${tag}:${scopeId}`;

export { CACHE_TAGS, createScopedCacheTag };
