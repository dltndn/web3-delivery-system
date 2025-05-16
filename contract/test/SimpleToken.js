const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let SimpleToken;
  let token;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 컨트랙트 배포를 위한 설정
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 컨트랙트 배포
    token = await SimpleToken.deploy(
      "Example Token", // 이름
      "EXT",           // 심볼
      18,              // 소수점 자릿수
      1000,            // 초기 공급량
      owner.address    // 초기 소유자
    );
  });

  describe("배포", function () {
    it("올바른 이름과 심볼로 설정되어야 합니다", async function () {
      expect(await token.name()).to.equal("Example Token");
      expect(await token.symbol()).to.equal("EXT");
    });

    it("올바른 소수점 자릿수로 설정되어야 합니다", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("배포자에게 모든 토큰이 할당되어야 합니다", async function () {
      const totalSupply = await token.totalSupply();
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply);
    });
  });

  describe("트랜잭션", function () {
    it("소유자가 다른 계정으로 토큰을 전송할 수 있어야 합니다", async function () {
      // 100 토큰을 addr1으로 전송
      await token.transfer(addr1.address, 100);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
    });

    it("토큰이 부족하면 실패해야 합니다", async function () {
      // 초기 addr1 잔액은 0
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // addr1이 1 토큰을 전송하려고 시도하지만 실패해야 함
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // 잔액이 변하지 않았는지 확인
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("민팅과 소각", function () {
    it("소유자만 새 토큰을 민팅할 수 있어야 합니다", async function () {
      await token.mint(addr1.address, 50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);

      // addr1이 민팅을 시도하지만 실패해야 함
      await expect(
        token.connect(addr1).mint(addr2.address, 50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("토큰 소유자는 자신의 토큰을 소각할 수 있어야 합니다", async function () {
      // 우선 addr1에게 토큰을 전송
      await token.transfer(addr1.address, 100);
      
      // addr1이 50 토큰을 소각
      await token.connect(addr1).burn(50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);
    });
  });
}); 