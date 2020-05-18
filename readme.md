[![Travis CI](https://travis-ci.org/alanclarke/parse-human-date.svg?branch=master)](https://travis-ci.org/alanclarke/parse-human-date)
[![dependencies Status](https://david-dm.org/alanclarke/parse-human-date/status.svg)](https://david-dm.org/alanclarke/parse-human-date)
[![Coverage Status](https://coveralls.io/repos/github/alanclarke/parse-human-date/badge.svg?branch=master)](https://coveralls.io/github/alanclarke/parse-human-date?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


# Parse human date

Parse a human style date

100% test coverage


## Installation

`npm install parse-human-date`

## Usage

```js
const parseDate = require('parse-human-date')

parseDate(text, options) // returns a new javascript date

// Examples:
parseDate('today')
parseDate('tomorrow')
parseDate('the day after tomorrow at twelve')
parseDate('last march on the 24th at midday')
parseDate('yesterday')
parseDate('on the 3rd of march 2014')
parseDate('on the 5th of may')
parseDate('on the first of june 2001')
parseDate('11th dec')
parseDate('the 11th')
parseDate('3rd feb')
parseDate('next tuesday')
parseDate('next week on tuesday at 4am')
parseDate('tuesday last week')
parseDate('this tuesday')
parseDate('last tuesday')
parseDate('last week on tuesday at noon')
parseDate('one hour and one day before yesterday')
parseDate('next march')
parseDate('march last year')
parseDate('1 second ago')
parseDate('three hours ago')
parseDate('4 days ago')
parseDate('fourty four days ago')
parseDate('nine weeks ago')
parseDate('in an hour')
parseDate('in two hours and thirty minutes')
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
parseDate('tomorrow at 14:30')
parseDate('the day before the day before yesterday at noon')
```

## Options

- now (defaults to Date.now()): You can pass a reference ts against which any relative dates are computed. Useful to interpret text relative to the date it was communicated - e.g. tomorrow will mean something different tomorrow
