// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DogGameToken is ERC20, Ownable {
    constructor() ERC20("DogGame", "DOG") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract DogGameNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    uint256 private _tokenIds;
    uint256 public mintPrice = 0.01 ether;
    mapping(uint256 => uint256) public tokenScores;
    string private _baseTokenURI;

    constructor() ERC721("DogGame NFT", "DOGNFT") {}

    function mintNFT(address player) public onlyOwner nonReentrant returns (uint256) {
        _tokenIds++;
        _safeMint(player, _tokenIds);
        return _tokenIds;
    }

    function setTokenScore(uint256 tokenId, uint256 score) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        tokenScores[tokenId] = score;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }
}

contract GameManager is Ownable, ReentrancyGuard {
    DogGameToken public token;
    DogGameNFT public nft;
    
    uint256 public constant POINTS_TO_TOKEN_RATE = 10; // 10 points = 1 token
    uint256 public constant NFT_THRESHOLD = 100; // Points needed for NFT
    
    mapping(address => uint256) public playerScores;
    mapping(address => uint256) public lastPlayTime;
    uint256 public cooldownPeriod = 1 hours;

    event ScoreUpdated(address player, uint256 score);
    event RewardsClaimed(address player, uint256 tokens);
    event NFTMinted(address player, uint256 tokenId);

    constructor(address _token, address _nft) {
        token = DogGameToken(_token);
        nft = DogGameNFT(_nft);
    }

    function updateScore(address player, uint256 score) public onlyOwner {
        require(block.timestamp >= lastPlayTime[player] + cooldownPeriod, "Cooldown period not over");
        playerScores[player] = score;
        lastPlayTime[player] = block.timestamp;
        emit ScoreUpdated(player, score);

        // Auto-mint NFT if threshold reached
        if (score >= NFT_THRESHOLD) {
            uint256 tokenId = nft.mintNFT(player);
            nft.setTokenScore(tokenId, score);
            emit NFTMinted(player, tokenId);
        }
    }

    function claimRewards(address player) public nonReentrant {
        uint256 score = playerScores[player];
        require(score > 0, "No score to claim");
        
        uint256 tokenReward = score / POINTS_TO_TOKEN_RATE;
        require(tokenReward > 0, "Score too low for rewards");
        
        playerScores[player] = 0;
        token.mint(player, tokenReward * 10 ** 18); // Convert to token decimals
        
        emit RewardsClaimed(player, tokenReward);
    }

    function setCooldownPeriod(uint256 period) public onlyOwner {
        cooldownPeriod = period;
    }
}
