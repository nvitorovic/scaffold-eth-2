// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply);
        transferOwnership(owner);
    }
}

contract ERC20TokenFactory {
    event TokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 initialSupply);

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        ERC20Token newToken = new ERC20Token(name, symbol, initialSupply, msg.sender);
        emit TokenCreated(address(newToken), msg.sender, name, symbol, initialSupply);
        return address(newToken);
    }
}
