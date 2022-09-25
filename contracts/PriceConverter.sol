// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


library PriceConverter {

      function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        // ABI
        // address =>   0x8A753747A1Fa494EC906cE90E9f37563A8AF630e (rinkeby)


    (,int256 answer,,,
      // latestRounddata() returns many thing but we only need answer/price so we are deleting those value and leaving commas instead
      )=priceFeed.latestRoundData();

    //   answer is price of eth interms of USD
    // 3000.00000000

    // below code matches the decimal points and type cast int256 to uint256
    // because we are getting msg.value as uint256 and answer as int256

    
    return uint256(answer * 1e10); // 1**10 = 10000000000 
    // lets solve the maths 
    // suppose 1 eth == 3000 usd 
    // we will get 300000000000 as answer
    // the to match the decimal point with eth we do answer * 1e10 i.e 10000000000 
    // final return value will be 3000000000000000000000
    }


    function getConversionRate(uint256 ethAmount,AggregatorV3Interface priceFeed) internal view returns(uint256){
     
     uint256 ethPrice = getPrice(priceFeed);
    // lets solve the maths
    //  ethPrice = 3000_000000000000000000
    // 1 eth is send so ethAmount = 1_000000000000000000 wei
     uint256 ethAmountInUsd = (ethPrice * ethAmount)/1e18;
     return ethAmountInUsd;
    }
}