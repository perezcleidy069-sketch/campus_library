export function validarRequest(fields, requiredFields = []) {
  return (req, res, next) => {
    const payload = req.body;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' });
    }

    const details = [];
    for (const key of Object.keys(payload)) {
      if (!Object.hasOwn(fields, key)) {
        details.push(`El campo "${key}" no está permitido.`);
      }
    }

    for (const field of requiredFields) {
      if (!Object.hasOwn(payload, field) || payload[field] === undefined || payload[field] === null) {
        details.push(`El campo "${field}" es obligatorio.`);
      }
    }

    for (const [field, value] of Object.entries(payload)) {
      if (Object.hasOwn(fields, field) && !fields[field](value)) {
        details.push(`El campo "${field}" no tiene un valor válido.`);
      }
    }

    if (requiredFields.length === 0 && Object.keys(payload).length === 0) {
      details.push('Debe proporcionar al menos un campo para actualizar.');
    }

    if (details.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos.', details });
    }

    next();
  };
}
