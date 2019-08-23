require('chai').use(require('chai-as-promised')).should();

const CryptoHands = artifacts.require("CryptoHands");

const LEVEL_1 = 0;
const LEVEL_2 = 1;
const LEVEL_3 = 2;
const LEVEL_4 = 3;

const PRICE_LEVEL_1 = web3.utils.toWei("0.05");
const PRICE_LEVEL_2 = web3.utils.toWei("0.15");
const PRICE_LEVEL_3 = web3.utils.toWei("0.45");
const PRICE_LEVEL_4 = web3.utils.toWei("1.35");

const ROOT_REF_ID = 0;

contract("CryptoHands", (accounts) => {

	const ownerAddress = accounts[0];
	const userAddress = accounts[1];

	let cryptoHands;

	beforeEach(async() => {
		cryptoHands = await CryptoHands.new().should.be.fulfilled;
	});
	
	describe("buyLevel()", () => {
        it("should revert if user is not registered", async() => {
			await cryptoHands.buyLevel(LEVEL_1, {from: userAddress}).should.be.rejectedWith("revert");
		});
		
		it("should buy a new level", async() => {
			await cryptoHands.regUser(ROOT_REF_ID, {from: userAddress, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await cryptoHands.buyLevel(LEVEL_2, {from: userAddress, value: PRICE_LEVEL_2}).should.be.fulfilled;
        });
    });

	describe("constructor()", () => {
        it("should set contract properties", async() => {
			assert.equal(await cryptoHands.levelPrice(0), PRICE_LEVEL_1);
			assert.equal(await cryptoHands.levelPrice(1), PRICE_LEVEL_2);
			assert.equal(await cryptoHands.levelPrice(2), PRICE_LEVEL_3);
			assert.equal(await cryptoHands.levelPrice(3), PRICE_LEVEL_4);
            assert.equal(await cryptoHands.levelPriceCount(), 4);
        });
	});

	describe("getFreeRef()", () => {
        it("should revert if ref is not registered", async() => {
			await cryptoHands.getFreeRef(userAddress, {from: userAddress}).should.be.rejectedWith("revert");
		});
		
		it("should return ref address with free slots", async() => {
			const freeRefAddress = await cryptoHands.getFreeRef(ownerAddress, {from: userAddress}).should.be.fulfilled;
			assert.equal(freeRefAddress, ownerAddress);
        });
    });

	describe("getNextUpliner()", () => {
		it("should return the next upliner id", async() => {
			const uplinerId = await cryptoHands.getNextUpliner({from: userAddress}).should.be.fulfilled;
			assert.equal(uplinerId, ROOT_REF_ID);
        });
    });

	describe("getUplinerAddress()", () => {
        it("should revert if user is not registered", async() => {
			await cryptoHands.getUplinerAddress(LEVEL_1, {from: userAddress}).should.be.rejectedWith("revert");
		});
		
		it("should return upliner address", async() => {
			await cryptoHands.regUser(ROOT_REF_ID, {from: userAddress, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const uplinerAddress = await cryptoHands.getUplinerAddress(LEVEL_1, {from: userAddress}).should.be.fulfilled;
			assert.equal(uplinerAddress, ownerAddress);
        });
    });

	describe("isCurrentLevelFull()", () => {
        it("should revert if user is not registered", async() => {
			await cryptoHands.isCurrentLevelFull({from: userAddress}).should.be.rejectedWith("revert");
		});
		
		it("should return false if current user level is not full", async() => {
			await cryptoHands.regUser(ROOT_REF_ID, {from: userAddress, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const isCurrentLevelFull = await cryptoHands.isCurrentLevelFull({from: userAddress}).should.be.fulfilled;
			assert.equal(isCurrentLevelFull, false);
        });
    });

	describe("isReinvest()", () => {
        it("should revert if user is not registered", async() => {
			await cryptoHands.isReinvest(LEVEL_2, {from: userAddress}).should.be.rejectedWith("revert");
		});
		
		it("should return false if buying is not reinvest", async() => {
			await cryptoHands.regUser(ROOT_REF_ID, {from: userAddress, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const isReinvest = await cryptoHands.isReinvest(LEVEL_2, {from: userAddress}).should.be.fulfilled;
			assert.equal(isReinvest, false);
        });
    });
	
	describe("regUser()", () => {
        it("should revert if refId does not exist", async() => {
			const invalidRefId = 1;
			await cryptoHands.regUser(invalidRefId, {from: userAddress, value: PRICE_LEVEL_1}).should.be.rejectedWith("revert");
		});
		
		it("should register a new user", async() => {
			await cryptoHands.regUser(ROOT_REF_ID, {from: userAddress, value: PRICE_LEVEL_1}).should.be.fulfilled;
        });
    });
});
