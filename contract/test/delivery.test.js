const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Delivery", function () {
    const ORDER_PRICE = ethers.parseEther("100");

    describe("Order", function() {
        it ("should be executed requestOrder successfully with valid signature", async function() {
            const [admin, manager, client1, stranger] = await ethers.getSigners();
            const { delivery, wemixDollar } = await loadFixture(deployContracts);

            const orderId = 1;
            // 서명 만료 시간
            const signatureExpiration = Math.floor(Date.now() / 1000) + 1000;

            // manager 서명
            const signature = await getRequestOrderSignature(delivery, client1.address, orderId, signatureExpiration, manager);

            await wemixDollar.connect(client1).approve(delivery.target, ORDER_PRICE);

            // client 주문 요청
            await delivery.connect(client1).requestOrder(orderId, ORDER_PRICE, manager.address, signature, signatureExpiration);

            // 주문 정보 확인
            const order = await delivery.getOrder(orderId);
            expect(order.client).to.equal(client1.address);
            expect(order.deliverer).to.equal(ethers.ZeroAddress);
            expect(order.price).to.equal(ORDER_PRICE);
            expect(order.status).to.equal(1);
            expect(order.requestTime).to.not.equal(0);
            expect(order.acceptTime).to.equal(0);
            expect(order.completeTime).to.equal(0);
            expect(order.cancelTime).to.equal(0);
        })

        it ("should be executed requestOrder failed with invalid signature", async function() {
            const [admin, manager, client1, stranger] = await ethers.getSigners();
            const { delivery, wemixDollar } = await loadFixture(deployContracts);

            const orderId = 1;
            // 서명 만료 시간
            const signatureExpiration = Math.floor(Date.now() / 1000) + 1000;

            // stranger 서명
            const signature = await getRequestOrderSignature(delivery, client1.address, orderId, signatureExpiration, stranger);

            await wemixDollar.connect(client1).approve(delivery.target, ORDER_PRICE);

            // client 주문 요청 실패
            await expect(delivery.connect(client1).requestOrder(orderId, ORDER_PRICE, manager.address, signature, signatureExpiration))
                .to.be.revertedWithCustomError(delivery, "InvalidSignature");
        })
    })

});

