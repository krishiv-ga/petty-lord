export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface JsonValidationIssue {
  path: string;
  message: string;
}

export function inspectJsonValue(value: unknown): JsonValidationIssue[] {
  const issues: JsonValidationIssue[] = [];
  const ancestors = new Set<object>();

  const visit = (candidate: unknown, path: string): void => {
    if (candidate === null || typeof candidate === 'string' || typeof candidate === 'boolean') {
      return;
    }
    if (typeof candidate === 'number') {
      if (!Number.isFinite(candidate)) {
        issues.push({ path, message: 'numbers must be finite' });
      }
      return;
    }
    if (typeof candidate !== 'object') {
      issues.push({ path, message: `unsupported ${typeof candidate} value` });
      return;
    }
    if (ancestors.has(candidate)) {
      issues.push({ path, message: 'cyclic references are not serializable' });
      return;
    }

    ancestors.add(candidate);
    if (Array.isArray(candidate)) {
      for (const [index, entry] of candidate.entries()) {
        visit(entry, `${path}[${index}]`);
      }
    } else {
      const prototype = Object.getPrototypeOf(candidate) as object | null;
      if (prototype !== Object.prototype && prototype !== null) {
        issues.push({ path, message: 'only plain objects are serializable' });
      }
      for (const [key, entry] of Object.entries(candidate)) {
        visit(entry, path === '$' ? `$.${key}` : `${path}.${key}`);
      }
    }
    ancestors.delete(candidate);
  };

  visit(value, '$');
  return issues;
}

export function cloneJson<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => cloneJson(entry)) as T;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, cloneJson(entry)]),
  ) as T;
}

function normalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(normalizeJson);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeJson(value[key] as JsonValue)]),
    );
  }
  return Object.is(value, -0) ? 0 : value;
}

export function stableJson(value: unknown): string {
  const issues = inspectJsonValue(value);
  if (issues.length > 0) {
    throw new TypeError(
      `Value is not JSON-compatible: ${issues.map((issue) => `${issue.path} ${issue.message}`).join('; ')}`,
    );
  }
  return JSON.stringify(normalizeJson(value as JsonValue));
}
