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

    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner, address _v2SwapRouter, address _delyToken, address _sDelyToken) external initializer {
        __Ownable_init(_initialOwner);
        setV2SwapRouter(_v2SwapRouter);
        setDelyToken(_delyToken);
        setSDelyToken(_sDelyToken);
    }

    function setV2SwapRouter(address _v2SwapRouter) external onlyOwner {
        _treasuryControllerStorage().v2SwapRouter = _v2SwapRouter;
    }

    function setDelyToken(address _delyToken) external onlyOwner {
        _treasuryControllerStorage().delyToken = _delyToken;
    }

    function setSDelyToken(address _sDelyToken) external onlyOwner {
        _treasuryControllerStorage().sDelyToken = _sDelyToken;
    }

    function setTrustedDomain(address _domain, bool _trusted) external onlyOwner {
        _treasuryControllerStorage().trustedDomains[_domain] = _trusted;
    }

    function setDomainReward(address _domain, uint256 _reward) external onlyOwner {
        _treasuryControllerStorage().domainRewards[_domain] = _reward;
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
