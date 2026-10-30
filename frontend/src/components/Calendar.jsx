import { useState } from 'react'
import { toISO, todayISO } from '../utils'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * Availability calendar. Click a free day to pick check-in, then check-out.
 * `ranges` = booked [checkIn, checkOut) ranges as 'YYYY-MM-DD' strings.
 */
const Calendar = ({ ranges = [], checkIn, checkOut, onPick }) => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const today = todayISO()

  const shift = (dir) => {
    const d = new Date(year, month + dir, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const isBooked = (iso) => ranges.some((r) => iso >= r.checkIn && iso < r.checkOut)
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`b${i}`} />)
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(year, month, day)
    const past = iso < today
    const booked = isBooked(iso)
    const selected = iso === checkIn || iso === checkOut
    const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut
    // check-out day may be a booked day's start, so only block picking booked/past days as check-in
    const disabled = past || (booked && iso !== checkOut)

    let cls = 'bg-green-100 hover:bg-green-200 cursor-pointer'
    if (past) cls = 'bg-gray-100 text-gray-400 cursor-not-allowed'
    else if (booked) cls = 'bg-red-300 text-white cursor-not-allowed'
    if (inRange) cls = 'bg-red-100 text-red-700 cursor-pointer'
    if (selected) cls = 'bg-red-500 text-white font-bold cursor-pointer'

    cells.push(
      <button type="button" key={iso} disabled={disabled && !selected}
        onClick={() => onPick(iso)}
        title={booked ? 'Booked' : past ? 'Past' : 'Available'}
        className={`p-1.5 rounded text-xs ${cls}`}>
        {day}
      </button>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-300 inline-block" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-100 border border-green-300 inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-500 inline-block" /> Your stay</span>
      </div>
      <div className="flex justify-between items-center mb-3">
        <button type="button" onClick={() => shift(-1)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">❮</button>
        <h3 className="font-bold text-gray-800">{MONTHS[month]} {year}</h3>
        <button type="button" onClick={() => shift(1)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">❯</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">{cells}</div>
    </div>
  )
}
export default Calendar
