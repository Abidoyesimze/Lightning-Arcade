// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LightningArcadeRewards
 * @dev NFT-based achievement system and prize distribution for Lightning Arcade
 * Features: Achievement badges, collectible NFTs, prize distribution, rarity system
 */
contract LightningArcadeRewards is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Badge rarity levels
    enum Rarity {
        COMMON,     // 0: 60% drop rate
        RARE,       // 1: 25% drop rate  
        EPIC,       // 2: 12% drop rate
        LEGENDARY   // 3: 3% drop rate
    }

    // Achievement badge structure
    struct AchievementBadge {
        uint256 tokenId;
        uint256 achievementId;
        address recipient;
        Rarity rarity;
        string badgeName;
        string description;
        uint256 mintedDate;
        uint256 serialNumber; // For tracking badge series
        bool isTransferable;
        string imageURI;
        string animationURI;
    }

    // Prize pool structure
    struct PrizePool {
        uint256 poolId;
        string name;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 winnersCount;
        uint256 distributionDate;
        bool isActive;
        address[] winners;
        uint256[] prizes;
    }

    // Special collectible NFT structure
    struct CollectibleNFT {
        uint256 tokenId;
        string name;
        string description;
        Rarity rarity;
        uint256 mintedDate;
        uint256 editionSize;
        uint256 editionNumber;
        string imageURI;
        string animationURI;
        mapping(string => string) attributes;
    }

    // Counters
    uint256 private _tokenIdCounter;
    uint256 private _prizePoolIdCounter;

    // Mappings
    mapping(uint256 => AchievementBadge) public achievementBadges;
    mapping(uint256 => CollectibleNFT) public collectibleNFTs;
    mapping(uint256 => PrizePool) public prizePools;
    mapping(address => uint256[]) public playerBadges;
    mapping(address => uint256[]) public playerCollectibles;
    mapping(uint256 => uint256) public achievementSerialNumbers; // achievementId => next serial number
    mapping(Rarity => uint256) public raritySupply; // Track total supply by rarity
    mapping(address => uint256) public totalPrizesWon;

    // Achievement NFT metadata base URIs
    string private _achievementBaseURI = "https://lightningarcade.io/nft/achievements/";
    string private _collectibleBaseURI = "https://lightningarcade.io/nft/collectibles/";

    // Events
    event AchievementBadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 indexed achievementId,
        Rarity rarity,
        uint256 serialNumber
    );

    event CollectibleMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        string name,
        Rarity rarity,
        uint256 editionNumber
    );

    event PrizeDistributed(
        address indexed winner,
        uint256 indexed prizePoolId,
        uint256 amount,
        uint256 timestamp
    );

    event PrizePoolCreated(
        uint256 indexed poolId,
        string name,
        uint256 totalAmount,
        uint256 winnersCount
    );

    event BadgeUpgraded(
        uint256 indexed tokenId,
        Rarity oldRarity,
        Rarity newRarity
    );

    // Modifiers
    modifier validTokenId(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    constructor() ERC721("Lightning Arcade Rewards", "LAR") Ownable(msg.sender) {}

    function mintAchievementBadge(
        address recipient,
        uint256 achievementId,
        string memory badgeName,
        string memory description,
        Rarity rarity,
        string memory imageURI,
        string memory animationURI
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Increment serial number for this achievement
        achievementSerialNumbers[achievementId]++;
        uint256 serialNumber = achievementSerialNumbers[achievementId];

        // Create badge
        achievementBadges[tokenId] = AchievementBadge({
            tokenId: tokenId,
            achievementId: achievementId,
            recipient: recipient,
            rarity: rarity,
            badgeName: badgeName,
            description: description,
            mintedDate: block.timestamp,
            serialNumber: serialNumber,
            isTransferable: true,
            imageURI: imageURI,
            animationURI: animationURI
        });

        // Mint NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _generateAchievementMetadata(tokenId));

        // Update tracking
        playerBadges[recipient].push(tokenId);
        raritySupply[rarity]++;

        emit AchievementBadgeMinted(recipient, tokenId, achievementId, rarity, serialNumber);

        return tokenId;
    }

    function mintCollectible(
        address recipient,
        string memory name,
        string memory description,
        Rarity rarity,
        uint256 editionSize,
        string memory imageURI,
        string memory animationURI
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Create collectible
        CollectibleNFT storage collectible = collectibleNFTs[tokenId];
        collectible.tokenId = tokenId;
        collectible.name = name;
        collectible.description = description;
        collectible.rarity = rarity;
        collectible.mintedDate = block.timestamp;
        collectible.editionSize = editionSize;
        collectible.editionNumber = 1; // Would track this properly in production
        collectible.imageURI = imageURI;
        collectible.animationURI = animationURI;

        // Mint NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _generateCollectibleMetadata(tokenId));

        // Update tracking
        playerCollectibles[recipient].push(tokenId);
        raritySupply[rarity]++;

        emit CollectibleMinted(recipient, tokenId, name, rarity, 1);

        return tokenId;
    }

    function createPrizePool(
        string memory name,
        uint256 winnersCount,
        address[] memory winners,
        uint256[] memory prizes
    ) external payable onlyOwner returns (uint256) {
        require(winners.length == prizes.length, "Winners and prizes length mismatch");
        require(winners.length <= winnersCount, "Too many winners specified");
        require(msg.value > 0, "Prize pool must have funds");

        _prizePoolIdCounter++;
        uint256 poolId = _prizePoolIdCounter;

        uint256 totalPrizes = 0;
        for (uint256 i = 0; i < prizes.length; i++) {
            totalPrizes += prizes[i];
        }
        require(totalPrizes <= msg.value, "Insufficient funds for prizes");

        prizePools[poolId] = PrizePool({
            poolId: poolId,
            name: name,
            totalAmount: msg.value,
            remainingAmount: msg.value,
            winnersCount: winnersCount,
            distributionDate: block.timestamp,
            isActive: true,
            winners: winners,
            prizes: prizes
        });

        emit PrizePoolCreated(poolId, name, msg.value, winnersCount);

        return poolId;
    }

    function distributePrizes(uint256 poolId) external onlyOwner nonReentrant {
        PrizePool storage pool = prizePools[poolId];
        require(pool.isActive, "Prize pool not active");
        require(pool.winners.length > 0, "No winners specified");

        for (uint256 i = 0; i < pool.winners.length; i++) {
            address winner = pool.winners[i];
            uint256 prize = pool.prizes[i];

            if (prize > 0 && prize <= pool.remainingAmount) {
                pool.remainingAmount -= prize;
                totalPrizesWon[winner] += prize;

                payable(winner).transfer(prize);

                emit PrizeDistributed(winner, poolId, prize, block.timestamp);
            }
        }

        pool.isActive = false;
    }

    function upgradeBadgeRarity(uint256 tokenId, Rarity newRarity)
        external
        onlyOwner
        validTokenId(tokenId)
    {
        AchievementBadge storage badge = achievementBadges[tokenId];
        require(uint256(newRarity) > uint256(badge.rarity), "Can only upgrade rarity");

        Rarity oldRarity = badge.rarity;
        badge.rarity = newRarity;

        raritySupply[oldRarity]--;
        raritySupply[newRarity]++;

        _setTokenURI(tokenId, _generateAchievementMetadata(tokenId));

        emit BadgeUpgraded(tokenId, oldRarity, newRarity);
    }

    function setBadgeTransferability(uint256 tokenId, bool transferable)
        external
        onlyOwner
        validTokenId(tokenId)
    {
        achievementBadges[tokenId].isTransferable = transferable;
    }

    function _generateAchievementMetadata(uint256 tokenId)
        internal
        view
        returns (string memory)
    {
        AchievementBadge memory badge = achievementBadges[tokenId];

        string memory rarityString = _getRarityString(badge.rarity);
        string memory attributes = string(abi.encodePacked(
            '[',
            '{"trait_type": "Type", "value": "Achievement Badge"},',
            '{"trait_type": "Rarity", "value": "', rarityString, '"},',
            '{"trait_type": "Achievement ID", "value": "', badge.achievementId.toString(), '"},',
            '{"trait_type": "Serial Number", "value": "', badge.serialNumber.toString(), '"},',
            '{"trait_type": "Mint Date", "value": "', badge.mintedDate.toString(), '"}',
            ']'
        ));

        string memory json = string(abi.encodePacked(
            '{',
            '"name": "', badge.badgeName, ' #', badge.serialNumber.toString(), '",',
            '"description": "', badge.description, '",',
            '"image": "', badge.imageURI, '",',
            '"animation_url": "', badge.animationURI, '",',
            '"attributes": ', attributes,
            '}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _generateCollectibleMetadata(uint256 tokenId)
        internal
        view
        returns (string memory)
    {
        CollectibleNFT storage collectible = collectibleNFTs[tokenId];

        string memory rarityString = _getRarityString(collectible.rarity);
        string memory attributes = string(abi.encodePacked(
            '[',
            '{"trait_type": "Type", "value": "Collectible"},',
            '{"trait_type": "Rarity", "value": "', rarityString, '"},',
            '{"trait_type": "Edition", "value": "', collectible.editionNumber.toString(), ' of ', collectible.editionSize.toString(), '"},',
            '{"trait_type": "Mint Date", "value": "', collectible.mintedDate.toString(), '"}',
            ']'
        ));

        string memory json = string(abi.encodePacked(
            '{',
            '"name": "', collectible.name, ' #', collectible.editionNumber.toString(), '",',
            '"description": "', collectible.description, '",',
            '"image": "', collectible.imageURI, '",',
            '"animation_url": "', collectible.animationURI, '",',
            '"attributes": ', attributes,
            '}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _getRarityString(Rarity rarity) internal pure returns (string memory) {
        if (rarity == Rarity.COMMON) return "Common";
        if (rarity == Rarity.RARE) return "Rare";
        if (rarity == Rarity.EPIC) return "Epic";
        if (rarity == Rarity.LEGENDARY) return "Legendary";
        return "Unknown";
    }

    function getRarityColor(Rarity rarity) external pure returns (string memory) {
        if (rarity == Rarity.COMMON) return "#9CA3AF";
        if (rarity == Rarity.RARE) return "#3B82F6";
        if (rarity == Rarity.EPIC) return "#8B5CF6";
        if (rarity == Rarity.LEGENDARY) return "#F59E0B";
        return "#6B7280";
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        if (from != address(0) && from != to) {
            if (achievementBadges[tokenId].tokenId != 0) {
                require(achievementBadges[tokenId].isTransferable, "Achievement badge not transferable");
            }
        }
        
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function batchMintAchievementBadges(
        address[] memory recipients,
        uint256[] memory achievementIds,
        string[] memory badgeNames,
        string[] memory descriptions,
        Rarity[] memory rarities,
        string[] memory imageURIs,
        string[] memory animationURIs
    ) external onlyOwner {
        require(recipients.length == achievementIds.length, "Array length mismatch");
        require(recipients.length == badgeNames.length, "Array length mismatch");
        require(recipients.length == descriptions.length, "Array length mismatch");
        require(recipients.length == rarities.length, "Array length mismatch");
        require(recipients.length == imageURIs.length, "Array length mismatch");
        require(recipients.length == animationURIs.length, "Array length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            this.mintAchievementBadge(
                recipients[i],
                achievementIds[i],
                badgeNames[i],
                descriptions[i],
                rarities[i],
                imageURIs[i],
                animationURIs[i]
            );
        }
    }

    function getPlayerBadges(address player) external view returns (uint256[] memory) {
        return playerBadges[player];
    }

    function getPlayerCollectibles(address player) external view returns (uint256[] memory) {
        return playerCollectibles[player];
    }

    function getAchievementBadge(uint256 tokenId)
        external
        view
        validTokenId(tokenId)
        returns (AchievementBadge memory)
    {
        return achievementBadges[tokenId];
    }

    function getCollectibleNFT(uint256 tokenId)
        external
        view
        validTokenId(tokenId)
        returns (
            uint256,
            string memory,
            string memory,
            Rarity,
            uint256,
            uint256,
            uint256,
            string memory,
            string memory
        )
    {
        CollectibleNFT storage collectible = collectibleNFTs[tokenId];
        return (
            collectible.tokenId,
            collectible.name,
            collectible.description,
            collectible.rarity,
            collectible.mintedDate,
            collectible.editionSize,
            collectible.editionNumber,
            collectible.imageURI,
            collectible.animationURI
        );
    }

    function getPrizePool(uint256 poolId) external view returns (PrizePool memory) {
        return prizePools[poolId];
    }

    function getRaritySupply(Rarity rarity) external view returns (uint256) {
        return raritySupply[rarity];
    }

    function getPlayerTotalPrizes(address player) external view returns (uint256) {
        return totalPrizesWon[player];
    }

    function isBadgeTransferable(uint256 tokenId)
        external
        view
        validTokenId(tokenId)
        returns (bool)
    {
        return achievementBadges[tokenId].isTransferable;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function setBaseURIs(
        string memory achievementBaseURI,
        string memory collectibleBaseURI
    ) external onlyOwner {
        _achievementBaseURI = achievementBaseURI;
        _collectibleBaseURI = collectibleBaseURI;
    }

    function getTotalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getTotalPrizePools() external view returns (uint256) {
        return _prizePoolIdCounter;
    }

    receive() external payable {}
}