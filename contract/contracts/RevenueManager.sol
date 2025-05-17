// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IRevenueManager} from "./interface/IRevenueManager.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract RevenueManager is IRevenueManager, ERC165 {
    
    constructor() {}

    function submitRevenue(address _token, uint256 _amount, address _rewardRecipient) external returns (bool success) {
        _beforeSubmitRevenue(_token, _amount, _rewardRecipient);
        
        bool successTransfer = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        if (!successTransfer) revert ExternalCallFailed();

        _afterSubmitRevenue(_token, _amount, _rewardRecipient);

        emit RevenueSubmitted(_token, _amount, msg.sender);
        success = true;
    }

    function supportsInterface(bytes4 interfaceId) public view override virtual returns (bool) {
        return interfaceId == type(IRevenueManager).interfaceId || super.supportsInterface(interfaceId);
    }

    function _beforeSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal virtual {}

    function _afterSubmitRevenue(address _token, uint256 _amount, address _rewardRecipient) internal virtual {}
}