import { useCallback, useEffect, useRef, useState } from 'react'
import { dispararAlarmaDescanso } from '../utils/helpers'
import { elapsedSeconds } from '../utils/restClock'
export default function useRestTimer(objetivo) {
  const [seconds, updateSeconds] = useState(0)
  const [running, updateRunning] = useState(false)
  const clock = useRef({ elapsed: 0, anchor: 0, running: false, alerted: false })
  const setSeconds = useCallback((value) => {
    const next = typeof value === 'function' ? value(clock.current.elapsed) : value
    clock.current.elapsed = next; clock.current.anchor = Date.now(); clock.current.alerted = false
    updateSeconds(next)
  }, [])
  const setRunning = useCallback((value) => {
    const c = clock.current
    const next = typeof value === 'function' ? value(c.running) : value
    if (c.running) { c.elapsed = elapsedSeconds(c.elapsed, c.anchor, Date.now()); updateSeconds(c.elapsed) }
    c.running = next; c.anchor = Date.now(); updateRunning(next)
  }, [])
  useEffect(() => {
    if (!running) return
    const tick = () => {
      const c = clock.current
      const value = elapsedSeconds(c.elapsed, c.anchor, Date.now())
      updateSeconds(value)
      if (value >= objetivo && !c.alerted) { c.alerted = true; dispararAlarmaDescanso() }
    }
    tick()
    const timer = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick) }
  }, [running, objetivo])
  return { seconds, setSeconds, running, setRunning }
}
