// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SneakDogToken is ERC20, Ownable {
    uint256 public constant POINTS_TO_TOKEN_RATE = 10; // 10 points = 1 token
    
    constructor() ERC20("SneakDog", "SDOG") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million tokens
    }
    
    function mintTokensForScore(address player, uint256 score) external onlyOwner {
        uint256 tokensToMint = score / POINTS_TO_TOKEN_RATE;
        if (tokensToMint > 0) {
            _mint(player, tokensToMint * 10 ** decimals());
        }
    }
}
