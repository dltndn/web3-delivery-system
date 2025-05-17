// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IBeacon} from "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";

contract Delivery is ERC1967Proxy, IBeacon {

    constructor(address _imp, bytes memory _data) ERC1967Proxy(_imp, _data){}

    function implementation() external override view returns(address){
        return _implementation();
    }
}
