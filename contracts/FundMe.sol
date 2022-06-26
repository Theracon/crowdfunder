// SPDX-License-Identifier: MIT

// Solidity version
pragma solidity ^0.8.8;

// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error Codes
error FundMe__NotOwner();

/** @title A contract for crowdfunding
 *  @author Ashraf Yusuf
 *  @notice This contract is to demo a sample funding contract
 *  @dev This contract implements price feeds as our library
*/
contract FundMe {
  // Type Declarations
  using PriceConverter for uint256;

  // State Variables
  uint256 public constant MINIMUM_AMOUNT_IN_USD = .5 * 1e18;
  address private immutable i_owner;
  address[] private s_funders;
  mapping(address => uint256) private s_addressToAmountMapping;
  AggregatorV3Interface private s_priceFeed;

  // Modifiers
  modifier onlyOwner() {
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  // Constructor
  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // Receive Function
  receive() external payable {
    fund();
  }

  // Fallback Function
  fallback() external payable {
    fund();
  }

  /**  @notice This function funds the contract
    *  @dev This function implements price feeds as our library
  */
  function fund() public payable {
    require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_AMOUNT_IN_USD, "Amount sent is too little.");
    s_funders.push(msg.sender);
    s_addressToAmountMapping[msg.sender] = msg.value;
  }

  /**  @notice This function withdraws funds from the contract
    *  @dev This function uses a modifier to ensure only the owner of the contract can withdraw funds
  */
  function withdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 index=0; index<funders.length; index++){
      address funder= funders[index];
      s_addressToAmountMapping[funder] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
    require(callSuccess, "Withdrawal failed");
  }

  /**  @notice This function returns the owner of the contract
  */
  function getOwner() public view returns(address) {
    return i_owner;
  }

  /**  @notice This function returns the list of contract funders
  */
  function getFunder(uint256 index) public view returns(address) {
    return s_funders[index];
  }

  /**  @notice This function returns the amount donated by a funder
  */
  function getAmountByAccount(address funder) public view returns(uint256) {
    return s_addressToAmountMapping[funder];
  }

  /**  @notice This function returns the aggregator priceFeed
  */
  function getPriceFeed() public view returns(AggregatorV3Interface) {
    return s_priceFeed;
  }
}
