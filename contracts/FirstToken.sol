//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FirstToken is ERC20 {

    constructor(uint amount) ERC20("FirstToken", "FT") {
        _mint(msg.sender, amount);
    }

    function mint(address to, uint amount) external {
        _mint(to, amount);
    }
}