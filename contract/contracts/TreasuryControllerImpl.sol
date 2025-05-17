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

    function initialize(address _initialOwner) external initializer {
        __Ownable_init(_initialOwner);
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function submitRevenue(address _token, uint256 _amount, address _rewardRecipient) external override virtual onlyAuthorized returns (bool success) {
        TreasuryControllerStorage.Data storage data_ = _treasuryControllerStorage();

        if (data_.v2SwapRouter == address(0)) revert NotInitializing();
        if (data_.delyToken == address(0)) revert NotInitializing();
        if (data_.sDelyToken == address(0)) revert NotInitializing();

        return super.submitRevenue(_token, _amount, _rewardRecipient);
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

    function getV2SwapRouter() external view returns (address) {
        return _treasuryControllerStorage().v2SwapRouter;
    }

    function getDelyToken() external view returns (address) {
        return _treasuryControllerStorage().delyToken;
    }

    function getSDelyToken() external view returns (address) {
        return _treasuryControllerStorage().sDelyToken;
    }

    function getTrustedDomain(address _domain) external view returns (bool) {
        return _treasuryControllerStorage().trustedDomains[_domain];
    }

    function getDomainReward(address _domain) external view returns (uint256) {
        return _treasuryControllerStorage().domainRewards[_domain];
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function supportsInterface(bytes4 interfaceId) public view override virtual returns (bool) {
        return interfaceId == type(ITreasuryController).interfaceId || super.supportsInterface(interfaceId);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev 도메인 수익금 정산 후 실행되는 함수
     * @param _token 수익금 정산 토큰 주소
     * @param _amount 수익금 정산 토큰 수량
     * @param _rewardRecipient 보상 수령자 (0일 시 보상 수령 없음)
     */
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

        if (domainReward > 0 && _rewardRecipient != address(0)) {
            (bool successMint, ) = delyToken.call(
                abi.encodeWithSignature("mint(address,uint256)", _rewardRecipient, domainReward)
            );
            if (!successMint) revert ExternalCallFailed();
            emit GrantReward(_rewardRecipient, domainReward);
        }
    }

    function _isAuthorized(address _target) internal view override virtual returns (bool isAuthorized) {
        TreasuryControllerStorage.Data storage data_ = _treasuryControllerStorage();
        isAuthorized = data_.trustedDomains[_target];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _treasuryControllerStorage() internal pure returns (TreasuryControllerStorage.Data storage data_) {
        data_ = TreasuryControllerStorage.data();
    }  
}
