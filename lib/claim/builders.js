const wdk = require('wikidata-sdk')
const moment = require('moment')
// The difference in builders are due to the different expectations of Wikidata API

const singleClaimBuilders = {
  string: (str) => `"${str}"`,
  claim: (Q) => {
    const id = wdk.getNumericId(Q)
    return `{"entity-type":"item","numeric-id":${id}}`
  },
  time: (year) => JSON.stringify(getYearTimeObject(year)),
  // Property type specific builders
  monolingualtext: (valueArray) => {
    const [text, language] = valueArray
    return JSON.stringify({
      text,
      language
    })
  },
  quantity: (quantity, unit = '1') => {
    if (quantity instanceof Array) {
      [quantity, unit] = quantity
      if (wdk.isItemId(unit)) unit = `http://www.wikidata.org/entity/${unit}`
    }
    return JSON.stringify({
      amount: buildAmount(quantity),
      unit
    })
  }
}

const entityEditBuilders = {
  string: (pid, string) => statementBase(pid, 'string', string),
  claim: (pid, qid) => {
    const id = wdk.getNumericId(qid)
    return statementBase(pid, 'wikibase-entityid', {
      'entity-type': 'item',
      'numeric-id': parseInt(id)
    })
  },
  monolingualtext: (pid, valueObj) => {
    return statementBase(pid, 'monolingualtext', valueObj)
  },
  time: (pid, year) => statementBase(pid, 'time', getYearTimeObject(year)),
  quantity: (pid, num) => {
    return statementBase(pid, 'quantity', {
      unit: '1',
      amount: String(num)
    })
  }
}

const buildAmount = (num) => {
  if (num === 0) return '0'
  return num > 0 ? `+${num}` : `-${num}`
}

const getYearTimeObject = (year) => {
  console.log(year)
  return {
    time: moment(year).format("[+]YYYY-MM-DDT00:00:00[Z]"),
    timezone: 0,
    before: 0,
    after: 0,
    precision: 11,
    calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
  }
}

const statementBase = (pid, type, value) => {
  return {
    rank: 'normal',
    type: 'statement',
    mainsnak: {
      datavalue: {
        type: type,
        value: value
      },
      property: pid,
      snaktype: 'value'
    },
    references: [{
      snaks: {
        P854: [{
          snaktype: 'value',
          property: 'P854',
          datavalue: {
            type: 'string',
            value: 'https://scorum.me/football/tourneys/1103-2/j-league'
          }
        }]
      }
    }]
  }
}


module.exports = {
  singleClaimBuilders,
  entityEditBuilders
}