/** Display-only (value) or interactive (onChange) 1-5 star rating. */
const Stars = ({ value = 0, onChange, size = 'text-2xl' }) => (
  <div className={`inline-flex gap-1 ${size}`} role={onChange ? 'radiogroup' : undefined}>
    {[1, 2, 3, 4, 5].map((n) => {
      const filled = n <= Math.round(value)
      return onChange ? (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`${filled ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition`}>★</button>
      ) : (
        <span key={n} className={filled ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      )
    })}
  </div>
)
export default Stars
