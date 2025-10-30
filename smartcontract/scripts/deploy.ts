import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("LightningArcade", (m) => {
  // Deploy GameManager
  const gameManager = m.contract("GameManager");

  // Deploy LightningArcadeRewards
  const rewards = m.contract("LightningArcadeRewards");

  // Deploy Tournament
  const tournament = m.contract("Tournament");

  return { gameManager, rewards, tournament };
});

export default DeployModule;