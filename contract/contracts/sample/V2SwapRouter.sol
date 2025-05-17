// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IV2SwapRouter} from "@uniswap/swap-router-contracts/contracts/interfaces/IV2SwapRouter.sol";

contract V2SwapRouter is IV2SwapRouter {

    constructor() {}

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external payable returns (uint256 amountOut) {
        // 원활한 테스트를 위한 샘플 코드입니다.
        return amountIn;
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to
    ) external payable returns (uint256 amountIn) {
        // 원활한 테스트를 위한 샘플 코드입니다.
        return amountOut;
    }
}