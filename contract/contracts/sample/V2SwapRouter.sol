// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IV2SwapRouter} from "@uniswap/swap-router-contracts/contracts/interfaces/IV2SwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract V2SwapRouter is IV2SwapRouter {

    constructor() {}

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external payable returns (uint256 amountOut) {
        // 원활한 테스트를 위한 샘플 코드입니다.
        // path[0]에 입력된 ERC20 토큰을 msg.sender로부터 전송받습니다.
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        // path[1]에 입력된 ERC20 토큰을 to 주소로 전송합니다.
        IERC20(path[1]).transfer(to, amountIn);
        return amountIn;
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to
    ) external payable returns (uint256 amountIn) {
        // 원활한 테스트를 위한 샘플 코드입니다.
        // path[1]에 입력된 ERC20 토큰을 msg.sender로부터 전송받습니다.
        IERC20(path[1]).transferFrom(msg.sender, address(this), amountOut);
        // path[0]에 입력된 ERC20 토큰을 to 주소로 전송합니다.
        IERC20(path[0]).transfer(to, amountOut);
        return amountOut;
    }
}