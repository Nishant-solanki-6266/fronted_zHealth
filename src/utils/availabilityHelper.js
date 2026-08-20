import dayjs from 'dayjs'

/**
 * Check if a practitioner is available on a given dayjs date and optional time
 * @param {Object} prac - Practitioner object from DB / store
 * @param {dayjs.Dayjs} dayJsObj - The dayjs object representing the date
 * @param {number|null} hour - Optional hour (0-23)
 * @param {number} minute - Optional minute (0-59)
 * @returns {boolean} true if available, false if day off or outside working hours
 */
export const isPractitionerAvailable = (prac, dayJsObj, hour = null, minute = 0) => {
  if (!prac || !prac.availability) return true // Default available if no specific schedule set

  const dayNameCap = dayJsObj.format('dddd') // e.g. "Friday", "Monday"
  const dayNameLower = dayNameCap.toLowerCase() // "friday", "monday"

  let dayConfig = null

  if (Array.isArray(prac.availability)) {
    // Array format: [{ day: 'friday', available: false, startTime: '09:00', endTime: '17:00' }]
    dayConfig = prac.availability.find(
      item => (item.day && item.day.toLowerCase() === dayNameLower) ||
              (item.dayName && item.dayName.toLowerCase() === dayNameLower)
    )
  } else if (typeof prac.availability === 'object') {
    // Object format: { Friday: { available: false, startTime: '09:00', endTime: '17:00' } }
    dayConfig = prac.availability[dayNameCap] || prac.availability[dayNameLower]
  }

  if (!dayConfig) return true

  // Check if day is explicitly marked as unavailable / day off
  if (dayConfig.available === false || dayConfig.enabled === false || dayConfig.isWorking === false) {
    return false
  }

  // If specific hour is provided, check against startTime / endTime
  if (hour !== null && (dayConfig.startTime || dayConfig.start) && (dayConfig.endTime || dayConfig.end)) {
    const startStr = dayConfig.startTime || dayConfig.start || '09:00'
    const endStr = dayConfig.endTime || dayConfig.end || '17:00'
    const [startH, startM] = startStr.split(':').map(Number)
    const [endH, endM] = endStr.split(':').map(Number)

    const slotTotalMins = hour * 60 + minute
    const startTotalMins = (startH || 0) * 60 + (startM || 0)
    const endTotalMins = (endH || 0) * 60 + (endM || 0)

    if (slotTotalMins < startTotalMins || slotTotalMins >= endTotalMins) {
      return false
    }
  }

  return true
}

/**
 * Get availability summary label for a practitioner on a given date
 */
export const getPractitionerDayStatus = (prac, dayJsObj) => {
  if (!prac || !prac.availability) return { isAvailable: true, label: 'Available' }

  const isDayAvail = isPractitionerAvailable(prac, dayJsObj, null)
  if (!isDayAvail) {
    return { isAvailable: false, label: 'Day Off', reason: `${prac.name || 'Practitioner'} is unavailable on ${dayJsObj.format('dddd')}s` }
  }

  return { isAvailable: true, label: 'Working' }
}
