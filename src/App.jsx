import ProductionForm from './components/ProductionForm'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Production Count</h1>
            <p className="text-blue-200">Record production for defined shifts and export to Excel by date and shift.</p>
          </div>

          <ProductionForm />

          <div className="text-center mt-8">
            <p className="text-sm text-blue-300/60">Shifts: A (07:00-15:30) • B (15:30-24:00)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
