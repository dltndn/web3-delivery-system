// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {RevenueManager} from "./RevenueManager.sol";
import {TreasuryControllerStorage} from "./storage/TreasuryContollerStorage.sol";

import {IV2SwapRouter} from "@uniswap/swap-router-contracts/contracts/interfaces/IV2SwapRouter.sol";
import {ITreasuryController} from "./interface/ITreasuryController.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryControllerImpl is UUPSUpgradeable, OwnableUpgradeable, PausableUpgradeable, ITreasuryController, RevenueManager {

    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner) external initializer {
        if (_initialOwner == address(0)) revert InvalidAddress();
        __Ownable_init(_initialOwner);
        __Pausable_init();
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setV2SwapRouter(address _v2SwapRouter) external onlyOwner {
        if (_v2SwapRouter == address(0)) revert InvalidAddress();
        _treasuryControllerStorage().v2SwapRouter = _v2SwapRouter;
    }

    function setDelyToken(address _delyToken) external onlyOwner {
        if (_delyToken == address(0)) revert InvalidAddress();
        _treasuryControllerStorage().delyToken = _delyToken;
    }

    function setSDelyToken(address _sDelyToken) external onlyOwner {
        if (_sDelyToken == address(0)) revert InvalidAddress();
        _treasuryControllerStorage().sDelyToken = _sDelyToken;
    }

    function setTrustedDomain(address _domain, bool _trusted) external onlyOwner {
        if (_domain == address(0)) revert InvalidAddress();
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
     * @dev 도메인 수익금 정산 전 실행되는 오버라이딩 함수
     * @param _token 수익금 제출 토큰 주소
     * @param _amount 수익금 제출 토큰 수량
     * @param _rewardRecipient 보상 수령자 (0일 시 보상 수령 없음)
     */
    function _beforeSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal override virtual whenNotPaused {
        TreasuryControllerStorage.Data storage data_ = _treasuryControllerStorage();
        if (data_.v2SwapRouter == address(0)) revert NotInitializing();
        if (data_.delyToken == address(0)) revert NotInitializing();
        if (data_.sDelyToken == address(0)) revert NotInitializing();
    }

    /**
     * @dev 도메인 수익금 정산 후 실행되는 오버라이딩 함수
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

        // uniswapRouter에 토큰 사용 권한 부여
        bool successApproval = IERC20(_token).approve(uniswapRouter, _amount);
        if (!successApproval) revert ExternalCallFailed();

        // 토큰 교환 경로 설정
        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = delyToken;
        
        // 토큰 교환
        IV2SwapRouter(uniswapRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            sDelyToken
        );

        // 도메인 보상 수령
        if (domainReward > 0 && _rewardRecipient != address(0)) {
            (bool successMint, ) = delyToken.call(
                abi.encodeWithSignature("mint(address,uint256)", _rewardRecipient, domainReward)
            );
            if (!successMint) revert ExternalCallFailed();
            emit GrantReward(_rewardRecipient, domainReward);
        }
    }

    /**
     * @dev 도메인 수익금 정산 권한을 확인하는 오버라이딩 함수
     * @param _target 도메인 주소
     */
    function _isAuthorized(address _target) internal view override virtual returns (bool isAuthorized) {
        TreasuryControllerStorage.Data storage data_ = _treasuryControllerStorage();
        isAuthorized = data_.trustedDomains[_target];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _treasuryControllerStorage() internal pure returns (TreasuryControllerStorage.Data storage data_) {
        data_ = TreasuryControllerStorage.data();
    }  
}
