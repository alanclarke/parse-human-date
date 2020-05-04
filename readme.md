[![Travis CI](https://travis-ci.org/alanclarke/parse-human-date.svg?branch=master)](https://travis-ci.org/alanclarke/parse-human-date)
[![dependencies Status](https://david-dm.org/alanclarke/parse-human-date/status.svg)](https://david-dm.org/alanclarke/parse-human-date)
[![Coverage Status](https://coveralls.io/repos/github/alanclarke/parse-human-date/badge.svg?branch=master)](https://coveralls.io/github/alanclarke/parse-human-date?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


# Parse human date

Parse a human style date

200 LOC, 100% test coverage


## Installation

`npm install parse-human-date`

## Usage

```js
const parseDate = require('parse-human-date')

// parseDate(text, options)

// Examples:
parseDate('today')
parseDate('tomorrow')
parseDate('yesterday')
parseDate('on the 3rd of march 2014')
parseDate('on the 5th of may')
parseDate('11th dec')
parseDate('3rd feb')
parseDate('next tuesday')
parseDate('next week on tuesday')
parseDate('tuesday last week')
parseDate('last tuesday')
parseDate('next march')
parseDate('1 second ago')
parseDate('three hours ago')
parseDate('4 days ago')
parseDate('fourty four days ago')
parseDate('nine weeks ago')
parseDate('in an hour')
parseDate('in two days')
parseDate('in five hundred and sixty six days')
parseDate('in three years time')
parseDate('in seven months')
parseDate('next week')
parseDate('last year')
parseDate('the day before yesterday')
parseDate('the day after tomorrow')
parseDate('the week before last')
parseDate('the month before last')
parseDate('the week after next')
parseDate('2 days before yesterday')
parseDate('the day before last week')
parseDate('the year after next')
```

## Options

- assumeFuture: you can imagine two conversations, 'when did it happen'? vs 'when will it happen?'. Some context is required in order to correctly interpret a response like 'tuesday'. If assumeFuture is true, the library will assume 'next tuesday' is meant, if false, 'last tuesday'.
- now: you can pass a reference ts against which any relative dates are computed. This deafaults to Date.now()
# parse-human-date
