const test = require('ava')
const parseHumanDate = require('./')
const ms = require('ms')
const DAYS = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
}
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

test('absolute dates', async t => {
  const now = new Date(2016, 1, 10, 10)
  let cases = {
    'on the 3rd of march 2014': (() => {
      const d = new Date(now)
      d.setDate(3)
      d.setMonth(2)
      d.setYear(2014)
      return d
    })(),
    'on the 5th of may': (() => {
      const d = new Date(now)
      d.setDate(5)
      d.setMonth(4)
      return d
    })(),
    '11th dec': (() => {
      const d = new Date(now)
      d.setDate(11)
      d.setMonth(11)
      return d
    })(),
    '11th': (() => {
      const d = new Date(now)
      d.setDate(11)
      d.setYear(d.getFullYear())
      return d
    })(),
    '9th': (() => {
      const d = new Date(now)
      d.setDate(9)
      d.setMonth(d.getMonth() + 1)
      return d
    })()
  }
  for (const text of Object.keys(cases)) {
    t.is(parseHumanDate(text, { now, assumeFuture: true }).toDateString(), cases[text].toDateString(), text)
  }

  cases = {
    '11th dec': (() => {
      const d = new Date(now)
      d.setDate(11)
      d.setMonth(11)
      d.setFullYear(2015)
      return d
    })(),
    '11th': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 1)
      d.setDate(11)
      return d
    })(),
    '9th': (() => {
      const d = new Date(now)
      d.setDate(9)
      return d
    })()
  }
  for (const text of Object.keys(cases)) {
    t.is(parseHumanDate(text, { now, assumeFuture: false }).toDateString(), cases[text].toDateString(), text)
  }
})

test('n period ago', async t => {
  const now = Date.now()
  const cases = {
    '1 second ago': now - ms('1s'),
    'three hours ago': now - ms('3h'),
    'an hour ago': now - ms('1h'),
    '4 days ago': now - ms('4d'),
    'forty four days ago': now - ms('44d'),
    '1 year ago': (() => {
      const d = new Date(now)
      d.setYear(d.getFullYear() - 1)
      return d.getTime()
    })(),
    'six months ago': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 6)
      return d.getTime()
    })(),
    '1 day ago': now - ms('1d'),
    'two days ago': now - ms('2d'),
    'nine weeks ago': now - ms('9w')
  }
  for (const text of Object.keys(cases)) {
    t.is(Number(parseHumanDate(text, { now })), cases[text], text)
  }
})

test('in n period time', async t => {
  const now = Date.now()
  const cases = {
    'in 1 seconds time': now + ms('1s'),
    'in an hour': now + ms('1h'),
    'in a minute': now + ms('1m'),
    'in two days': now + ms('2d'),
    'in five hundred and sixty six days': now + ms('566d'),
    'in three years time': (() => {
      const d = new Date(now)
      d.setYear(d.getFullYear() + 3)
      return d.getTime()
    })(),
    'in seven months': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() + 7)
      return d.getTime()
    })(),
    'in a day': now + ms('1d'),
    'in eight weeks': now + ms('8w')
  }
  for (const text of Object.keys(cases)) {
    t.is(Number(parseHumanDate(text, { now })), cases[text], text)
  }
})

test('last period | next period', async t => {
  const now = Date.now()
  const cases = {
    'last week': now - ms('1w'),
    'next week': now + ms('1w'),
    'last year': (() => {
      const d = new Date(now)
      d.setYear(d.getFullYear() - 1)
      return d.getTime()
    })(),
    'next year': (() => {
      const d = new Date(now)
      d.setYear(d.getFullYear() + 1)
      return d.getTime()
    })(),
    'last month': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 1)
      return d.getTime()
    })(),
    'next month': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() + 1)
      return d.getTime()
    })()
  }
  for (const text of Object.keys(cases)) {
    t.is(Number(parseHumanDate(text, { now })), cases[text], text)
  }
})

test('last weekday', async t => {
  for (const fromWeekday of Object.keys(DAYS)) {
    for (const toWeekday of Object.keys(DAYS)) {
      const text = `last ${toWeekday}`
      const now = new Date()
      while (now.getDay() !== DAYS[fromWeekday]) now.setDate(now.getDate() + 1)

      let diff = DAYS[fromWeekday] - DAYS[toWeekday]
      if (diff <= 0) diff += 7

      const expected = new Date(Number(now) - ms(diff + 'd'))
      t.deepEqual(
        parseHumanDate(text, { now }).toDateString(),
        expected.toDateString(),
        `from ${now} to ${text}`
      )
    }
  }
})

