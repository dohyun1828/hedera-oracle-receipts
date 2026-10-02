const assert = require('node:assert/strict');
const { ethers } = require('hardhat');
describe('RoundGuard', function () {
  let guard, feed;
  beforeEach(async function () {
    guard = await (await ethers.getContractFactory('RoundGuard')).deploy();
    feed = await (await ethers.getContractFactory('MockAggregator')).deploy();
  });
  const cases = [
    ['accepts a complete fresh round', [8, 123, 90, 95, 8], 100, 5, true],
    ['rejects stale data', [8, 123, 90, 94, 8], 100, 5, false],
    ['rejects a future update without underflow', [8, 123, 90, 101, 8], 100, 5, false],
    ['rejects zero price', [8, 0, 90, 95, 8], 100, 5, false],
    ['rejects negative price', [8, -1, 90, 95, 8], 100, 5, false],
    ['rejects incomplete round', [8, 123, 90, 95, 7], 100, 5, false],
    ['rejects reversed timestamps', [8, 123, 96, 95, 8], 100, 5, false],
    ['rejects missing start', [8, 123, 0, 95, 8], 100, 5, false]
  ];
  for (const [name, values, observedAt, maxAge, expected] of cases) {
    it(name, async function () {
      await feed.set(...values);
      assert.equal(await guard.eligible(await feed.getAddress(), observedAt, maxAge), expected);
    });
  }
});
