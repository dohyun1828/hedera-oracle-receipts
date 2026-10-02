// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
interface Aggregator {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}
/// A reusable read-only gate for Chainlink-compatible round consumers.
contract RoundGuard {
    function eligible(address feed, uint256 observedAt, uint256 maxAge) external view returns (bool) {
        (uint80 round, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = Aggregator(feed).latestRoundData();
        return round > 0 && answer > 0 && answeredInRound >= round
            && startedAt > 0 && startedAt <= updatedAt && updatedAt <= observedAt
            && observedAt - updatedAt <= maxAge;
    }
}
contract MockAggregator {
    uint80 public round;
    int256 public answer;
    uint256 public startedAt;
    uint256 public updatedAt;
    uint80 public answeredInRound;
    function set(uint80 r, int256 a, uint256 s, uint256 u, uint80 ar) external {
        round = r; answer = a; startedAt = s; updatedAt = u; answeredInRound = ar;
    }
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (round, answer, startedAt, updatedAt, answeredInRound);
    }
}
