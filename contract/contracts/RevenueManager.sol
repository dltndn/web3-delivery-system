// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IRevenueManager} from "./interface/IRevenueManager.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract RevenueManager is IRevenueManager, ERC165 {
    
    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyAuthorized() {
        if (!_isAuthorized(msg.sender)) revert NotAuthorized();
        _;
    }

    constructor() {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev 수익금 정산 함수
     * @param _token 수익금 정산 토큰 주소
     * @param _amount 수익금 정산 토큰 수량
     * @param _rewardRecipient 보상 수령자 (0일 시 보상 수령 없음)
     */
    function submitRevenue(address _token, uint256 _amount, address _rewardRecipient) external virtual onlyAuthorized returns (bool success) {
        _beforeSubmitRevenue(_token, _amount, _rewardRecipient);
        
        bool successTransfer = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        if (!successTransfer) revert ExternalCallFailed();

        _afterSubmitRevenue(_token, _amount, _rewardRecipient);

        emit RevenueSubmitted(_token, _amount, msg.sender);
        success = true;
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function supportsInterface(bytes4 interfaceId) public view override virtual returns (bool) {
        return interfaceId == type(IRevenueManager).interfaceId || super.supportsInterface(interfaceId);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev 도메인 수익금 정산 전 실행되는 함수
     * @param _token 수익금 정산 토큰 주소
     * @param _amount 수익금 정산 토큰 수량
     * @param _rewardRecipient 보상 수령자 (0일 시 보상 수령 없음)
     */
    function _beforeSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal virtual {}

    /**
     * @dev 도메인 수익금 정산 후 실행되는 함수
     * @param _token 수익금 정산 토큰 주소
     * @param _amount 수익금 정산 토큰 수량
     * @param _rewardRecipient 보상 수령자 (0일 시 보상 수령 없음)
     */
    function _afterSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal virtual {}

    /**
     * @dev 필수 오버라이딩 함수
     * @param _target 권한 확인 대상 주소
     */
    function _isAuthorized(address _target) internal view virtual returns (bool isAuthorized) {
        isAuthorized = false;
    }
}