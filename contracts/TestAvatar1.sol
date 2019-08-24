pragma solidity ^0.5.8;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract TestAvatar1 is Ownable {

	using SafeMath for uint;

	mapping(uint => uint) public levelPrice;
	uint public levelPriceCount;

	uint public refLevelLimit = 3;

	struct UserCycleDetails {
		uint level;
		uint refsCount;
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
	 */
	constructor() public {
		// assign price to 4 initial levels
		levelPrice[0] = 0.05 ether;
		levelPrice[1] = 0.15 ether;
		levelPrice[2] = 0.45 ether;
		levelPrice[3] = 1.35 ether;
		levelPriceCount = 4;
		// add contract creator as root/master user (the 1st node a tree)
		_createUser(true, 0);
	}

	//***************
	// Public methods
	//***************

	/**
	 * @dev Buys a new user level. Can be reinvest
	 * @param _level level user wants to buy
	 */
	function buyLevel(uint _level) external payable {
		// validation
		require(users[msg.sender].isInitialized, "buyLevel(): user is not registered");
		require(_level < levelPriceCount, "buyLevel(): _level does not exist");
		require(msg.value == levelPrice[_level], "buyLevel(): level price is not correct");
		// get upliner address
		address payable uplinerAddress = getUplinerAddress(_level);
		// if buying operation is reinvest
		if(isReinvest(_level)) {
			require(isCurrentLevelFull(), "buyLevel(): not all levels are full");
			// create a new cycle with a desired level
			UserCycleDetails memory userCycleDetails;
			userCycleDetails.level = _level;
			users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount] = userCycleDetails;
			users[msg.sender].cycleDetailsCount = users[msg.sender].cycleDetailsCount.add(1);
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
	 * @dev Returns a referrer with free slots
	 * @param _refAddress referrer address to search down the tree
	 * @return referrer address with free slots
	 */
	function getFreeRef(address payable _refAddress) public view returns (address payable) {
		// validation
		require(_refAddress != address(0), "getFreeRef(): _refAddress can not be 0x00");
		require(users[_refAddress].isInitialized, "getFreeRef(): _refAddress is not registered");
		// if ref has free slots then return his address
		if(users[_refAddress].cycleDetails[users[_refAddress].cycleDetailsCount.sub(1)].refsCount < refLevelLimit) {
			return _refAddress;
		}
		// find free ref in children of the provided ref
		uint providedRefCurrentCycle = users[_refAddress].cycleDetailsCount.sub(1);
		address payable[] memory referrals = new address payable[](363);
		// get the 1st 3 refs
		referrals[0] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[0];
        referrals[1] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[1];
        referrals[2] = users[_refAddress].cycleDetails[providedRefCurrentCycle].refs[2];

        address payable freeRefAddress;
        bool freeRefFound = false;
		// for all possible child refs
        for(uint i = 0; i < 363; i++) {
			// if child ref has not free slots
            if(users[referrals[i]].cycleDetails[providedRefCurrentCycle].refsCount == refLevelLimit){
                if(i<120){
					// get refs from the next child node
                    referrals[(i+1)*3] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[0];
                    referrals[(i+1)*3+1] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[1];
                    referrals[(i+1)*3+2] = users[referrals[i]].cycleDetails[providedRefCurrentCycle].refs[2];
                }
            } else {
                freeRefFound = true;
                freeRefAddress = referrals[i];
                break;
            }
        }
        require(freeRefFound, "getFreeRef(): no free referrer");
        return freeRefAddress;
	}

	/**
	 * @dev Returns next uplinder for free referral
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
	 * @dev Returns upliner address for user who wants to buy the desired level
	 * @param _level level user wants to buy
	 * @return upliner address
	 */
	function getUplinerAddress(uint _level) public view returns(address payable) {
		// validation
		require(users[msg.sender].isInitialized, "getUplinerAddress(): user is not registered");
		require(_level < levelPriceCount, "getUplinerAddress(): level does not exist");
		// find the next upliner
		uint currentUserCycle = users[msg.sender].cycleDetailsCount.sub(1);
		uint nextRefId = users[msg.sender].refId;
		uint i = 0;
		bool uplinerFound = false;
		address payable uplinerAddress;
		while(!uplinerFound) {
			// if next user is root then return his address as upliner address
			if(users[userList[nextRefId]].isRoot) {
				uplinerAddress = userList[nextRefId];
				uplinerFound = true;
			}
			// if this is user direct upliner of the needed level
			if(i == _level) {
				// if direct ref has the needed level
				if(users[userList[nextRefId]].cycleDetails[currentUserCycle].level == _level) {
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
	 * @dev Checks whether current user level is full
	 * @return whether current user level is full
	 */
	function isCurrentLevelFull() public view returns (bool) {
		// validation
		require(users[msg.sender].isInitialized, "isCurrentLevelFull(): user is not registered");
		// if user has free slots in his current level then return false
		if(users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].refsCount < refLevelLimit) return false;
		// if user has level 1 without free slots then return false
		uint userCurrentCycle = users[msg.sender].cycleDetailsCount.sub(1);
		uint userCurrentLevel = users[msg.sender].cycleDetails[userCurrentCycle].level;
		if(userCurrentLevel == 0) return false;
		// check whether levels 2/3/4 are full
		uint searchReferralsCount = (refLevelLimit ** (userCurrentLevel.add(1))).add(refLevelLimit);
		address[] memory referrals = new address[](searchReferralsCount);
		// get the 1st 3 refs
		referrals[0] = users[msg.sender].cycleDetails[userCurrentCycle].refs[0];
        referrals[1] = users[msg.sender].cycleDetails[userCurrentCycle].refs[1];
        referrals[2] = users[msg.sender].cycleDetails[userCurrentCycle].refs[2];
		bool isLevelFull = true;
		uint searchReferralLimit = searchReferralsCount.sub(refLevelLimit).div(refLevelLimit);
		// for all possible child refs
        for(uint i = 0; i < searchReferralsCount; i++) {
			// if child ref has not free slots
            if(users[referrals[i]].cycleDetails[userCurrentCycle].refsCount == refLevelLimit) {
                if(i < searchReferralLimit){
					// get refs from the next child node
                    referrals[(i+1)*refLevelLimit] = users[referrals[i]].cycleDetails[userCurrentCycle].refs[0];
                    referrals[(i+1)*refLevelLimit+1] = users[referrals[i]].cycleDetails[userCurrentCycle].refs[1];
                    referrals[(i+1)*refLevelLimit+2] = users[referrals[i]].cycleDetails[userCurrentCycle].refs[2];
                }
            } else {
                isLevelFull = false;
                break;
            }
        }
		return isLevelFull;
	}

	/**
	 * @dev Check whether the operation of buying a new level is reinvest which creates a new cycle
	 * @param _level level user wants to buy
	 * @return whether the buying a new level operation is reinvest
	 */
	function isReinvest(uint _level) public view returns (bool) {
		// validation
		require(users[msg.sender].isInitialized, "isReinvest(): user is not registered");
		require(_level < levelPriceCount, "isReinvest(): level does not exist");
		// check whether the operation is reinvest
		uint userLevel = users[msg.sender].cycleDetails[users[msg.sender].cycleDetailsCount.sub(1)].level;
		// if user with level 2 wants to buy level 1
		if(userLevel == 1 && _level == 0) return true;
		// if user with level 3 wants to buy level 2
		if(userLevel == 2 && _level == 1) return true;
		// if user with level 4 wants to buy level 3
		if(userLevel == 3 && _level == 2) return true;
		// if user with level 4 wants to buy level 4
		if(userLevel == 3 && _level == 3) return true;
		// else it is not reinvest so return false
		return false;
	}

	/**
	 * @dev Registers a new user
	 * @param _refId referrer id
	 */
	function regUser(uint _refId) external payable {
		// validation
		require(_refId < usersCount, "regUser(): _refId does not exist");
		require(!users[msg.sender].isInitialized, "regUser(): user exists");
		require(msg.value == levelPrice[0], "regUser(): incorrect payment sum");
		// create a new user
		_createUser(false, _refId);
		// get free ref address
		address payable freeRefAddress = getFreeRef(userList[_refId]);
		// add new user to ref
		uint providedRefCurrentCycle = users[userList[_refId]].cycleDetailsCount.sub(1);
		UserCycleDetails storage freeRefCycleDetails = users[freeRefAddress].cycleDetails[providedRefCurrentCycle];
		freeRefCycleDetails.refs[freeRefCycleDetails.refsCount] = msg.sender;
		freeRefCycleDetails.refsCount = freeRefCycleDetails.refsCount.add(1);
		// transfer payment to ref
		freeRefAddress.transfer(msg.value);
	}

	//*****************
	// Internal methods
	//*****************

	/**
	 * @dev Creates a new user
	 * @param _isRoot whether is root/master node
	 * @param _refId referrer id of the new user
	 */
	function _createUser(bool _isRoot, uint _refId) internal {
		// create a new user
		User memory user;
		user.isInitialized = true;
		user.isRoot = _isRoot;
		user.id = usersCount;
		user.refId = _refId;
		user.createdAt = now;
		user.cycleDetailsCount = 1;
		// save user
		userList[usersCount] = msg.sender;
		users[msg.sender] = user;
		// update global users count
		usersCount = usersCount.add(1);
	}

}
