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

const ROOT_REF_ID = 0;

contract("Contract: functional", (accounts) => {

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
	const userAddress23 = accounts[24];

	let contract;

	beforeEach(async() => {
		contract = await ContractArtifact.new(rootAddress, {from: ownerAddress}).should.be.fulfilled;
	});

	describe("buyLevel()", () => {
        it("should reinvest on scenario: root => A(C:1,L:1) => B(C:1,L:2) when user B reinvests", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
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
			// user 2 makes reinvest
			const rootBalanceBefore = await web3.eth.getBalance(rootAddress);
			const user1BalanceBefore = await web3.eth.getBalance(userAddress1);
			await contract.buyLevel(LEVEL_1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const rootBalanceAfter = await web3.eth.getBalance(rootAddress);
			const user1BalanceAfter = await web3.eth.getBalance(userAddress1);
			assert.equal(rootBalanceAfter - rootBalanceBefore, PRICE_LEVEL_1);
			assert.equal(user1BalanceBefore, user1BalanceAfter);
		});

		it("should reinvest on scenario: root => A(C:2,L:1) => B(C:1,L:2) when user B reinvests", async() => {
			// user1 registers and buys level 2
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			// fill 2 levels for user1
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress5, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress6, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress7, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress8, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress9, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress10, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress11, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress12, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress13, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// user1 reinvests
			await contract.buyLevel(LEVEL_1, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// user2 buys level 2
			await contract.buyLevel(LEVEL_2, {from: userAddress2, value: PRICE_LEVEL_2}).should.be.fulfilled;
			// fill 2 levels for user2
			await contract.regUser(5, {from: userAddress15, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(5, {from: userAddress16, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(5, {from: userAddress17, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(6, {from: userAddress18, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(6, {from: userAddress19, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(6, {from: userAddress20, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(7, {from: userAddress21, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(7, {from: userAddress22, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(7, {from: userAddress23, value: PRICE_LEVEL_1}).should.be.fulfilled;
			// user2 reinvests
			const rootBalanceBefore = await web3.eth.getBalance(rootAddress);
			const user1BalanceBefore = await web3.eth.getBalance(userAddress1);
			await contract.buyLevel(LEVEL_1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const rootBalanceAfter = await web3.eth.getBalance(rootAddress);
			const user1BalanceAfter = await web3.eth.getBalance(userAddress1);
			assert.equal(user1BalanceAfter - user1BalanceBefore, PRICE_LEVEL_1);
			assert.equal(rootBalanceBefore, rootBalanceAfter);
		});
	});

	describe("getUplinerAddress()", () => {
        it("should return upliner address on tree: root => A(1) => B(1) for user B", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_1, {from: userAddress2}).should.be.fulfilled;
			assert.equal(uplinerAddress, userAddress1);
		});

		it("should return upliner address on tree: root => A(1) => B(2) for user B", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress2, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_2, {from: userAddress2}).should.be.fulfilled;
			assert.equal(uplinerAddress, rootAddress);
		});

		it("should return upliner address on tree: root => A(1) => B(2) => C(1) => D(2) for user D", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress2, value: PRICE_LEVEL_2}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress4, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_2, {from: userAddress4}).should.be.fulfilled;
			assert.equal(uplinerAddress, userAddress2);
		});

		it("should return upliner address on tree: root => A(1) => B(1) => C(1) => D(2) for user D", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress4, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_2, {from: userAddress4}).should.be.fulfilled;
			assert.equal(uplinerAddress, rootAddress);
		});

		it("should return upliner address on tree: root => A(2) => B(1) => C(1) => D(1) => E(2) for user E", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress1, value: PRICE_LEVEL_2}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress5, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress5, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_2, {from: userAddress5}).should.be.fulfilled;
			assert.equal(uplinerAddress, userAddress1);
		});

		it("should return upliner address on tree: root => A(1) => B(1) => C(1) => D(1) => E(2) for user E", async() => {
			await contract.regUser(ROOT_REF_ID, {from: userAddress1, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(1, {from: userAddress2, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(2, {from: userAddress3, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(3, {from: userAddress4, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.regUser(4, {from: userAddress5, value: PRICE_LEVEL_1}).should.be.fulfilled;
			await contract.buyLevel(LEVEL_2, {from: userAddress5, value: PRICE_LEVEL_2}).should.be.fulfilled;
			const uplinerAddress = await contract.getUplinerAddress(LEVEL_2, {from: userAddress5}).should.be.fulfilled;
			assert.equal(uplinerAddress, rootAddress);
		});
	});

});