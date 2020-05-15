const test = require('ava')
const parseDate = require('./')
const ms = require('ms')
const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
const date = new Date(2020, 4, 4) // Monday
const now = date.getTime()

const cases = {
  'on the 3rd of march 2014': d => {
    d.setDate(3)
    d.setMonth(2)
    d.setYear(2014)
    return d
  },
  'on the first of june 2001': d => {
    d.setDate(1)
    d.setMonth(5)
    d.setYear(2001)
    return d
  },
  'on the 5th of may': d => {
    d.setDate(5)
    d.setMonth(4)
    return d
  },
  '11th dec': d => {
    d.setDate(11)
    d.setMonth(11)
    return d
  },
  'the 11th': d => {
    d.setDate(11)
    return d
  },
  'at 12': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  'at 12pm': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  'at 2:30pm': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 14, 30),
  'at 3pm': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 15),
  'at 3am': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3),
  '14:00': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 14),
  '14:00pm': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 14),
  '14:21': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 14, 21),
  'at noon': d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  'at midnight': d => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
  midday: d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  'on the 12th of march at midday': d => new Date(d.getFullYear(), 2, 12, 12),
  'midday on the 12th of march': d => new Date(d.getFullYear(), 2, 12, 12),
  'tomorrow at 2pm': d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 14),
  'the day after tomorrow at twelve': d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2, 12),
  '1 Second ago': d => new Date(d.getTime() - ms('1s')),
  'in two hours and thirty minutes': d => new Date(d.getTime() + ms('2.5h')),
  'one hour and one day before yesterday': d => new Date(d.getTime() - ms('2d') - ms('1h')),
  'three hours ago': d => new Date(d.getTime() - ms('3h')),
  'an hour ago': d => new Date(d.getTime() - ms('1h')),
  '4 days ago': d => new Date(d.getTime() - ms('4d')),
  'forty four days ago': d => new Date(d.getTime() - ms('44d')),
  '1 year ago': d => {
    d.setYear(d.getFullYear() - 1)
    return d
  },
  'six months ago': d => {
    d.setMonth(d.getMonth() - 6)
    return d
  },
  '1 day ago': d => new Date(d.getTime() - ms('1d')),
  '2 days ago': d => new Date(d.getTime() - ms('2d')),
  '9 weeks ago': d => new Date(d.getTime() - ms('9w')),
  'in 1 seconds time': d => new Date(d.getTime() + ms('1s')),
  'last second': d => new Date(d.getTime() - ms('1s')),
  'in an Hour': d => new Date(d.getTime() + ms('1h')),
  'in a minute': d => new Date(d.getTime() + ms('1m')),
  'in 2 days': d => new Date(d.getTime() + ms('2d')),
  'in five hundred and sixty six days': d => new Date(d.getTime() + ms('566d')),
  'in a day': d => new Date(d.getTime() + ms('1d')),
  'in eight weeks': d => new Date(d.getTime() + ms('8w')),
  'in three years time': d => {
    d.setYear(d.getFullYear() + 3)
    return d
  },
  'in 7 months': d => {
    d.setMonth(d.getMonth() + 7)
    return d
  },
  'last week': d => new Date(d.getTime() - ms('1w')),
  'next week': d => new Date(d.getTime() + ms('1w')),
  'last year': d => {
    d.setYear(d.getFullYear() - 1)
    return d
  },
  'next year': d => {
    d.setYear(d.getFullYear() + 1)
    return d
  },
  'last month': d => {
    d.setMonth(d.getMonth() - 1)
    return d
  },
  'next month': d => {
    d.setMonth(d.getMonth() + 1)
    return d
  },
  'the day before yesterday': d => new Date(d.getTime() - ms('2d')),
  'the day after tomorrow': d => new Date(d.getTime() + ms('2d')),
  'the week before last': d => new Date(d.getTime() - ms('2w')),
  '2 days before yesterday': d => new Date(d.getTime() - ms('3d')),
  '1 day before today': d => new Date(d.getTime() - ms('1d')),
  'the day before last week': d => new Date(d.getTime() - ms('8d')),
  'a day before the day before yesterday': d => new Date(d.getTime() - ms('3d')),
  'the day before the day before yesterday at noon': d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3, 12),
  'the month before last': d => {
    d.setMonth(d.getMonth() - 2)
    return d
  },
  'the year after next': d => {
    d.setYear(d.getFullYear() + 2)
    return d
  },
  'this year in march': d => {
    d.setMonth(2)
    return d
  },
  'next year in march': d => {
    d.setYear(d.getFullYear() + 1)
    d.setMonth(2)
    return d
  },
  'last year in march': d => {
    d.setYear(d.getFullYear() - 1)
    d.setMonth(2)
    return d
  },
  'march this year': d => {
    d.setMonth(2)
    return d
  },
  'march next year': d => {
    d.setYear(d.getFullYear() + 1)
    d.setMonth(2)
    return d
  },
  'march last year': d => {
    d.setYear(d.getFullYear() - 1)
    d.setMonth(2)
    return d
  },
  'this week on tuesday': d => new Date(d.getTime() + ms('1d')),
  'next week on tuesday': d => new Date(d.getTime() + ms('1w') + ms('1d')),
  'next week on friday': d => new Date(d.getTime() + ms('1w') + ms('4d')),
  'last week on tuesday': d => new Date(d.getTime() - ms('1w') + ms('1d')),
  'last week on friday': d => new Date(d.getTime() - ms('1w') + ms('4d')),
  'tuesday this week': d => new Date(d.getTime() + ms('1d')),
  'tuesday next week': d => new Date(d.getTime() + ms('1w') + ms('1d')),
  'friday next week': d => new Date(d.getTime() + ms('1w') + ms('4d')),
  'tuesday last week': d => new Date(d.getTime() - ms('1w') + ms('1d')),
  'friday last week': d => new Date(d.getTime() - ms('1w') + ms('4d'))
}

