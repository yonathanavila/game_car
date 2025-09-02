// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GameLeaderboardTopN {
    uint256 public constant TOP_N = 10;

    struct Player {
        uint256 highScore;
        uint256 achievements;
    }

    mapping(address => Player) public players;

    // Top N leaderboard
    address[TOP_N] public topPlayers;
    uint256[TOP_N] public topScores;

    // Events
    event ScoreSubmitted(address indexed player, uint256 score);
    event AchievementUnlocked(address indexed player, uint256 achievementId);
    event LeaderboardUpdated(address[TOP_N] topPlayers, uint256[TOP_N] topScores);

    // Submit a new score
    function submitScore(uint256 score) external {
        Player storage player = players[msg.sender];
        require(score > player.highScore, "Score not higher than current high score");

        player.highScore = score;
        _updateLeaderboard(msg.sender, score);

        emit ScoreSubmitted(msg.sender, score);
    }

    // Unlock an achievement
    function unlockAchievement(uint256 achievementId) external {
        Player storage player = players[msg.sender];
        require((player.achievements & (1 << achievementId)) == 0, "Achievement already unlocked");

        player.achievements |= (1 << achievementId);

        emit AchievementUnlocked(msg.sender, achievementId);
    }

    // Internal function to update top-N leaderboard
    function _updateLeaderboard(address playerAddr, uint256 score) internal {
        // Check if already in leaderboard
        int256 currentIndex = -1;
        for (uint256 i = 0; i < TOP_N; i++) {
            if (topPlayers[i] == playerAddr) {
                currentIndex = int256(i);
                break;
            }
        }

        // Insert new score
        for (uint256 i = 0; i < TOP_N; i++) {
            if (score > topScores[i]) {
                // Shift lower scores down
                for (uint256 j = TOP_N - 1; j > i; j--) {
                    topPlayers[j] = topPlayers[j - 1];
                    topScores[j] = topScores[j - 1];
                }
                // Insert new top score
                topPlayers[i] = playerAddr;
                topScores[i] = score;
                break;
            }
        }

        emit LeaderboardUpdated(topPlayers, topScores);
    }

    // Get player info
    function getPlayer(address addr) external view returns (uint256 highScore, uint256 achievements) {
        Player storage player = players[addr];
        return (player.highScore, player.achievements);
    }

    // Get current top-N leaderboard
    function getTopPlayers() external view returns (address[TOP_N] memory, uint256[TOP_N] memory) {
        return (topPlayers, topScores);
    }
}
