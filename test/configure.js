/* eslint-env node */

import chai from 'chai'
import chaiImmutable from 'chai-immutable'
chai.use(chaiImmutable)

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
