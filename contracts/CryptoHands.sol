pragma solidity 0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

// TODO: desc
contract CryptoHands is Ownable {

	using SafeMath for uint;

	struct Level {
		uint price;
		uint maxRefCount;
	}

	mapping(uint => Level) public levels;
	uint public levelsCount;

	struct UserRefs {
		bool isInitialized;
		uint level;
		uint refsCount;
		mapping(uint => address) refs;
	}

	struct User {
		bool isInitialized;
		uint refId;
		uint createdAt;
		uint levelIndexesCount;
		mapping(uint => UserRefs) levelIndexUserRefs;
	}
	mapping(address => User) public users;
	mapping(uint => address payable) public userList;
	uint public usersCount;

	/**
	 * @dev Contract constructor
	 */
	constructor() public {
		// create initial levels
		_createLevel(0.05 ether, 3);
		_createLevel(0.15 ether, 9);
		_createLevel(0.45 ether, 27);
		_createLevel(1.35 ether, 81);
	}

	//***************
	// Public methods
	//***************

	/**
	 * @dev Buys a new level(more users to be invited)
	 * @param _level level to be bought
	 */
	function buyLevel(uint _level) external payable {
		// validation
		require(_level < levelsCount, "buyLevel(): level does not exist");
		require(users[msg.sender].isInitialized, "buyLevel(): user is not registered");
		// TODO: validate that user can buy this level(order is maintained)
		// TODO: validate payment sum
		// TODO: find upliner address
		// add user refs for new level
		UserRefs memory userRefs;
		userRefs.isInitialized = true;
		userRefs.level = _level;
		users[msg.sender].levelIndexUserRefs[users[msg.sender].levelIndexesCount] = userRefs;
		users[msg.sender].levelIndexesCount = users[msg.sender].levelIndexesCount.add(1);
		// transfer ether to upliner
		// TODO: update to found upliner not existing
		userList[users[msg.sender].refId].transfer(msg.value);
	}

	/**
	 * @dev Registers a new user
	 * @param _refId referrer id
	 */
	function regUser(uint _refId) external payable {
		// validation
		require(_refId < usersCount, "regUser(): _refId does not exist");
		require(!users[msg.sender].isInitialized, "regUser(): user already registered");
		require(levels[users[userList[_refId]].levelIndexUserRefs[users[userList[_refId]].levelIndexesCount].level].price == msg.value, "regUser(): invalid level price");
		// create user
		User memory user;
		user.isInitialized = true;
		user.refId = _refId;
		user.createdAt = now;
		users[msg.sender] = user;
		userList[usersCount] = msg.sender;
		// initialize empty user refs
		users[msg.sender].levelIndexUserRefs[user.levelIndexesCount].isInitialized = true;
		// increment user count
		usersCount = usersCount.add(1);

		// TODO: find ref with available slot
		
		// add user to ref
		UserRefs storage targetUserRefs = users[userList[_refId]].levelIndexUserRefs[users[userList[_refId]].levelIndexesCount]; 
		targetUserRefs.refs[targetUserRefs.refsCount] = msg.sender;
		targetUserRefs.refsCount = targetUserRefs.refsCount.add(1);
		// transfer payment to target
		userList[_refId].transfer(msg.value);
	}

	//*****************
	// Internal methods
	//*****************

	/**
	 * @dev Creates a new price level
	 * @param _price price in wei that user should pay to buy a level
	 * @param _maxRefCount max number of referrals per level
	 */
	function _createLevel(uint _price, uint _maxRefCount) private {
		// validation
		require(_price > 0, "_createLevel(): price can not be 0");
		require(_maxRefCount > 0, "_createLevel(): maxRefCount can not be 0");
		// create level
		Level memory level;
		level.price = _price;
		level.maxRefCount = _maxRefCount;
		levels[levelsCount] = level;
		levelsCount = levelsCount.add(1);
	}

}
