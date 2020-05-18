const ms = require('ms')
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WEEKDAY_INDEX = createShorthandIndex(WEEKDAYS)
const MONTHS = ['january', 'febuary', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const MONTH_INDEX = createShorthandIndex(MONTHS)
const wordsToNumbers = require('words-to-numbers').default

// in 2 years and 5 weeks
const PATTERNS = {
  // avoid confusion between 'monday' and 'month'
  WEEKDAYS: toPattern(WEEKDAYS).replace('mon(', 'mon(?!th)('),
  MONTHS: toPattern(MONTHS),
  ORDINAL: '(?:st|th|rd|nd)',
  PERIOD: '(sec(?:ond)|min(?:ute)?|h(?:ou)?r|day|week|month|year)s?',
  QUANTITY: '(an|a|the|\\d+(?:\\.\\d+)?)'
}

module.exports = function parseHumanDate (input, options = {}) {
  const { now = Date.now() } = options
  let date, match, periods
  let text = wordsToNumbers(input)

  if (typeof text !== 'string') return null

  // words to numbers changes the word 'second' to 2, which isn't what you want
  // when refering to 'one second'
  text = text.replace(/(?<=(a|1|last|next|this)\s+)2/i, 'second')

  // times 'at 2'
  match = text.match(new RegExp([
    '(?:at)', '([0-2]?\\d)', ':?', '(\\d\\d)?', '([ap]m)?'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    let [, hour, minute, meridiem] = match
    hour = Number(hour)
    minute = minute ? Number(minute) : 0
    if (meridiem === 'pm') {
      if (hour < 12) hour += 12
    }
    setTime(date, hour, minute)
  }

  // times '14:00'
  match = text.match(new RegExp([
    '([0-2]?\\d)', ':', '(\\d\\d)', '([ap]m)?'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    let [, hour, minute, meridiem] = match
    hour = Number(hour)
    minute = Number(minute)
    if (meridiem === 'pm') {
      if (hour < 12) hour += 12
    }
    setTime(date, hour, minute)
  }

  // times 'noon'
  match = text.match(new RegExp([
    '(?:at)?',
    '(noon|midday|midnight)'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    const [, text] = match
    if (text === 'midday' || text === 'noon') setTime(date, 12, 0)
    if (text === 'midnight') setTime(date, 0, 0)
  }

  // n period
  periods = parsePeriods(text)
  if (periods) {
    match = text.match(new RegExp([
      PATTERNS.QUANTITY, PATTERNS.PERIOD, '(before|after)', '(.*)'
    ].join('\\s*') + '$', 'i')) || text.match(new RegExp([
      PATTERNS.QUANTITY, PATTERNS.PERIOD, '(ago|time)?'
    ].join('\\s*'), 'i'))
    let [, , , suffix, reference] = match
    if (['before', 'after'].includes(suffix)) {
      const index = text.indexOf(suffix)
      periods = parsePeriods(text.substr(0, index))
      if (/^(last|next)$/.test(reference)) reference = `${reference} ${periods[0].period}`
      const ref = parseHumanDate(reference, {
        ...options,
        now: date ? date.getTime() : options.now
      })
      if (ref) {
        date = ref
        for (const p of periods) {
          const { n, period } = p
          if (suffix === 'before') {
            addPeriod(date, period, -n)
          } else {
            addPeriod(date, period, n)
          }
        }
        return date
      }
    } else if (suffix === 'ago') {
      date = date || new Date(now)
      for (const p of periods) {
        const { n, period } = p
        addPeriod(date, period, -n)
      }
    } else {
      date = date || new Date(now)
      for (const p of periods) {
        const { n, period } = p
        addPeriod(date, period, n)
      }
    }
  }

  // day 'tomorrow'
  match = text.match(new RegExp('^' + [
    '(today|now|yesterday|tomorrow)'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    const [, text] = match
    if (text === 'yesterday') date.setTime(date.getTime() - ms('1d'))
    if (text === 'tomorrow') date.setTime(date.getTime() + ms('1d'))
  }

  // absolute date
  match = text.match(new RegExp([
    '(?:on)?', '(the|at)?', '([0-3]?\\d)(?:st|nd|rd|th)?', '(?:of)?', PATTERNS.MONTHS + '?', '(\\d+)?'
  ].join('\\s*'), 'i'))
  if (match) {
    let [, prefix, day, month, year] = match
    day = parseNumber(day)
    const isDate = day &&
      prefix !== 'at' &&
      (prefix === 'the' || month)
    if (isDate) {
      date = date || new Date(now)
      date.setDate(day)
      if (month) setMonth(date, 'this', month)
      if (year) date.setYear(Number(year))
    }
  }

  // last period / next period
  match = text.match(new RegExp([
    '(last|next)', PATTERNS.PERIOD
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    const [, direction, period] = match
    if (direction === 'last') {
      addPeriod(date, period, -1)
    } else {
      addPeriod(date, period, 1)
    }
  }

  // tuesday
  // last tuesday / next tuesday
  // tuesday last week / tuesday next week
  // next / last week on tuesday
  match = text.match(new RegExp('^' + [
    '(last|next|this)?', '(week)?', '(?:on)?', PATTERNS.WEEKDAYS, '(last|next|this)?', '(week)?'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    let [, type, period, day, type2, period2] = match
    type = type || type2 || 'this'
    period = period || period2
    if (period === 'week') {
      type = 'this'
    }
    setWeekday(date, type, day)
  }

  // march
  // last march / next march
  // march last year / march next year
  // last year on march / next year on march
  match = text.match(new RegExp('^' + [
    '(last|next|this)?', '(year)?', '(?:in)?', PATTERNS.MONTHS, '(last|next|this)?', '(year)?'
  ].join('\\s*'), 'i'))
  if (match) {
    date = date || new Date(now)
    let [, type, period, month, type2, period2] = match
    type = type || type2 || 'this'
    period = period || period2
    if (period === 'year') {
      type = 'this'
    }
    setMonth(date, type, month)
  }

  return date || null
}

function parsePeriods (text) {
  const periods = text.match(new RegExp([PATTERNS.QUANTITY, PATTERNS.PERIOD].join('\\s+'), 'gi'))
  return periods
    ? periods.map(p => {
      let [n, period] = p.split(/\s+/)
      n = parseNumber(n, { a: 1, an: 1, the: 1 })
      return { n, period }
    })
    : null
}

function createShorthandIndex (arr) {
  return arr.reduce((memo, val, index) => {
    memo[val.substr(0, 3)] = index
    return memo
  }, {})
}

function toPattern (arr) {
  return '(' + arr.map(val => val.substr(0, 3) + '(?:' + val.substr(3) + ')?').join('|') + ')'
}

function addPeriod (date, period, n) {
  if (period.includes('month')) {
    date.setMonth(date.getMonth() + n)
    return date
  }
  if (period.includes('year')) {
    date.setYear(date.getFullYear() + n)
    return date
  }
  date.setTime(date.getTime() + ms(n + period.substr(0, 1)))
  return date
}

function setMonth (date, type, month) {
  const targetMonthIndex = MONTH_INDEX[month.substr(0, 3)]
  const currentMonthIndex = date.getMonth()
  const diff = targetMonthIndex - currentMonthIndex
  date.setMonth(date.getMonth() + diff)
  if (type === 'next' && diff <= 0) {
    addPeriod(date, 'year', 1)
  } else if (type === 'last' && diff >= 0) {
    addPeriod(date, 'year', -1)
  }
  return date
}

function setWeekday (date, type, weekday) {
  const targetWeekdayIndex = WEEKDAY_INDEX[weekday.substr(0, 3)]
  const currentWeekdayIndex = date.getDay()
  const diff = targetWeekdayIndex - currentWeekdayIndex
  date.setDate(date.getDate() + diff)
  if (type === 'next' && diff <= 0) {
    addPeriod(date, 'week', 1)
  } else if (type === 'last' && diff >= 0) {
    addPeriod(date, 'week', -1)
  }
  return date
}

function parseNumber (n, substitutes = {}) {
  for (const sub of Object.keys(substitutes)) {
    if (n === sub) return substitutes[sub]
  }
  return Number(n)
}

function setTime (date, hours, minutes) {
  date.setMilliseconds(0)
  date.setSeconds(0)
  date.setMinutes(minutes ? Number(minutes) : 0)
  date.setHours(hours ? Number(hours) : 0)
}
