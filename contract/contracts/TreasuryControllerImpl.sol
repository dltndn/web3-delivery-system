// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {RevenueManager} from "./RevenueManager.sol";
import {TreasuryControllerStorage} from "./storage/TreasuryContollerStorage.sol";

import {IV2SwapRouter} from "@uniswap/swap-router-contracts/contracts/interfaces/IV2SwapRouter.sol";
import {ITreasuryController} from "./interface/ITreasuryController.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryControllerImpl is UUPSUpgradeable, OwnableUpgradeable, ITreasuryController, RevenueManager {
    struct Income {
        address token;
        uint256 amount;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner) external initializer {
        __Ownable_init(_initialOwner);
    }

    function supportsInterface(bytes4 interfaceId) public view override virtual returns (bool) {
        return interfaceId == type(ITreasuryController).interfaceId || super.supportsInterface(interfaceId);
    }

    function _afterSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal override virtual {
        TreasuryControllerStorage.Data storage data_ = _treasuryControllerStorage();

        address uniswapRouter = data_.v2SwapRouter;
        address delyToken = data_.delyToken;
        address sDelyToken = data_.sDelyToken;
        uint256 domainReward = data_.domainRewards[msg.sender];

        bool successApproval = IERC20(_token).approve(uniswapRouter, _amount);
        if (!successApproval) revert ExternalCallFailed();

        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = delyToken;
        
        IV2SwapRouter(uniswapRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            sDelyToken
        );

        if (domainReward > 0) {
            (bool successMint, ) = delyToken.call(
                abi.encodeWithSignature("mint(address,uint256)", _rewardRecipient, domainReward)
            );
            if (!successMint) revert ExternalCallFailed();
            emit GrantReward(_rewardRecipient, domainReward);
        }
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _treasuryControllerStorage() internal pure returns (TreasuryControllerStorage.Data storage data_) {
        data_ = TreasuryControllerStorage.data();
    }  
}
