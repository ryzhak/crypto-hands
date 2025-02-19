
// File: @openzeppelin\contracts\math\SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}

// File: @openzeppelin\contracts\ownership\Ownable.sol

pragma solidity ^0.5.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be aplied to your functions to restrict their use to
 * the owner.
 */
contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * > Note: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts\TestAvatar1.sol

pragma solidity ^0.5.8;



contract TestAvatar1 is Ownable {

	using SafeMath for uint;

	mapping(uint => uint) public levelPrice;
	uint public levelPriceCount;

	uint public refLevelLimit = 3;

	struct UserCycleDetails {
		uint level;
		uint totalRefsCount; // total refs count on all levels
		uint refsCount; // refs count of the "refs" mapping
		mapping(uint => address payable) refs;
	}

	struct User {
		bool isInitialized;
		bool isRoot;
		uint id;
		uint refId;
		uint createdAt;
		uint cycleDetailsCount;
		mapping(uint => UserCycleDetails) cycleDetails;
	}

	mapping(address => User) public users;
	mapping(uint => address payable) public userList;
	uint public usersCount;

	/**
	 * @dev Contract constructor
	 * @param _rootAddress master/root address of the 1st tree node
	 */
	constructor(address payable _rootAddress) public {
		// validation
		require(_rootAddress != address(0), "constructor(): _rootAddress can not be 0x00");
		// assign price to 4 initial levels
		levelPrice[0] = 0.05 ether;
		levelPrice[1] = 0.15 ether;
		levelPrice[2] = 0.45 ether;
		levelPrice[3] = 1.35 ether;
		levelPriceCount = 4;
		// add contract creator as root/master user (the 1st node a tree)
		_createUser(_rootAddress, true, 0);
	}

	//***************
	// Public methods
	//***************

	/**
	 * @dev Default payable methods which registers a new user or buys level
	 * On new user register you should pass ref address in msg.data
	 */
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

	/**
	 * @dev Buys a new user level. Can be reinvest
	 * @param _level level user wants to buy
	 */
	function buyLevel(uint _level) public payable {
		// validation
		require(users[msg.sender].isInitialized, "buyLevel(): user is not registered");
		require(_level < levelPriceCount, "buyLevel(): _level does not exist");
		require(msg.value == levelPrice[_level], "buyLevel(): level price is not correct");
		// get upliner address
		address payable uplinerAddress = _getUplinerAddress(_level);
		// if buying operation is reinvest
		if(_isReinvest(_level)) {
			// check that current user level is full
			require(_isCurrentLevelFull(), "buyLevel(): not all levels are full");
			// create a new cycle with a desired level
			UserCycleDetails memory userCycleDetails;
			userCycleDetails.level = _level;
			users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount] = userCycleDetails;
			users[msg.sender].cycleDetailsCount = users[msg.sender].cycleDetailsCount.add(1);
			// refresh upliner address because we increased user cycle
			uplinerAddress = _getUplinerAddress(_level);
		} else {
			uint currentUserLevel = users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level;
			require(currentUserLevel.add(1) == _level, "buyLevel(): can not buy this level");
			// increase user level
			users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level = users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level.add(1);
		}
		// send money to upliner
		uplinerAddress.transfer(msg.value);
	}

	/**
	 * @dev Returns next upliner for free referral
	 * @return next upliner ref id
	 */
	function getNextUpliner() external view returns (uint) {
		uint maxCyclesCount = users[userList[0]].cycleDetailsCount;
		// try to find upliner with free slots in the cycle #1
		for(uint i = 0; i < usersCount; i++) {
			// if upliner has free slots then return his ref id
			if(users[userList[i]].cycleDetails[0].refsCount < refLevelLimit) {
				return i;
			}
			// if upliner cycle number is greater then max then increase max
			if(users[userList[i]].cycleDetailsCount > maxCyclesCount) {
				maxCyclesCount = users[userList[i]].cycleDetailsCount;
			}
		}
		// next upliner is not found in cycle #1 so find upliner in all other cycles
		for(uint i = 2; i < maxCyclesCount; i++) {
			for(uint j = 0; j < usersCount; j++) {
				// if upliner has current cycle number
				if(users[userList[j]].cycleDetailsCount == i) {
					// if upliner has free slots then return his ref id
					if(users[userList[j]].cycleDetails[i.sub(1)].refsCount < refLevelLimit) {
						return j;
					}
				}
			}
		}
	}

	/**
	 * @dev Returns user details for particular cycle
	 * @param _userAddress user address
	 * @param _cycleIndex cycle index
	 * @return user level, direct refs count and total refs count for a particular cycle
	 */
	function getUserCycleDetails(address _userAddress, uint _cycleIndex) external view returns(uint level, uint refsCount, uint totalRefsCount) {
		// validation
		require(_userAddress != address(0), "getUserCycleDetails(): user address can not be 0x00");
		require(users[_userAddress].isInitialized, "getUserCycleDetails(): user does not exist");
		require(_cycleIndex < users[_userAddress].cycleDetailsCount, "getUserCycleDetails(): _cycleIndex does not exist");
		// return user cycle details
		return (
			users[_userAddress].cycleDetails[_cycleIndex].level,
			users[_userAddress].cycleDetails[_cycleIndex].refsCount,
			users[_userAddress].cycleDetails[_cycleIndex].totalRefsCount
		);
	}

	/**
	 * @dev Registers a new user
	 * @param _refId referrer id
	 */
	function regUser(uint _refId) public payable {
		// validation
		require(_refId < usersCount, "regUser(): _refId does not exist");
		require(!users[msg.sender].isInitialized, "regUser(): user exists");
		require(msg.value == levelPrice[0], "regUser(): incorrect payment sum");
		// get free ref address
		address payable freeRefAddress = _getFreeRef(userList[_refId], levelPriceCount.sub(1));
		require(freeRefAddress != address(0), "regUser(): no referrer with free slots");
		// create a new user
		_createUser(msg.sender, false, _refId);
		// add new user to ref
		uint providedRefCurrentCycle = users[userList[_refId]].cycleDetailsCount.sub(1);
		UserCycleDetails storage freeRefCycleDetails = users[freeRefAddress].cycleDetails[providedRefCurrentCycle];
		freeRefCycleDetails.refs[freeRefCycleDetails.refsCount] = msg.sender;
		freeRefCycleDetails.refsCount = freeRefCycleDetails.refsCount.add(1);
		// increase total refs count
		_increaseTotalRefsCount(freeRefAddress);
		// transfer payment to ref
		freeRefAddress.transfer(msg.value);
	}

	//*****************
	// Internal methods
	//*****************

	/**
	 * @dev Converts bytes to ethereum address
	 * @param _bys bytes to convert to ethereum address
	 * @return ethereum address
	 */
	function _bytesToAddress(bytes memory _bys) internal pure returns (address  addr ) {
        assembly {
            addr := mload(add(_bys, 20))
        }
    }

	/**
	 * @dev Creates a new user
	 * @param _userAddress new user address
	 * @param _isRoot whether is root/master node
	 * @param _refId referrer id of the new user
	 */
	function _createUser(address payable _userAddress, bool _isRoot, uint _refId) internal {
		// create a new user
		User memory user;
		user.isInitialized = true;
		user.isRoot = _isRoot;
		user.id = usersCount;
		user.refId = _refId;
		user.createdAt = now;
		user.cycleDetailsCount = 1;
		// save user
		userList[usersCount] = _userAddress;
		users[_userAddress] = user;
		// update global users count
		usersCount = usersCount.add(1);
	}

	/**
	 * @dev Returns a referrer with free slots, searches down the tree
	 * @param _refAddress referrer address to search down the tree
	 * @param _depthLevel how many levels deep down the tree to search for ref with free slots
	 * @return referrer address with free slots, if referrer was not found then returns 0x00 address
	 */
	function _getFreeRef(address payable _refAddress, uint _depthLevel) internal view returns (address payable) {
		// validation
		require(_refAddress != address(0), "getFreeRef(): _refAddress can not be 0x00");
		require(users[_refAddress].isInitialized, "getFreeRef(): _refAddress is not registered");
		require(_depthLevel < levelPriceCount, "getFreeRef(): _depthLevel is too big");
		// if ref has free slots then return his address
		if(users[_refAddress].cycleDetails[users[_refAddress].cycleDetailsCount.sub(1)].refsCount < refLevelLimit) {
			return _refAddress;
		}
		// ref has not free slots then if depth level is 1 then return 0x00 address
		if(_depthLevel == 0) return address(0);
		// find maximum number of referrals and number of referrals on last-1 level
		// we need last-1 count in order not to add referrals of the last level referrals
		uint lastLevelRefsCount = 3;
		uint prevLastLevelRefsCount = 0;
		for(uint i = 2; i < _depthLevel + 2; i++) {
			prevLastLevelRefsCount = lastLevelRefsCount;
			lastLevelRefsCount = lastLevelRefsCount.add(refLevelLimit**i);
		}
		address payable[] memory referrals = new address payable[](lastLevelRefsCount);
		uint providedRefCurrentCycle = users[_refAddress].cycleDetailsCount.sub(1);
		// get the 1st 3 refs
		referrals[0] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[0];
        referrals[1] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[1];
        referrals[2] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[2];
		// set free ref address to 0x00
        address payable freeRefAddress = address(0);
		// for all possible child refs
        for(uint i = 0; i < lastLevelRefsCount; i++) {
			// if child ref has not free slots
            if(users[referrals[i]].cycleDetails[providedRefCurrentCycle].refsCount == refLevelLimit){
				// do not add nodes of children with last level
                if(i < prevLastLevelRefsCount) {
					// get refs from the next child node
                    referrals[(i+1)*3] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[0];
                    referrals[(i+1)*3+1] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[1];
                    referrals[(i+1)*3+2] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[2];
                }
            } else {
                freeRefAddress = referrals[i];
                break;
            }
        }
        return freeRefAddress;
	}

	/**
	 * @dev Returns upliner address for user who wants to buy the desired level, finds the upliner up the tree
	 * @param _level level user wants to buy
	 * @return upliner address
	 */
	function _getUplinerAddress(uint _level) internal view returns(address payable) {
		// validation
		require(users[msg.sender].isInitialized, "getUplinerAddress(): user is not registered");
		require(_level < levelPriceCount, "getUplinerAddress(): level does not exist");
		// find the next upliner
		uint currentUserCycle = users[msg.sender].cycleDetailsCount.sub(1);
		uint nextRefId = users[msg.sender].refId;
		uint i = 1;
		bool uplinerFound = false;
		address payable uplinerAddress;
		while(!uplinerFound) {
			// if next user is root then return his address as upliner address
			if(users[userList[nextRefId]].isRoot) {
				uplinerAddress = userList[nextRefId];
				uplinerFound = true;
			}
			// if this is user direct upliner of the needed level
			if(i.mod(_level.add(1)) == 0) {
				// if direct ref has the needed cycle and level
				if(users[userList[nextRefId]].cycleDetailsCount >= users[msg.sender].cycleDetailsCount && users[userList[nextRefId]].cycleDetails[currentUserCycle].level == _level) {
					uplinerAddress = userList[nextRefId];
					uplinerFound = true;
				}
			}
			nextRefId = users[userList[nextRefId]].refId;
			i = i.add(1);
		}
		return uplinerAddress;
	}

	/**
	 * @dev Increases total refs count up the tree(for "levelPriceCount" levels)
	 * @param _refAddress 1st ref address up the tree
	 */
	function _increaseTotalRefsCount(address _refAddress) internal {
		// validation
		require(_refAddress != address(0), "_increaseTotalRefsCount(): _refAddress can not be 0x00");
		require(users[_refAddress].isInitialized, "_increaseTotalRefsCount(): ref should be initialized");
		// increase total ref counts up the tree
		uint firstRefCurrentCycle = users[_refAddress].cycleDetailsCount.sub(1);
		uint nextRefId = users[_refAddress].id;
		uint i = 0;
		while(i < levelPriceCount) {
			// increase total refs count
			users[userList[nextRefId]].cycleDetails[firstRefCurrentCycle].totalRefsCount = users[userList[nextRefId]].cycleDetails[firstRefCurrentCycle].totalRefsCount.add(1);
			// if user is root then break
			if(users[userList[nextRefId]].isRoot) break;
			// prepare next cycle
			nextRefId = users[userList[nextRefId]].refId;
			i = i.add(1);
		}
	}

	/**
	 * @dev Checks whether current user level is full
	 * @return whether current user level is full
	 */
	function _isCurrentLevelFull() internal view returns (bool) {
		// validation
		require(users[msg.sender].isInitialized, "_isCurrentLevelFull(): user is not initialized");
		// check that current user level is full
		uint maxUserCountForLevel = 0;
		for(uint i = 1; i < users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level.add(2); i++) {
			maxUserCountForLevel = maxUserCountForLevel.add(refLevelLimit**i);
		}
		return users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].totalRefsCount >= maxUserCountForLevel;
	}

	/**
	 * @dev Check whether the operation of buying a new level is reinvest which creates a new cycle
	 * @param _level level user wants to buy
	 * @return whether the buying a new level operation is reinvest
	 */
	function _isReinvest(uint _level) internal view returns (bool) {
		// validation
		require(users[msg.sender].isInitialized, "isReinvest(): user is not registered");
		require(_level < levelPriceCount, "isReinvest(): level does not exist");
		// check whether the operation is reinvest
		uint userLevel = users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level;
		// if user wants to buy the previous level or user with last level wants to buy the last level one more time
		// then this is reinvest
		return userLevel == _level.add(1) || userLevel == levelPriceCount.sub(1) && _level == levelPriceCount.sub(1);
	}

}
