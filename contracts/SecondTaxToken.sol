// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SecondTaxToken is ERC20{

    constructor() ERC20("SecondTaxToken","STT"){
     _mint(msg.sender,100000e18);
    }

   function _transfer(address sender, address receiver,uint256 amount) internal virtual override {

     super._transfer(sender,address(this),(amount*500)/1000);
     super._transfer(sender,receiver,amount - ((amount*500)/1000));
   }
   
}