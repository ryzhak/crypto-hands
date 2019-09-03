require('chai').use(require('chai-as-promised')).should();

const ContractArtifact = artifacts.require("TestAvatar1Testable");

const LEVEL_1 = 0;
const LEVEL_2 = 1;
const LEVEL_3 = 2;
const LEVEL_4 = 3;

const PRICE_LEVEL_1 = web3.utils.toWei("0.05");
const PRICE_LEVEL_2 = web3.utils.toWei("0.15");
const PRICE_LEVEL_3 = web3.utils.toWei("0.45");
const PRICE_LEVEL_4 = web3.utils.toWei("1.35");

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
const ROOT_REF_ID = 0;

contract("Contract: unit", (accounts) => {

	const ownerAddress = accounts[0];
	const rootAddress = accounts[1];
	const userAddress1 = accounts[2];
	const userAddress2 = accounts[3];
	const userAddress3 = accounts[4];
	const userAddress4 = accounts[5];
	const userAddress5 = accounts[6];
	const userAddress6 = accounts[7];
	const userAddress7 = accounts[8];
	const userAddress8 = accounts[9];
	const userAddress9 = accounts[10];
	const userAddress10 = accounts[11];
	const userAddress11 = accounts[12];
	const userAddress12 = accounts[13];
	const userAddress13 = accounts[14];
	const userAddress14 = accounts[15];
	const userAddress15 = accounts[16];
	const userAddress16 = accounts[17];
	const userAddress17 = accounts[18];
	const userAddress18 = accounts[19];
	const userAddress19 = accounts[20];
	const userAddress20 = accounts[21];
	const userAddress21 = accounts[22];
	const userAddress22 = accounts[23];

	let contract;

	beforeEach(async() => {
		contract = await ContractArtifact.new(rootAddress, {from: ownerAddress}).should.be.fulfilled;
	});
	
	describe("buyLevel()", () => {
        it("should revert if user is not registered", async() => {
			await contract.buyLevel(LEVEL_1, {from: userAddress1}).should.be.rejectedWith("revert");
		});

		it("should revert if level does not exist", async() => {
			const invalidLevel = 4;
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(invalidLevel, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.rejectedWith("revert");
		});

		it("should revert if level price is not valid", async() => {
			const invalidPrice = web3.utils.toWei("0.01");
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: invalidPrice}).should.be.rejectedWith("revert");
		});

		it("should revert on reinvest of current user level is not full", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_1, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.rejectedWith("revert");
		});
		
		it("should buy a new level", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
        });
    });

	describe("constructor()", () => {
		it("should revert if root address is 0x00", async() => {
			await ContractArtifact.new(EMPTY_ADDRESS, {from: ownerAddress}).should.be.rejectedWith("revert");
        });

        it("should set contract properties", async() => {
			assert.equal(await contract.levelPrice(0), PRICE_LEVEL_1);
			assert.equal(await contract.levelPrice(1), PRICE_LEVEL_2);
			assert.equal(await contract.levelPrice(2), PRICE_LEVEL_3);
			assert.equal(await contract.levelPrice(3), PRICE_LEVEL_4);
            assert.equal(await contract.levelPriceCount(), 4);
        });
	});

	describe("default()", () => {
		it("should revert if corresponding level is not found", async() => {
			const invalidLevelPrice = web3.utils.toWei("0.01");
			await contract.send(invalidLevelPrice, {from: userAddress1}).should.be.rejectedWith("revert");
		});
		
		it("should register a new user", async() => {
			await contract.sendTransaction({from: userAddress1, value: PRICE_LEVEL_1, data: rootAddress}).should.be.fulfilled;
			await contract.sendTransaction({from: userAddress2, value: PRICE_LEVEL_1, data: userAddress1}).should.be.fulfilled;
			const user1 = await contract.users(userAddress1);
			const user2 = await contract.users(userAddress2);
			assert.equal(user2.refId.toNumber(), user1.id.toNumber());
		});
		
		it("should buy a new level for registered user", async() => {
			// register a new user
			await contract.sendTransaction({from: userAddress1, value: PRICE_LEVEL_1, data: rootAddress}).should.be.fulfilled;
			// buy level 2 for newly registered user
			await contract.send(PRICE_LEVEL_2, {from: userAddress1}).should.be.fulfilled;
        });
	});

	describe("getFreeRef()", () => {
        it("should revert if ref is not registered", async() => {
			await contract.getFreeRef(userAddress1, LEVEL_4, {from: userAddress1}).should.be.rejectedWith("revert");
		});
		
		it("should return ref address with free slots", async() => {
			const freeRefAddress = await contract.getFreeRef(rootAddress, LEVEL_4, {from: userAddress1}).should.be.fulfilled;
			assert.equal(freeRefAddress, rootAddress);
        });
    });

	describe("getNextUpliner()", () => {
		it("should return the next upliner id", async() => {
			const uplinerId = await contract.getNextUpliner({from: userAddress1}).should.be.fulfilled;
			assert.equal(uplinerId, ROOT_REF_ID);
        });
    });

	describe("getUplinerAddress()", () => {
        it("should revert if user is not registered", async() => {
			await contract.getUplinerAddress(LEVEL_1, {from: userAddress1}).should.be.rejectedWith("revert");
		});

		it("should revert if level does not exist", async() => {
			const invalidLevel = 4;
			await contract.getUplinerAddress(invalidLevel, {from: userAddress1}).should.be.rejectedWith("revert");
		});
		
		it("should return root address", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_1, {from: userAddress1}).should.be.fulfilled;
			assert.equal(uplinerAddress, rootAddress);
		});
		
		it("should return user address of the desired level", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_1, {from: userAddress2}).should.be.fulfilled;
			assert.equal(uplinerAddress, userAddress1);
		});
		
		it("should return user address of the desired level on the same cycle", async() => {
			// reg 2 users
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// buy level 2 for 2 users
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress2, value: PRICE_LEVEL_2}).should.be.fulfilled;
			// fill 2 levels for user2
			await contract.regUser(2, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress5, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress6, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress7, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress8, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress9, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress10, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress11, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(5, {from: userAddress12, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(5, {from: userAddress13, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(5, {from: userAddress14, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// user2 makes reinvest
			await contract.buyLevel(LEVEL_1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			let uplinerAddress = await contract.getUplinerAddress(0, {from: userAddress2}).should.be.fulfilled;
			assert.equal(uplinerAddress, rootAddress);
			// fill 2 levels for user1
			await contract.regUser(1, {from: userAddress15, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress16, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(15, {from: userAddress17, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(15, {from: userAddress18, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(15, {from: userAddress19, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(16, {from: userAddress20, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(16, {from: userAddress21, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(16, {from: userAddress22, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// user1 makes reinvest
			await contract.buyLevel(LEVEL_1, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			uplinerAddress = await contract.getUplinerAddress(0, {from: userAddress2}).should.be.fulfilled;
			assert.equal(uplinerAddress, userAddress1);
		});
    });

	describe("isReinvest()", () => {
        it("should revert if user is not registered", async() => {
			await contract.isReinvest(LEVEL_2, {from: userAddress1}).should.be.rejectedWith("revert");
		});

		it("should revert if level does not exist", async() => {
			const invalidLevel = 4;
			await contract.isReinvest(invalidLevel, {from: userAddress1}).should.be.rejectedWith("revert");
		});

		it("should return true if user wants to buy the previous level", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const isReinvest = await contract.isReinvest(LEVEL_1, {from: userAddress1}).should.be.fulfilled;
			assert.equal(isReinvest, true);
		});

		it("should return true if user on the last level wants to buy last level", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_3, {from: userAddress1, value: PRICE_LEVEL_3}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_4, {from: userAddress1, value: PRICE_LEVEL_4}).should.be.fulfilled;
			const isReinvest = await contract.isReinvest(LEVEL_4, {from: userAddress1}).should.be.fulfilled;
			assert.equal(isReinvest, true);
		});
		
		it("should return false if buying is not reinvest", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const isReinvest = await contract.isReinvest(LEVEL_2, {from: userAddress1}).should.be.fulfilled;
			assert.equal(isReinvest, false);
        });
    });
	
	describe("regUser()", () => {
        it("should revert if refId does not exist", async() => {
			const invalidRefId = 1;
			await contract.regUser(invalidRefId, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.rejectedWith("revert");
		});
		
		it("should register a new user", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
        });
    });
});
