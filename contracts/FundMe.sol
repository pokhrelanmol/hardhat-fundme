// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// error codes
error FundMe__NotOwner();

// interface,library,contracts

/**@title FundMe contract is for crowd funding
 * @author Anmol pokhrel
 * @notice this contract is to demo the crowd funding contract
 * @dev this implement price feed as our library 

 */
contract FundMe {
    // contract deployement cost
    // gas cost with contant and immutable = 751682
    // gas cost without = 793959

    // Type declaration
    // we are using uint256 as first parameter
    using PriceConverter for uint256;

    //state variables
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    // gas with constant = 21415(cheaper)
    // without constan=  23515
    address[] private s_funders; //s_ denotes storage varibale
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        //
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
        //  underscore below the require runs the require statement first and then code
        //  underscore above will do vise-versa
    }

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    //  what happens of someone send eth to this contract without calling fund function?
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // functions
    function fund() public payable {
        // want to able to set minimum fund amount in usd
        // 1. how to send eth to this contract
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        ); //1e18 == 1 * 10 ** 18 == 100000000000000000 wei == 1 eth
        // msg.value will be the first parameter of getConversionRate.
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
        // what is revert?
        // undo any action before and send remaining gas back
    }

    /** @notice this functions withdraws the eth from the contract
     */
    function withdraw() public onlyOwner {
        /** @dev reset values after withdraw */

        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        /** @dev this is the way to reset the array
         */
        s_funders = new address[](0);

        // second return type of call is bytes data we dont need it here so ignoring
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "eth trasfer failed");
    }

    function cheaperWithdraw() public onlyOwner {
        // in above function we were reading from storage which is expensive but here we are reading from memory which is cheaper
        address[] memory funders = s_funders;
        uint256 funderCount = funders.length;

        for (
            uint256 funderIndex = 0;
            funderIndex < funderCount;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "eth trasfer failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }
}
