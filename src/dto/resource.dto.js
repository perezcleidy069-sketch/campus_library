export function pickFields(source, fields) {
  return Object.fromEntries(
    Object.keys(fields)
      .filter((field) => Object.hasOwn(source, field))
      .map((field) => [field, source[field]]),
  );
}
