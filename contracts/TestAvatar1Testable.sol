pragma solidity ^0.5.8;

import "./TestAvatar1.sol";

contract TestAvatar1Testable is TestAvatar1 {

	constructor(address payable _rootAddress) public TestAvatar1(_rootAddress) {}

	// NOTICE: we just copy/paste the fallback method because it can not be inherited	
	function() external payable {
		// find the level to which the sent amount of ETH corresponds
		uint level;
		bool levelFound = false;
		for(uint i = 0; i < levelPriceCount; i++) {
			if(levelPrice[i] == msg.value) {
				level = i;
				levelFound = true;
			}
		}
		require(levelFound, "default(): level not found");
		// if user exists then buy level
		if(users[msg.sender].isInitialized) {
			buyLevel(level);
		} else {
			// new user, register him
			regUser(users[_bytesToAddress(msg.data)].id);
		}
	}

	function createUser(address payable _userAddress, bool _isRoot, uint _refId) external {
		_createUser(_userAddress, _isRoot, _refId);
	}

	function getFreeRef(address payable _refAddress, uint _depthLevel) external view returns (address payable) {
		return _getFreeRef(_refAddress, _depthLevel);
	}

	function getUplinerAddress(uint _level) external view returns(address payable) {
		return _getUplinerAddress(_level);
	}

	function isReinvest(uint _level) external view returns (bool) {
		return _isReinvest(_level);
	}

}
