// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (,int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getVersion(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        return priceFeed.version();
    }

    function getConversionRate(uint256 _ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        uint256 ethPriceInUsd = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPriceInUsd * _ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}