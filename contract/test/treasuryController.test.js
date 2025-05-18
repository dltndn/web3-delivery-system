const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryController", function () {
    
    describe("Auth", function () {
        it ("should be executed by admin", async function () {
            const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();
            const { treasuryController } = await loadFixture(deployContracts);

            const randomAddress = ethers.Wallet.createRandom().address;

            await expect(treasuryController.connect(client1).setV2SwapRouter(randomAddress))
                .to.be.revertedWithCustomError(treasuryController, "OwnableUnauthorizedAccount");

            await expect(treasuryController.connect(client1).setDelyToken(randomAddress))
                .to.be.revertedWithCustomError(treasuryController, "OwnableUnauthorizedAccount");

            await expect(treasuryController.connect(client1).setSDelyToken(randomAddress))
                .to.be.revertedWithCustomError(treasuryController, "OwnableUnauthorizedAccount");

            await expect(treasuryController.connect(client1).setTrustedDomain(randomAddress, true))
                .to.be.revertedWithCustomError(treasuryController, "OwnableUnauthorizedAccount");

            await expect(treasuryController.connect(client1).setDomainReward(randomAddress, 100))
                .to.be.revertedWithCustomError(treasuryController, "OwnableUnauthorizedAccount");
            
            await treasuryController.connect(admin).setV2SwapRouter(randomAddress);
            expect(await treasuryController.getV2SwapRouter()).to.equal(randomAddress);
        });

        it("should allow only trusted domains to execute submitRevenue", async function () {
            const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();
            const { treasuryController, wemixDollar } = await loadFixture(deployContracts);
            
            const amount = ethers.parseEther("100");
            
            // client1은 신뢰할 수 있는 도메인이 아님
            await expect(treasuryController.connect(client1).submitRevenue(wemixDollar.target, amount, client1.address))
                .to.be.revertedWithCustomError(treasuryController, "Unauthorized");
        });
    });
    
    describe("Emergency Pause", function () {
        it("should not allow submitRevenue when paused", async function () {
            const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();
            const { treasuryController, delivery, wemixDollar } = await loadFixture(deployContracts);
            
            const amount = ethers.parseEther("100");
            
            // 컨트랙트 일시 중지
            await treasuryController.connect(admin).pause();

            // client1을 신뢰할 수 있는 도메인으로 설정
            await treasuryController.connect(admin).setTrustedDomain(client1.address, true);
            // client1 allowance 설정
            await wemixDollar.connect(client1).approve(treasuryController.target, amount);
            
            // 일시 중지 상태에서 submitRevenue 호출 시도
            await expect(treasuryController.connect(client1).submitRevenue(wemixDollar.target, amount, client1.address))
                .to.be.revertedWithCustomError(treasuryController, "EnforcedPause");
                
            // 일시 중지 해제
            await treasuryController.connect(admin).unpause();

            // 일시 중지 해제 후 submitRevenue 호출
            await treasuryController.connect(client1).submitRevenue(wemixDollar.target, amount, client1.address);
        });
    });
    
    describe("Revenue Settlement", function () {
        it("should process correct token amount", async function () {
            const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();
            const { treasuryController, delivery, wemixDollar, delyToken, sDelyToken } = await loadFixture(deployContracts);
            
            const amount = ethers.parseEther("100");
            
            // client1을 신뢰할 수 있는 도메인으로 설정
            await treasuryController.connect(admin).setTrustedDomain(client1.address, true);
            // client1 allowance 설정
            await wemixDollar.connect(client1).approve(treasuryController.target, amount);
            
            // 수익금 정산 전후 잔액 확인
            const balanceBefore = await delyToken.balanceOf(sDelyToken.target);
            
            // submitRevenue 호출
            await treasuryController.connect(client1).submitRevenue(wemixDollar.target, amount, client1.address);
            
            // wemixDollar와 delyToken의 교환 비율을 1:1로 가정
            const balanceAfter = await delyToken.balanceOf(sDelyToken.target);
            expect(balanceAfter - balanceBefore).to.equal(amount);
        });
    
        it("should reward recipients with Dely tokens", async function () {
            const [admin, manager, client1, client2, deliverer1, deliverer2, governor] = await ethers.getSigners();
            const { treasuryController, delivery, wemixDollar, delyToken } = await loadFixture(deployContracts);
            
            const amount = ethers.parseEther("100");
            
            // 도메인 보상 설정 확인
            const rewardAmount = await treasuryController.getDomainReward(delivery.target);
            expect(rewardAmount).to.be.gt(0); // 보상이 설정되어 있는지 확인
            
            // client1을 신뢰할 수 있는 도메인으로 설정
            await treasuryController.connect(admin).setTrustedDomain(client1.address, true);
            await treasuryController.connect(admin).setDomainReward(client1.address, rewardAmount);
            // client1 allowance 설정
            await wemixDollar.connect(client1).approve(treasuryController.target, amount);
            
            // 보상 수령자의 Dely 토큰 잔액 확인
            const recipientBalanceBefore = await delyToken.balanceOf(deliverer1.address);
            
            // submitRevenue 호출 (보상 수령자 지정)
            await treasuryController.connect(client1).submitRevenue(wemixDollar.target, amount, deliverer1.address);
            
            // 보상 수령자의 Dely 토큰 잔액 증가 확인
            const recipientBalanceAfter = await delyToken.balanceOf(deliverer1.address);
            // 보상이 정확히 지급되었는지 확인
            expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(rewardAmount);
        });
        
            
        
    });
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
