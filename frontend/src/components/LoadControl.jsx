import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
export default function LoadControl({ label, value, unit, increments, onChange, min = 0, tourAdd, tourSubtract }) {
  const [step, setStep] = useState(increments[0])
  return <div className="load-control"><label>{label}</label><div className="load-value">{value}<small>{unit}</small></div>
    <div className="load-buttons"><button type="button" data-tour={tourSubtract} aria-label={`Restar ${step} ${unit}`} onClick={() => onChange(Math.max(min, +(value-step).toFixed(2)))}><Minus size={22}/></button><button type="button" data-tour={tourAdd} aria-label={`Sumar ${step} ${unit}`} onClick={() => onChange(+(value+step).toFixed(2))}><Plus size={22}/></button></div>
    <div className="load-increments">{increments.map(n => <button type="button" key={n} className={step===n ? 'selected' : ''} aria-pressed={step===n} onClick={() => setStep(n)}>±{n}</button>)}</div>
  </div>
}