test('next weekday', async t => {
  for (const fromWeekday of Object.keys(DAYS)) {
    for (const toWeekday of Object.keys(DAYS)) {
      const text = `next ${toWeekday}`
      const now = new Date()
      while (now.getDay() !== DAYS[fromWeekday]) now.setDate(now.getDate() + 1)

      let diff = DAYS[toWeekday] - DAYS[fromWeekday]
      if (diff <= 0) diff += 7
      const expected = new Date(Number(now) + ms(diff + 'd'))
      t.deepEqual(
        parseHumanDate(text, { now }).toDateString(),
        expected.toDateString(),
        `from ${now.toDateString()} to ${text}`
      )
    }
  }
})

test('next | last week on weekday', async t => {
  const date = new Date(2020, 4, 4) // Monday
  const now = date.getTime()
  const cases = {
    'next week on tuesday': new Date(now + ms('1w') + ms('1d')),
    'next week on friday': new Date(now + ms('1w') + ms('4d')),
    'last week on tuesday': new Date(now - ms('1w') + ms('1d')),
    'last week on friday': new Date(now - ms('1w') + ms('4d'))
  }
  for (const text of Object.keys(cases)) {
    t.is(parseHumanDate(text, { now }).toDateString(), cases[text].toDateString(), text)
  }
})

test('weekday next | last week', async t => {
  const date = new Date(2020, 4, 4) // Monday
  const now = date.getTime()
  const cases = {
    'tuesday next week': new Date(now + ms('1w') + ms('1d')),
    'friday next week': new Date(now + ms('1w') + ms('4d')),
    'tuesday last week': new Date(now - ms('1w') + ms('1d')),
    'friday last week': new Date(now - ms('1w') + ms('4d'))
  }
  for (const text of Object.keys(cases)) {
    t.is(parseHumanDate(text, { now }).toDateString(), cases[text].toDateString(), text)
  }
})

test('last month', async t => {
  for (const fromMonth of Object.keys(MONTHS)) {
    for (const toMonth of Object.keys(MONTHS)) {
      const text = `last ${toMonth}`
      const now = new Date()
      while (now.getMonth() !== MONTHS[fromMonth]) now.setMonth(now.getMonth() + 1)

      let diff = MONTHS[fromMonth] - MONTHS[toMonth]
      if (diff <= 0) diff += 12

      const expected = new Date(now)
      while (diff--) expected.setMonth(expected.getMonth() - 1)
      t.deepEqual(
        parseHumanDate(text, { now }).toDateString(),
        expected.toDateString(),
        `from ${now} to ${text}`
      )
    }
  }
})

test('next month', async t => {
  for (const fromMonth of Object.keys(MONTHS)) {
    for (const toMonth of Object.keys(MONTHS)) {
      const text = `next ${toMonth}`
      const now = new Date()
      while (now.getMonth() !== MONTHS[fromMonth]) now.setMonth(now.getMonth() + 1)

      let diff = MONTHS[toMonth] - MONTHS[fromMonth]
      if (diff <= 0) diff += 12
      const expected = new Date(now)
      while (diff--) expected.setMonth(expected.getMonth() + 1)
      t.deepEqual(
        parseHumanDate(text, { now }).toDateString(),
        expected.toDateString(),
        `from ${now.toDateString()} to ${text}`
      )
    }
  }
})

test('n period before / after date', async t => {
  const now = Date.now()
  const cases = {
    'the day before yesterday': new Date(now - ms('2d')),
    'the day after tomorrow': new Date(now + ms('2d')),
    'the week before last': new Date(now - ms('2w')),
    'the month before last': (() => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 2)
      return d
    })(),
    '2 days before yesterday': new Date(now - ms('3d')),
    'one day before today': new Date(now - ms('1d')),
    'the day before last week': new Date(now - ms('8d')),
    'the year after next': (() => {
      const d = new Date(now)
      d.setYear(d.getFullYear() + 2)
      return d
    })()
  }
  for (const text of Object.keys(cases)) {
    t.is(parseHumanDate(text, { now }).toDateString(), cases[text].toDateString(), text)
  }
})

test('assumeFuture', async t => {
  const now = Date.now()
  t.deepEqual(
    parseHumanDate('tuesday', { now, assumeFuture: true }),
    parseHumanDate('next tuesday', { now })
  )
  t.deepEqual(
    parseHumanDate('tuesday', { now, assumeFuture: false }),
    parseHumanDate('last tuesday', { now })
  )

  t.deepEqual(
    parseHumanDate('march', { now, assumeFuture: true }),
    parseHumanDate('next march', { now })
  )
  t.deepEqual(
    parseHumanDate('march', { now, assumeFuture: false }),
    parseHumanDate('last march', { now })
  )
})

test('default now', async t => {
  t.deepEqual(
    parseHumanDate('today').toDateString(),
    new Date().toDateString()
  )
})

test('no match', async t => {
  const now = Date.now()
  t.is(parseHumanDate('the day before blah', { now }))
})
