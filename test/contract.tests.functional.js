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

	let contract;

	beforeEach(async() => {
		contract = await ContractArtifact.new(rootAddress, {from: ownerAddress}).should.be.fulfilled;
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