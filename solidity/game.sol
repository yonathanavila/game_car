// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract GameLogic is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 public gameToken; // Reference to the ERC20 token contract
    uint256 public tokenMultiplier = 1; // Default multiplier for token rewards
    uint256 public constant REPAIR_COST = 100 * 10 ** 18; // Repair cost: 100 tokens

    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Player {
        uint256 score;
        uint256 lastSubmissionTimestamp;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;
    }

    mapping(address => Player) public players; // Player data
    address[] public playerAddresses; // List of player addresses for leaderboard

    // Events for transparency
    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        uint256 tokensEarned
    );
    event FormulaUpdated(uint256 newMultiplier);
    event VehicleRepaired(address indexed player, string component);
    event PlayerAdded(address indexed player);

    constructor(address _tokenAddress) {
        gameToken = IERC20(_tokenAddress);
        // Set deployer as the default admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Submit score (only callable by admin)
    function submitScore(
        address player,
        uint256 score
    ) external onlyRole(ADMIN_ROLE) {
        require(player != address(0), "Invalid player address");
        require(score > 0, "Score must be greater than zero");

        // Update or initialize player data
        if (
            players[player].score == 0 &&
            players[player].lastSubmissionTimestamp == 0
        ) {
            playerAddresses.push(player);
            emit PlayerAdded(player);
        }

        players[player].score += score;
        players[player].lastSubmissionTimestamp = block.timestamp;

        // Calculate tokens based on formula: tokens = score * tokenMultiplier
        uint256 tokensToMint = score * tokenMultiplier * 10 ** 18;
        gameToken.safeTransfer(player, tokensToMint);

        emit ScoreSubmitted(player, score, tokensToMint);
    }

    // Retrieve score for a wallet
    function getScore(address wallet) external view returns (uint256) {
        return players[wallet].score;
    }

    // Get paginated leaderboard
    function getLeaderboard(
        uint256 offset,
        uint256 limit
    ) external view returns (LeaderboardEntry[] memory) {
        require(offset < playerAddresses.length, "Offset out of bounds");
        uint256 maxLength = playerAddresses.length - offset;
        uint256 actualLength = limit > maxLength ? maxLength : limit;
        LeaderboardEntry[] memory leaderboard = new LeaderboardEntry[](
            actualLength
        );

        // Create a copy of entries for sorting
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](
            playerAddresses.length
        );
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            entries[i] = LeaderboardEntry(
                playerAddresses[i],
                players[playerAddresses[i]].score
            );
        }

        // Selection sort for efficiency
        for (
            uint256 i = 0;
            i < entries.length && i < offset + actualLength;
            i++
        ) {
            uint256 maxIndex = i;
            for (uint256 j = i + 1; j < entries.length; j++) {
                if (entries[j].score > entries[maxIndex].score) {
                    maxIndex = j;
                }
            }
            if (maxIndex != i) {
                (entries[i], entries[maxIndex]) = (
                    entries[maxIndex],
                    entries[i]
                );
            }
        }

        // Copy requested entries to result
        for (uint256 i = 0; i < actualLength; i++) {
            leaderboard[i] = entries[offset + i];
        }

        return leaderboard;
    }

    // Repair vehicle component
    function repairVehicle(string calldata component) external {
        require(
            gameToken.allowance(msg.sender, address(this)) >= REPAIR_COST,
            "Insufficient allowance"
        );
        gameToken.safeTransferFrom(msg.sender, address(this), REPAIR_COST);
        emit VehicleRepaired(msg.sender, component);
    }

    // Update token reward formula (only callable by admin)
    function updateTokenMultiplier(
        uint256 newMultiplier
    ) external onlyRole(ADMIN_ROLE) {
        require(newMultiplier > 0, "Multiplier must be greater than zero");
        tokenMultiplier = newMultiplier;
        emit FormulaUpdated(newMultiplier);
    }

    // Admin management functions
    function grantAdminRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
    }

    function revokeAdminRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, account);
    }
}
