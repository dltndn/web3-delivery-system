// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library DeliveryStorage {
    // keccak256(abi.encode(uint256(keccak256("delivery.storage.Delivery")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 constant DELIVERY_STORAGE_LOCATION = 0x7cd1a4d26a6c33721dcdc807853f7d57119866fdd18ac4ac8dddeff5d72cd900;

    enum OrderStatus {
        NotRequested,
        Pending,
        Accepted,
        Completed,
        Cancelled
    }

    struct Order {
        address client;
        address deliverer;
        uint256 price;
        OrderStatus status;
        uint256 requestTime;
        uint256 acceptTime;
        uint256 completeTime;
        uint256 cancelTime;
    }

    struct Data {
        address treasuryController;
        address currencyToken;
        uint256 feeRate; // 10000 = 100%
        uint256 minOrderPrice;
        mapping(address => bool) registeredDeliverers;
        mapping(uint256 => Order) orders;
    }

    function data() internal pure returns (Data storage data_) {
        bytes32 location = DELIVERY_STORAGE_LOCATION;
        assembly {
            data_.slot := location
        }
    }
}