for (const text of Object.keys(cases)) {
  test(text, async t => {
    t.is(String(parseDate(text, { now })), String(cases[text](new Date(now))), text)
  })
}

for (const fromWeekday of Object.keys(DAYS)) {
  for (const toWeekday of Object.keys(DAYS)) {
    const date = new Date(now)
    do {
      date.setDate(date.getDate() + 1)
    } while (date.getDay() !== DAYS[fromWeekday])

    test(`from ${date.toDateString()} to last ${toWeekday}`, async t => {
      const text = `last ${toWeekday}`
      const expected = new Date(date.getTime())
      do {
        expected.setDate(expected.getDate() - 1)
      } while (expected.getDay() !== DAYS[toWeekday])
      t.deepEqual(
        parseDate(text, { now: date }).toDateString(),
        expected.toDateString()
      )
    })

    test(`from ${date.toDateString()} to next ${toWeekday}`, async t => {
      const text = `next ${toWeekday}`
      const expected = new Date(date.getTime())
      do {
        expected.setDate(expected.getDate() + 1)
      } while (expected.getDay() !== DAYS[toWeekday])
      t.deepEqual(
        parseDate(text, { now: date }).toDateString(),
        expected.toDateString()
      )
    })

    test(`from ${date.toDateString()} to this ${toWeekday}`, async t => {
      const text = `${toWeekday}`
      const expected = new Date(date.getTime())
      expected.setDate(expected.getDate() + DAYS[toWeekday] - DAYS[fromWeekday])
      t.deepEqual(
        parseDate(text, { now: date }).toDateString(),
        expected.toDateString()
      )
    })
  }
}

for (const fromMonth of Object.keys(MONTHS)) {
  for (const toMonth of Object.keys(MONTHS)) {
    const date = new Date(now)
    do {
      date.setMonth(date.getMonth() + 1)
    } while (date.getMonth() !== MONTHS[fromMonth])

    test(`from ${date.toDateString()} to last ${toMonth}`, async t => {
      const text = `last ${toMonth}`
      const expected = new Date(date.getTime())
      do {
        expected.setMonth(expected.getMonth() - 1)
      } while (expected.getMonth() !== MONTHS[toMonth])
      t.deepEqual(
        String(parseDate(text, { now: date })),
        String(expected)
      )
    })

    test(`from ${date.toDateString()} to next ${toMonth}`, async t => {
      const text = `next ${toMonth}`
      const expected = new Date(date.getTime())
      do {
        expected.setMonth(expected.getMonth() + 1)
      } while (expected.getMonth() !== MONTHS[toMonth])
      t.deepEqual(
        String(parseDate(text, { now: date.getTime() })),
        String(expected)
      )
    })

    test(`from ${date.toDateString()} to this ${toMonth}`, async t => {
      const text = `${toMonth}`
      const expected = new Date(date.getTime())
      expected.setMonth(MONTHS[toMonth])
      t.deepEqual(
        String(parseDate(text, { now: date.getTime() })),
        String(expected)
      )
    })
  }
}

test('default now', async t => {
  t.deepEqual(
    parseDate('today').toDateString(),
    new Date().toDateString()
  )
})

test('no match', async t => {
  const now = Date.now()
  t.is(parseDate('the day before blah', { now }), null)
  t.is(parseDate('one', { now }), null)
})
