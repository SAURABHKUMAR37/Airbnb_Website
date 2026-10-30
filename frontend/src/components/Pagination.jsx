const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
      <span className="text-gray-600">Page <b>{page}</b> of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
    </div>
  )
}
export default Pagination
