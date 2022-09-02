// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract FirstTaxToken is ERC20{

    constructor() ERC20("FirstTaxToken","FTT"){
     _mint(msg.sender,200000e18);
    }

   function _transfer(address sender, address receiver,uint256 amount) internal virtual override {
     super._transfer(sender,address(this),(amount*10)/100);
     super._transfer(sender,receiver,amount - ((amount*500)/1000));
   }
   
}