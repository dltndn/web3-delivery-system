// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library DeliveryStorage {
    // keccak256(abi.encode(uint256(keccak256("delivery.storage.Delivery")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 constant DELIVERY_STORAGE_LOCATION = 0x7cd1a4d26a6c33721dcdc807853f7d57119866fdd18ac4ac8dddeff5d72cd900;

    struct Data {
        
    }

    function data() internal pure returns (Data storage data_) {
        bytes32 location = DELIVERY_STORAGE_LOCATION;
        assembly {
            data_.slot := location
        }
    }
}