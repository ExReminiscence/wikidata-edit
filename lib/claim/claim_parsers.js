const wdk = require('wikidata-sdk')

module.exports = {
  matchClaim: value => claim => value,
  getGuid: claim => claim.id
}
