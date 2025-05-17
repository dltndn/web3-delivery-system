// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "solady/src/tokens/ERC20.sol";
import {Ownable} from "solady/src/auth/Ownable.sol";

contract DelyToken is ERC20, Ownable {

    constructor(
        address _treasuryController,
        address _admin
    ) {        
        _initializeOwner(_treasuryController);
        _mint(_admin, 1000_000_000 ether);
    }
    
    function name() public pure override returns (string memory) {
        return "DelyToken";
    }
    
    function symbol() public pure override returns (string memory) {
        return "DELY";
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
