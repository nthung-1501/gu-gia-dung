import { getNextPeakSlot, getWeeklySchedule } from '../scheduler'

// All valid peak hours including weekend-only slots (10:00 Sat/Sun)
const PEAK_HOURS = [7, 10, 12, 19, 20, 21]

describe('getNextPeakSlot', () => {
  it('returns a future date', () => {
    const now = new Date()
    const slot = getNextPeakSlot(now)
    expect(slot.getTime()).toBeGreaterThan(now.getTime())
  })

  it('returns a date at a peak hour', () => {
    const now = new Date()
    const slot = getNextPeakSlot(now)
    expect(PEAK_HOURS).toContain(slot.getHours())
  })

  it('returns slot at zero minutes and seconds', () => {
    const now = new Date()
    const slot = getNextPeakSlot(now)
    expect(slot.getMinutes()).toBe(0)
    expect(slot.getSeconds()).toBe(0)
  })

  it('skips the current hour if mid-hour', () => {
    // Set time to 19:30 — should NOT return 19:xx this same day; next peak is 20:00
    const base = new Date()
    base.setHours(19, 30, 0, 0)
    const slot = getNextPeakSlot(base)
    // Slot must be strictly after base
    expect(slot.getTime()).toBeGreaterThan(base.getTime())
    expect(PEAK_HOURS).toContain(slot.getHours())
  })

  it('finds a peak slot within 24 hours', () => {
    const now = new Date()
    const slot = getNextPeakSlot(now)
    const diffHours = (slot.getTime() - now.getTime()) / 3600000
    expect(diffHours).toBeLessThanOrEqual(24)
  })
})

describe('getWeeklySchedule', () => {
  it('returns the requested number of slots', () => {
    const slots = getWeeklySchedule(new Date(), 5)
    expect(slots).toHaveLength(5)
  })

  it('all slots are at peak hours', () => {
    const slots = getWeeklySchedule(new Date(), 7)
    for (const slot of slots) {
      expect(PEAK_HOURS).toContain(slot.getHours())
    }
  })

  it('slots are in ascending order', () => {
    const slots = getWeeklySchedule(new Date(), 4)
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].getTime()).toBeGreaterThan(slots[i - 1].getTime())
    }
  })

  it('returns 1 slot correctly', () => {
    const slots = getWeeklySchedule(new Date(), 1)
    expect(slots).toHaveLength(1)
    expect(PEAK_HOURS).toContain(slots[0].getHours())
  })
})
