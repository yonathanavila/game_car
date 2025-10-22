// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract GameLogic is AccessControl, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IERC20 public gameToken; // Reference to the ERC20 token contract
    uint256 public tokenMultiplier = 1; // Default multiplier for token rewards
    address public trustedSigner; // backend signer

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
    mapping(address => mapping(uint256 => bool)) public usedNonces; // track the used nonce signatures
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
    event TrustedSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );

    constructor(address _tokenAddress, address _trustedSigner) {
        gameToken = IERC20(_tokenAddress);
        trustedSigner = _trustedSigner;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Submit score (only callable by admin)
    function submitScore(
        uint256 score,
        uint256 nonce,
        bytes calldata signature
    ) external whenNotPaused {
        require(score > 0, "Score must be greater than zero");
        require(!usedNonces[msg.sender][nonce], "Nonce already used");

        bytes32 hash = keccak256(abi.encode(msg.sender, score, nonce))
            .toEthSignedMessageHash();
        address recovered = hash.recover(signature);
        require(recovered == trustedSigner, "Invalid signature");

        // Check if the new score is higher than the current score
        require(
            score > players[msg.sender].score,
            "Submitted score must be higher than current score"
        );

        // Update or initialize player data
        if (
            players[msg.sender].score == 0 &&
            players[msg.sender].lastSubmissionTimestamp == 0
        ) {
            playerAddresses.push(msg.sender);
            emit PlayerAdded(msg.sender);
        }

        players[msg.sender].score = score;
        players[msg.sender].lastSubmissionTimestamp = block.timestamp;
        usedNonces[msg.sender][nonce] = true;

        // Calculate tokens based on formula: tokens = score * tokenMultiplier
        uint256 tokensToTransfer = score * tokenMultiplier * 1e18;
        require(
            gameToken.balanceOf(address(this)) >= tokensToTransfer,
            "Insufficient contract balance"
        );
        gameToken.safeTransfer(msg.sender, tokensToTransfer);

        emit ScoreSubmitted(msg.sender, score, tokensToTransfer);
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
            uint256 i = offset;
            i < offset + actualLength && i < entries.length;
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
    function repairVehicle(
        string calldata component,
        uint256 repairCost
    ) external whenNotPaused {
        require(bytes(component).length > 0, "Component cannot be empty");
        require(repairCost > 0, "Repair cost must be greater than zero");
        require(
            gameToken.allowance(msg.sender, address(this)) >= repairCost,
            "Insufficient allowance"
        );
        gameToken.safeTransferFrom(msg.sender, address(this), repairCost);
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

    // Admin-side utility to rotate signer if needed
    function updateTrustedSigner(
        address newSigner
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newSigner != address(0), "Invalid signer address");
        emit TrustedSignerUpdated(trustedSigner, newSigner);
        trustedSigner = newSigner;
    }

    function withdrawTokens(
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            amount <= gameToken.balanceOf(address(this)),
            "Insufficient balance"
        );
        gameToken.safeTransfer(msg.sender, amount);
    }
}
