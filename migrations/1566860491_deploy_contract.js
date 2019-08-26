const ContractArtifact = artifacts.require("./TestAvatar1.sol");
const config = require("../config");

module.exports = function(deployer) {
  deployer.deploy(ContractArtifact, config.ROOT_ADDRESS);
};
