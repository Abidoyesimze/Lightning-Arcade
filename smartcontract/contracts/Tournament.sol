// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Tournament
 * @dev Manages tournaments for Lightning Arcade games
 */
contract Tournament is Ownable {
    enum TournamentType {
        SINGLE_ELIMINATION,
        LIGHTNING_ROUND,
        SPEED_CHAMPIONSHIP,
        DAILY_CHALLENGE,
        GRAND_TOURNAMENT
    }

    struct TournamentInfo {
        uint256 tournamentId;
        TournamentType tournamentType;
        string name;
        uint256 startTime;
        uint256 duration;
        uint256 entryFee;
        uint256 maxParticipants;
        uint256 minParticipants;
        uint256[] gameTypes;
        bool isTeamTournament;
        bool isActive;
        bool isFinished;
        address[] participants;
        address winner;
        uint256 prizePool;
    }

    uint256 private _tournamentIdCounter;
    mapping(uint256 => TournamentInfo) public tournaments;
    mapping(address => uint256[]) public playerTournaments;

    event TournamentCreated(uint256 indexed tournamentId, TournamentType tournamentType, string name, uint256 startTime, uint256 duration, uint256 entryFee, uint256 maxParticipants);
    event PlayerRegistered(uint256 indexed tournamentId, address indexed player);
    event TournamentStarted(uint256 indexed tournamentId);
    event TournamentFinished(uint256 indexed tournamentId, address winner, uint256 prize);

    function createTournament(
        TournamentType tournamentType,
        string memory name,
        uint256 startTime,
        uint256 duration,
        uint256 entryFee,
        uint256 maxParticipants,
        uint256 minParticipants,
        uint256[] memory gameTypes,
        bool isTeamTournament
    ) external payable onlyOwner returns (uint256) {
        require(duration > 0, "Duration must be positive");
        require(maxParticipants > 1, "At least 2 participants");
        require(msg.value >= entryFee, "Insufficient entry fee");

        _tournamentIdCounter++;
        uint256 tournamentId = _tournamentIdCounter;

        TournamentInfo storage t = tournaments[tournamentId];
        t.tournamentId = tournamentId;
        t.tournamentType = tournamentType;
        t.name = name;
        t.startTime = startTime;
        t.duration = duration;
        t.entryFee = entryFee;
        t.maxParticipants = maxParticipants;
        t.minParticipants = minParticipants;
        t.gameTypes = gameTypes;
        t.isTeamTournament = isTeamTournament;
        t.isActive = false;
        t.isFinished = false;
        t.prizePool = entryFee;

        emit TournamentCreated(tournamentId, tournamentType, name, startTime, duration, entryFee, maxParticipants);
        return tournamentId;
    }

    function registerPlayer(uint256 tournamentId) external payable {
        TournamentInfo storage t = tournaments[tournamentId];
        require(!t.isActive, "Tournament already started");
        require(!t.isFinished, "Tournament finished");
        require(msg.value >= t.entryFee, "Insufficient entry fee");
        require(t.participants.length < t.maxParticipants, "Tournament full");
        for (uint256 i = 0; i < t.participants.length; i++) {
            require(t.participants[i] != msg.sender, "Already registered");
        }
        t.participants.push(msg.sender);
        t.prizePool += t.entryFee;
        playerTournaments[msg.sender].push(tournamentId);
        emit PlayerRegistered(tournamentId, msg.sender);
    }

    function startTournament(uint256 tournamentId) external onlyOwner {
        TournamentInfo storage t = tournaments[tournamentId];
        require(!t.isActive, "Already started");
        require(!t.isFinished, "Already finished");
        require(t.participants.length >= t.minParticipants, "Not enough participants");
        t.isActive = true;
        emit TournamentStarted(tournamentId);
    }

    function finishTournament(uint256 tournamentId, address winner) external onlyOwner {
        TournamentInfo storage t = tournaments[tournamentId];
        require(t.isActive, "Not active");
        require(!t.isFinished, "Already finished");
        t.isActive = false;
        t.isFinished = true;
        t.winner = winner;
        if (winner != address(0) && t.prizePool > 0) {
            payable(winner).transfer(t.prizePool);
        }
        emit TournamentFinished(tournamentId, winner, t.prizePool);
    }

    function getTournament(uint256 tournamentId) external view returns (TournamentInfo memory) {
        return tournaments[tournamentId];
    }

    function getPlayerTournaments(address player) external view returns (uint256[] memory) {
        return playerTournaments[player];
    }
} 