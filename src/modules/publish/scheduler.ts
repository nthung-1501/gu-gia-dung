import type { PeakHour } from './types'

// Peak hours for Vietnamese TikTok audience (domestic home goods niche)
const PEAK_HOURS: PeakHour[] = [
  { hour: 7, dayOfWeek: -1, score: 7 },   // morning routine (all days)
  { hour: 12, dayOfWeek: -1, score: 8 },  // lunch break
  { hour: 19, dayOfWeek: -1, score: 10 }, // evening prime time
  { hour: 20, dayOfWeek: -1, score: 9 },  // evening
  { hour: 21, dayOfWeek: -1, score: 8 },  // evening
  { hour: 10, dayOfWeek: 0, score: 9 },   // Sunday morning
  { hour: 10, dayOfWeek: 6, score: 8 },   // Saturday morning
]

export function getNextPeakSlot(after: Date = new Date()): Date {
  const candidate = new Date(after)
  candidate.setMinutes(0, 0, 0)
  candidate.setHours(candidate.getHours() + 1)

  for (let i = 0; i < 168; i++) {
    const hour = candidate.getHours()
    const dayOfWeek = candidate.getDay()

    const isPeak = PEAK_HOURS.some(
      (p) => p.hour === hour && (p.dayOfWeek === -1 || p.dayOfWeek === dayOfWeek)
    )

    if (isPeak) return new Date(candidate)

    candidate.setHours(candidate.getHours() + 1)
  }

  return new Date(after.getTime() + 86400000)
}

export function getWeeklySchedule(startDate: Date, count: number): Date[] {
  const slots: Date[] = []
  let current = new Date(startDate)

  while (slots.length < count) {
    const slot = getNextPeakSlot(current)
    slots.push(slot)
    current = new Date(slot.getTime() + 3600000)
  }

  return slots
}
