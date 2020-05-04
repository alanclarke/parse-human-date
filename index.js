const ms = require('ms')
const numbered = require('numbered')
const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
}

module.exports = function parseHumanDate (text, options = {}) {
  const { now = Date.now(), assumeFuture } = options
  let match
  text = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()

  if (text === 'today') return new Date()
  if (text === 'yesterday') return new Date(now - ms('1d'))
  if (text === 'tomorrow') return new Date(now + ms('1d'))

  // absolute date
  match = text.match(/^(?:on)?\s*(?:the)?\s*(\d\d?)(?:st|th|rd|nd)\s*(?:of)?\s*(jan(?:uary)?|feb(?:uary)?|mar(?:ch)?|apr(?:ril)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?\s*(\d+)?$/)
  if (match) {
    let [, day, month, year] = match
    day = Number(day)
    const date = new Date(now)

    const direction = assumeFuture ? 1 : -1

    if (month) {
      const index = MONTHS[month.substr(0, 3)]
      date.setMonth(date.getMonth() - 1)
      while (date.getMonth() !== index) {
        date.setMonth(date.getMonth() + direction)
      }
    } else {
      if (assumeFuture && date.getDate() > day) {
        date.setMonth(date.getMonth() + 1)
      }
      if (!assumeFuture && date.getDate() < day) {
        date.setMonth(date.getMonth() - 1)
      }
    }

    date.setDate(Number(day))
    if (year) date.setYear(Number(year))

    return date
  }

  // n period before after date
  match = text.match(/^(.+?)\s*(second|minute|hour|day|week|month|year)s?\s*(before|after)\s*(.+)$/)
  if (match) {
    let [, n, period, direction, reference] = match
    if (/^(last|next)$/.test(reference)) reference = `${reference} ${period}`
    const date = parseHumanDate(reference, { now, assumeFuture })
    if (date) {
      if (n === 'the') {
        n = 1
      } else if (/^[0-9]+$/.test(n)) {
        n = Number(n)
      } else {
        n = numbered.parse(n)
      }

      if (direction === 'before') n *= -1

      if (period === 'month') {
        date.setMonth(date.getMonth() + n)
        return date
      }
      if (period === 'year') {
        date.setYear(date.getFullYear() + n)
        return date
      }

      return new Date(Number(date) + ms(n + period.substr(0, 1)))
    }
  }

  // n period ago
  match = text.match(/^(.+?)\s*(second|minute|hour|day|week|month|year)s?\s*ago$/)
  if (match) {
    let [, n, period] = match
    if (n === 'a' || n === 'an') {
      n = 1
    } else if (/^[0-9]+$/.test(n)) {
      n = Number(n)
    } else {
      n = numbered.parse(n)
    }

    const date = new Date(now)
    if (period === 'month') {
      date.setMonth(date.getMonth() - n)
      return date
    }
    if (period === 'year') {
      date.setYear(date.getFullYear() - n)
      return date
    }

    return new Date(now - ms(n + period.substr(0, 1)))
  }

  // in n period time
  match = text.match(/^in\s*(.+?)\s*(second|minute|hour|day|week|month|year)s?\s*(?:time)?$/)
  if (match) {
    let [, n, period] = match
    if (n === 'a' || n === 'an') {
      n = 1
    } else if (/^[0-9]+$/.test(n)) {
      n = Number(n)
    } else {
      n = numbered.parse(n)
    }

    const date = new Date(now)
    if (period === 'month') {
      date.setMonth(date.getMonth() + n)
      return date
    }
    if (period === 'year') {
      date.setYear(date.getFullYear() + n)
      return date
    }

    return new Date(now + ms(n + period.substr(0, 1)))
  }

  // last period / next period
  match = text.match(/^(last|next)\s*(second|minute|hour|day|week|month|year)$/)
  if (match) {
    let [, direction, period] = match
    const n = 1

    direction = direction === 'last'
      ? -1
      : 1

    const date = new Date(now)
    if (period === 'month') {
      date.setMonth(date.getMonth() + (n * direction))
      return date
    }
    if (period === 'year') {
      date.setYear(date.getFullYear() + (n * direction))
      return date
    }

    return new Date(now + (direction * ms(1 + period.substr(0, 1))))
  }

  // tuesday last / next week
  match = text.match(/^(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s*(last|next)\s*week$/)
  if (match) {
    let [, day, direction] = match

    direction = direction === 'last'
      ? -1
      : 1

    const targetIndex = DAYS[day.substr(0, 3)]
    const date = new Date(now + (direction * ms('1w')))
    const currentIndex = date.getDay()

    date.setDate(date.getDate() + (targetIndex - currentIndex))

    return date
  }

  // next / last week on tuesday
  match = text.match(/^(last|next)\s*week\s*(?:on)?\s*(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)$/)
  if (match) {
    let [, direction, day] = match

    direction = direction === 'last'
      ? -1
      : 1

    const targetIndex = DAYS[day.substr(0, 3)]
    const date = new Date(now + (direction * ms('1w')))
    const currentIndex = date.getDay()

    date.setDate(date.getDate() + (targetIndex - currentIndex))

    return date
  }

  // last tuesday / next tuesday
  match = text.match(/^(last|this(?:comming)?|next)?\s*(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)$/)
  if (match) {
    let [, direction, day] = match
    const index = DAYS[day.substr(0, 3)]

    if (!direction && !assumeFuture) direction = 'last'
    direction = direction === 'last'
      ? -1
      : 1

    const date = new Date(now)

    do {
      date.setTime(date.getTime() + (ms('1d') * direction))
    } while (date.getDay() !== index)

    return date
  }

  // last march / next march
  match = text.match(/^(last|this(?:comming)?|next)?\s*(jan(?:uary)?|feb(?:uary)?|mar(?:ch)?|apr(?:ril)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)$/)
  if (match) {
    let [, direction, month] = match
    const index = MONTHS[month.substr(0, 3)]

    if (!direction && !assumeFuture) direction = 'last'
    direction = direction === 'last'
      ? -1
      : 1

    const date = new Date(now)

    do {
      date.setMonth(date.getMonth() + direction)
    } while (date.getMonth() !== index)

    return date
  }
}
