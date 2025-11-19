import { useEffect, useMemo, useState } from 'react'

const computeShift = (timeStr) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m
  const aStart = 7 * 60
  const aEnd = 15 * 60 + 30 // exclusive
  const bStart = 15 * 60 + 30
  const bEnd = 24 * 60 // treat 24:00 as 1440
  if (total >= aStart && total < aEnd) return 'A'
  if (total >= bStart && total <= bEnd) return 'B'
  return ''
}

export default function ProductionForm() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const nowHM = useMemo(() => {
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }, [])

  const [form, setForm] = useState({
    date: today,
    time: nowHM,
    shift: computeShift(nowHM),
    line: '',
    product: '',
    operator: '',
    count: '',
    defects: '0',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const s = computeShift(form.time)
    setForm((f) => ({ ...f, shift: s }))
  }, [form.time])

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const payload = {
        date: form.date ? form.date : undefined,
        time: form.time ? form.time : undefined,
        shift: form.shift || undefined,
        line: form.line || undefined,
        product: form.product || undefined,
        operator: form.operator || undefined,
        count: Number(form.count || 0),
        defects: Number(form.defects || 0),
        notes: form.notes || undefined,
      }
      const res = await fetch(`${baseUrl}/api/production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMessage({ type: 'success', text: `Saved for ${data.date} Shift ${data.shift}` })
      // Keep date/shift/time; clear counts
      setForm((f) => ({ ...f, count: '', defects: '0', notes: '' }))
    } catch (err) {
      setMessage({ type: 'error', text: err.message?.slice(0, 200) || 'Failed to save' })
    } finally {
      setLoading(false)
    }
  }

  const downloadExcel = async () => {
    if (!form.date || !form.shift) {
      setMessage({ type: 'error', text: 'Please select date and ensure time maps to a valid shift before export.' })
      return
    }
    try {
      const res = await fetch(`${baseUrl}/api/production/export?date_str=${form.date}&shift=${form.shift}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `production_${form.date}_shift_${form.shift}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-4">Production Entry</h2>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-blue-200 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Time</label>
            <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Shift</label>
            <input type="text" value={form.shift} readOnly className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" placeholder="Auto" />
            <p className="text-xs text-blue-300/60 mt-1">A: 07:00-15:30, B: 15:30-24:00</p>
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Line</label>
            <input type="text" value={form.line} onChange={(e) => update('line', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" placeholder="Line/Machine" />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Product</label>
            <input type="text" value={form.product} onChange={(e) => update('product', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" placeholder="Part Number" />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Operator</label>
            <input type="text" value={form.operator} onChange={(e) => update('operator', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" placeholder="Name/ID" />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Good Count</label>
            <input type="number" min="0" value={form.count} onChange={(e) => update('count', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Defects</label>
            <input type="number" min="0" value={form.defects} onChange={(e) => update('defects', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-blue-200 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="w-full bg-slate-900/60 text-white border border-slate-700 rounded px-3 py-2" rows={3} placeholder="Optional notes" />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
            <button disabled={loading} type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded transition-colors">{loading ? 'Saving...' : 'Save Entry'}</button>
            <button type="button" onClick={downloadExcel} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors">Download Excel for Date & Shift</button>
          </div>
        </form>
      </div>
    </div>
  )
}
