// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "../node_modules/solady/src/tokens/ERC20.sol";
import {Ownable} from "../node_modules/solady/src/auth/Ownable.sol";

contract DelyToken is ERC20, Ownable {

    constructor(
        address _treasuryController
    ) {        
        _initializeOwner(_treasuryController);
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
