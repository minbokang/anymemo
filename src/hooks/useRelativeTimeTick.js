import { useEffect, useState } from 'react'

const TICK_MS = 60_000

/** 목록 상대 시간 표시 갱신용 (1분 간격) */
export function useRelativeTimeTick() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), TICK_MS)
    return () => clearInterval(id)
  }, [])

  return tick
}
