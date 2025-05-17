// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library TreasuryControllerStorage {
    // keccak256(abi.encode(uint256(keccak256("delivery.storage.TreasuryController")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 constant TREASURY_CONTROLLER_STORAGE_LOCATION = 0x97ff0865e3939a2717c8e814fa0d1fe3edb0423c10997afbdba574d42a86f200;

    struct Data {
        address v2SwapRouter;
        address delyToken;
        address sDelyToken;
        mapping(address => uint256) domainRewards;
    }

    function data() internal pure returns (Data storage data_) {
        bytes32 location = TREASURY_CONTROLLER_STORAGE_LOCATION;
        assembly {
            data_.slot := location
        }
    }
}