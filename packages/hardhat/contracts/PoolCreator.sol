// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV3Factory {
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);
}

contract PoolCreator {
    address public factory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;

    event PoolCreated(address indexed tokenA, address indexed tokenB, uint24 fee, address pool);

    constructor() {
    }

    function setFactory(address _factory) public {
        factory = _factory;
    }

    function deployPool(address tokenA, address tokenB, uint24 fee) external returns (address pool) {
        require(tokenA != tokenB, "UniswapV3: IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "UniswapV3: ZERO_ADDRESS");

        // Ensure tokenA is less than tokenB to maintain Uniswap ordering
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        pool = IUniswapV3Factory(factory).createPool(token0, token1, fee);
        emit PoolCreated(token0, token1, fee, pool);
    }
}
