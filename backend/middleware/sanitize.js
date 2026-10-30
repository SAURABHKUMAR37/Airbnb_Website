/**
 * Strips Mongo operators ($...) and dotted keys from request bodies/params to block
 * NoSQL injection. (express-mongo-sanitize does not work with Express 5's read-only req.query,
 * so query-string values are coerced with String()/Number() where they are used instead.)
 */
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else value[key] = clean(value[key]);
    }
  }
  return value;
};

export default function sanitize(req, _res, next) {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  next();
}
