export function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

export function parsePagination(query) {
  const limit = query.limit === undefined ? 50 : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100
    || !Number.isSafeInteger(offset) || offset < 0) {
    return null;
  }
  return { limit, offset };
}

export function isPositiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
}

export function isOptionalText(maxLength) {
  return (value) => value === null || (typeof value === 'string' && value.length <= maxLength);
}

export function isRequiredText(maxLength) {
  return (value) => typeof value === 'string'
    && value.trim().length > 0
    && value.length <= maxLength;
}

export function isOptionalDate(value) {
  if (value === null) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }

  const localDateTime = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;
  const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  return (localDateTime.test(value) || isoDateTime.test(value) || dateOnly.test(value))
    && !Number.isNaN(Date.parse(value));
}

export function normalizeDateTime(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.replace('T', ' ');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value} 00:00:00`;
  }
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
}