const deployContracts = async () => {
    const INITIAL_WEMIX_DOLLAR_AMOUNT = ethers.parseEther("10000");
    const INITIAL_FEE_RATE = 100;
    const INITIAL_MIN_ORDER_PRICE = ethers.parseEther("100");
    const INITIAL_STAKING_AMOUNT = ethers.parseEther("1000");
    const INITIAL_DELIVERY_REWARD = ethers.parseEther("10");

    const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();

    const deployTreasuryController = async () => {
        const TreasuryControllerImpl = await ethers.getContractFactory("TreasuryControllerImpl");
        const treasuryControllerImpl = await TreasuryControllerImpl.deploy();

        const initData = treasuryControllerImpl.interface.encodeFunctionData("initialize", [
            admin.address
        ]);

        const TreasuryController = await ethers.getContractFactory("TreasuryController");
        let treasuryController = await TreasuryController.deploy(
            treasuryControllerImpl.target,
            initData
        );

        treasuryController = await ethers.getContractAt("TreasuryControllerImpl", treasuryController.target);
     
        return {
            treasuryController,
        }
    }

    const deployTokens = async (treasuryController) => {
        const [admin, manager, client1, client2, deliverer1, deliverer2] = await ethers.getSigners();

        const DelyToken = await ethers.getContractFactory("DelyToken");
        const delyToken = await DelyToken.deploy(treasuryController.target, admin.address);

        const SDelyTokenImpl = await ethers.getContractFactory("SDelyTokenImpl");
        const sDelyTokenImpl = await SDelyTokenImpl.deploy();

        const sDelyTokenInitData = sDelyTokenImpl.interface.encodeFunctionData("initialize", [
            delyToken.target,
            treasuryController.target
        ]);

        const SDelyToken = await ethers.getContractFactory("SDelyToken");
        let sDelyToken = await SDelyToken.deploy(sDelyTokenImpl.target, sDelyTokenInitData);
        sDelyToken = await ethers.getContractAt("SDelyTokenImpl", sDelyToken.target);

        const WemixDollar = await ethers.getContractFactory("WemixDollar");
        const wemixDollar = await WemixDollar.connect(admin).deploy();

        return {
            delyToken,
            sDelyToken,
            wemixDollar,
        }
    }

    const deployV2SwapRouter = async () => {
        const V2SwapRouter = await ethers.getContractFactory("V2SwapRouter");
        const v2SwapRouter = await V2SwapRouter.deploy();

        return {
            v2SwapRouter,
        }
    }

    const deployDelivery = async (treasuryController, wemixDollar) => {
        const DeliveryImpl = await ethers.getContractFactory("DeliveryImpl");
        const deliveryImpl = await DeliveryImpl.deploy();

        const deliveryInitData = deliveryImpl.interface.encodeFunctionData("initialize", [
            admin.address,
            governor.address,
            manager.address,
            treasuryController.target,
            wemixDollar.target,
            INITIAL_FEE_RATE,
            INITIAL_MIN_ORDER_PRICE,
        ]);

        const Delivery = await ethers.getContractFactory("Delivery");
        let delivery = await Delivery.deploy(deliveryImpl.target, deliveryInitData);
        delivery = await ethers.getContractAt("DeliveryImpl", delivery.target);

        return {
            delivery,
        }
    }

    const { treasuryController } = await deployTreasuryController();
    const { delyToken, sDelyToken, wemixDollar } = await deployTokens(treasuryController);
    const { v2SwapRouter } = await deployV2SwapRouter();
    const { delivery } = await deployDelivery(treasuryController, wemixDollar);

    await wemixDollar.connect(admin).mint(delivery.target, INITIAL_WEMIX_DOLLAR_AMOUNT);
    await wemixDollar.connect(admin).mint(client1.address, INITIAL_WEMIX_DOLLAR_AMOUNT);
    await wemixDollar.connect(admin).mint(client2.address, INITIAL_WEMIX_DOLLAR_AMOUNT);

    await delyToken.connect(admin).transfer(v2SwapRouter.target, await ethers.parseEther("1000"));
    await delyToken.connect(admin).approve(sDelyToken.target, INITIAL_STAKING_AMOUNT);
    await sDelyToken.connect(admin).deposit(INITIAL_STAKING_AMOUNT, admin.address);

    await treasuryController.setV2SwapRouter(v2SwapRouter.target);
    await treasuryController.setDelyToken(delyToken.target);
    await treasuryController.setSDelyToken(sDelyToken.target);
    await treasuryController.setTrustedDomain(delivery.target, true);
    await treasuryController.setDomainReward(delivery.target, INITIAL_DELIVERY_REWARD);

    return {
        treasuryController,
        delyToken,
        sDelyToken,
        wemixDollar,
        v2SwapRouter,
        delivery,
    }
}

const getRequestOrderSignature = async (
    contract,
    clientAddress,
    orderId,
    expiration,
    signer
  ) => {  
    const domain = await getEIP712Domain(contract);
    const types = {
        RequestOrder: [
        { type: "address", name: "client" },
        { type: "uint256", name: "orderId" },
        { type: "uint256", name: "expiration" },
      ],
    };
  
    const data = {
      client: clientAddress,
      orderId,
      expiration,
    };
    
    const signature = await signer.signTypedData(domain, types, data);
    return signature;
};

const getCompleteOrderSignature = async (
    contract,
    clientAddress,
    delivererAddress,
    orderId,
    signer
) => {
    const domain = await getEIP712Domain(contract);
    const types = {
        CompleteOrder: [
        { type: "address", name: "client" },
        { type: "address", name: "deliverer" },
        { type: "uint256", name: "orderId" },
      ],
    };

    const data = {
        client: clientAddress,
        deliverer: delivererAddress,
        orderId,
    };

    return await signer.signTypedData(domain, types, data);
};

const getEIP712Domain = async (contract) => {
    const eip712domain = await contract.eip712Domain();
    return {
        chainId: eip712domain[3],
        name: eip712domain[1],
        verifyingContract: eip712domain[4],
        version: eip712domain[2],
    };
}