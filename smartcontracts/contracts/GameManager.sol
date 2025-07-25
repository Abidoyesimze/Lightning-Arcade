// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameManager
 * @dev Core contract managing all Lightning Arcade mini games
 * Optimized for Somnia's high-speed blockchain with 1000+ concurrent players
 */
contract GameManager is ReentrancyGuard, Ownable {
    enum GameType {
        SPEED_CLICKER,
        MEMORY_CHAIN,
        WORD_BLITZ,
        REACTION_TIME,
        NUMBER_NINJA,
        PATTERN_SAMURAI
    }

    struct GameSession {
        uint256 gameId;
        GameType gameType;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 duration;
        uint256 maxPlayers;
        uint256 entryFee;
        uint256 prizePool;
        bool isActive;
        bool isFinished;
        address winner;
        uint256 totalPlayers;
    }

    struct PlayerGameData {
        address player;
        uint256 score;
        uint256 timestamp;
        uint256 rank;
        bool hasFinished;
    }

    uint256 private _gameIdCounter;
    mapping(uint256 => GameSession) public games;
    mapping(uint256 => mapping(address => PlayerGameData)) public playerGameData;
    mapping(uint256 => address[]) public gamePlayers;
    mapping(address => uint256[]) public playerGames;
    mapping(GameType => uint256) public gameTypeCounts;

    event GameCreated(uint256 indexed gameId, GameType indexed gameType, address indexed creator, uint256 duration, uint256 maxPlayers, uint256 entryFee);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 totalPlayers);
    event GameStarted(uint256 indexed gameId, GameType indexed gameType, address[] players, uint256 startTime);
    event ScoreUpdate(uint256 indexed gameId, address indexed player, uint256 score, uint256 timestamp, uint256 rank);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 winningScore, uint256 totalPlayers, uint256 prizeAmount);
    event LeaderboardUpdate(uint256 indexed gameId, address[] topPlayers, uint256[] scores);

    modifier gameExists(uint256 gameId) {
        require(games[gameId].gameId != 0, "Game does not exist");
        _;
    }
    modifier gameActive(uint256 gameId) {
        require(games[gameId].isActive, "Game is not active");
        require(block.timestamp >= games[gameId].startTime, "Game hasn't started");
        require(block.timestamp <= games[gameId].endTime, "Game has ended");
        _;
    }
    modifier playerInGame(uint256 gameId, address player) {
        require(playerGameData[gameId][player].player == player, "Player not in game");
        _;
    }

    function createGame(
        GameType gameType,
        uint256 duration,
        uint256 maxPlayers,
        uint256 entryFee
    ) external payable returns (uint256) {
        require(duration > 0 && duration <= 300, "Duration must be 1-300 seconds");
        require(maxPlayers > 0 && maxPlayers <= 1000, "Max players must be 1-1000");
        require(msg.value >= entryFee, "Insufficient entry fee");

        _gameIdCounter++;
        uint256 gameId = _gameIdCounter;

        games[gameId] = GameSession({
            gameId: gameId,
            gameType: gameType,
            creator: msg.sender,
            startTime: 0,
            endTime: 0,
            duration: duration,
            maxPlayers: maxPlayers,
            entryFee: entryFee,
            prizePool: entryFee,
            isActive: false,
            isFinished: false,
            winner: address(0),
            totalPlayers: 0
        });

        gameTypeCounts[gameType]++;

        if (msg.value >= entryFee) {
            _joinGame(gameId, msg.sender);
        }

        emit GameCreated(gameId, gameType, msg.sender, duration, maxPlayers, entryFee);
        return gameId;
    }

    function joinGame(uint256 gameId) external payable gameExists(gameId) {
        GameSession storage game = games[gameId];
        require(!game.isActive, "Game already started");
        require(!game.isFinished, "Game is finished");
        require(game.totalPlayers < game.maxPlayers, "Game is full");
        require(msg.value >= game.entryFee, "Insufficient entry fee");
        require(playerGameData[gameId][msg.sender].player == address(0), "Already joined");

        _joinGame(gameId, msg.sender);

        if (game.totalPlayers >= game.maxPlayers) {
            _startGame(gameId);
        }
    }

    function _joinGame(uint256 gameId, address player) internal {
        GameSession storage game = games[gameId];
        playerGameData[gameId][player] = PlayerGameData({
            player: player,
            score: 0,
            timestamp: block.timestamp,
            rank: 0,
            hasFinished: false
        });
        gamePlayers[gameId].push(player);
        playerGames[player].push(gameId);
        game.totalPlayers++;
        game.prizePool += game.entryFee;
        emit PlayerJoined(gameId, player, game.totalPlayers);
    }

    function startGame(uint256 gameId) external gameExists(gameId) {
        GameSession storage game = games[gameId];
        require(msg.sender == game.creator, "Only creator can start");
        require(game.totalPlayers > 0, "No players joined");
        require(!game.isActive, "Game already started");
        _startGame(gameId);
    }

    function _startGame(uint256 gameId) internal {
        GameSession storage game = games[gameId];
        game.isActive = true;
        game.startTime = block.timestamp;
        game.endTime = block.timestamp + game.duration;
        emit GameStarted(gameId, game.gameType, gamePlayers[gameId], game.startTime);
    }

    function submitScore(uint256 gameId, uint256 score)
        external
        gameExists(gameId)
        gameActive(gameId)
        playerInGame(gameId, msg.sender)
        nonReentrant
    {
        PlayerGameData storage playerData = playerGameData[gameId][msg.sender];
        GameType gameType = games[gameId].gameType;
        if (gameType == GameType.REACTION_TIME || gameType == GameType.MEMORY_CHAIN) {
            playerData.score = score;
        } else {
            require(score > playerData.score, "Score must be higher");
            playerData.score = score;
        }
        playerData.timestamp = block.timestamp;
        uint256 rank = _calculateRank(gameId, msg.sender);
        playerData.rank = rank;
        emit ScoreUpdate(gameId, msg.sender, score, block.timestamp, rank);
        if (block.timestamp >= games[gameId].endTime) {
            _endGame(gameId);
        }
    }

    function endGame(uint256 gameId) external gameExists(gameId) {
        GameSession storage game = games[gameId];
        require(
            block.timestamp >= game.endTime || msg.sender == game.creator,
            "Game not finished or not creator"
        );
        require(game.isActive, "Game not active");
        _endGame(gameId);
    }

    function _endGame(uint256 gameId) internal {
        GameSession storage game = games[gameId];
        game.isActive = false;
        game.isFinished = true;
        address winner = _findWinner(gameId);
        game.winner = winner;
        if (winner != address(0) && game.prizePool > 0) {
            uint256 winnerPrize = (game.prizePool * 90) / 100;
            payable(winner).transfer(winnerPrize);
            emit GameFinished(
                gameId,
                winner,
                playerGameData[gameId][winner].score,
                game.totalPlayers,
                winnerPrize
            );
        }
        _emitLeaderboard(gameId);
    }

    function _calculateRank(uint256 gameId, address player) internal view returns (uint256) {
        uint256 playerScore = playerGameData[gameId][player].score;
        uint256 rank = 1;
        address[] memory players = gamePlayers[gameId];
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] != player && playerGameData[gameId][players[i]].score > playerScore) {
                rank++;
            }
        }
        return rank;
    }

    function _findWinner(uint256 gameId) internal view returns (address) {
        address[] memory players = gamePlayers[gameId];
        if (players.length == 0) return address(0);
        address winner = players[0];
        uint256 highestScore = playerGameData[gameId][winner].score;
        for (uint256 i = 1; i < players.length; i++) {
            uint256 score = playerGameData[gameId][players[i]].score;
            if (score > highestScore) {
                highestScore = score;
                winner = players[i];
            }
        }
        return winner;
    }

    function _emitLeaderboard(uint256 gameId) internal {
        address[] memory players = gamePlayers[gameId];
        uint256[] memory scores = new uint256[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            scores[i] = playerGameData[gameId][players[i]].score;
        }
        emit LeaderboardUpdate(gameId, players, scores);
    }

    function getGame(uint256 gameId) external view returns (GameSession memory) {
        return games[gameId];
    }

    function getPlayerGameData(uint256 gameId, address player)
        external
        view
        returns (PlayerGameData memory)
    {
        return playerGameData[gameId][player];
    }

    function getGamePlayers(uint256 gameId) external view returns (address[] memory) {
        return gamePlayers[gameId];
    }

    function getLeaderboard(uint256 gameId, uint256 limit)
        external
        view
        returns (address[] memory players, uint256[] memory scores)
    {
        address[] memory allPlayers = gamePlayers[gameId];
        require(limit > 0 && limit <= allPlayers.length, "Invalid limit");
        address[] memory sortedPlayers = new address[](allPlayers.length);
        uint256[] memory sortedScores = new uint256[](allPlayers.length);
        for (uint256 i = 0; i < allPlayers.length; i++) {
            sortedPlayers[i] = allPlayers[i];
            sortedScores[i] = playerGameData[gameId][allPlayers[i]].score;
        }
        for (uint256 i = 0; i < sortedPlayers.length - 1; i++) {
            for (uint256 j = 0; j < sortedPlayers.length - i - 1; j++) {
                if (sortedScores[j] < sortedScores[j + 1]) {
                    uint256 tempScore = sortedScores[j];
                    sortedScores[j] = sortedScores[j + 1];
                    sortedScores[j + 1] = tempScore;
                    address tempPlayer = sortedPlayers[j];
                    sortedPlayers[j] = sortedPlayers[j + 1];
                    sortedPlayers[j + 1] = tempPlayer;
                }
            }
        }
        players = new address[](limit);
        scores = new uint256[](limit);
        for (uint256 i = 0; i < limit; i++) {
            players[i] = sortedPlayers[i];
            scores[i] = sortedScores[i];
        }
        return (players, scores);
    }

    function getActiveGames(GameType gameType)
        external
        view
        returns (uint256[] memory activeGameIds)
    {
        uint256 totalGames = _gameIdCounter;
        uint256[] memory tempIds = new uint256[](totalGames);
        uint256 count = 0;
        for (uint256 i = 1; i <= totalGames; i++) {
            if (
                games[i].gameType == gameType &&
                games[i].isActive &&
                !games[i].isFinished
            ) {
                tempIds[count] = i;
                count++;
            }
        }
        activeGameIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            activeGameIds[i] = tempIds[i];
        }
        return activeGameIds;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function getTotalGames() external view returns (uint256) {
        return _gameIdCounter;
    }
} 