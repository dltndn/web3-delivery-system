// 스마트 컨트랙트 배포 스크립트
const { ethers } = require("hardhat");

async function main() {
  // 배포 계정 정보 가져오기
  const [deployer] = await ethers.getSigners();
  console.log("토큰 컨트랙트 배포 계정:", deployer.address);
  
  // 배포 전 계정 잔액 출력
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("계정 잔액:", ethers.formatEther(balance), "ETH");
  
  // SimpleToken 컨트랙트 가져오기
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  
  // 토큰 파라미터 설정
  const tokenName = "Example Token";
  const tokenSymbol = "EXT";
  const tokenDecimals = 18;
  const initialSupply = 1000000; // 100만 토큰
  
  // 컨트랙트 배포
  console.log("SimpleToken 컨트랙트 배포 중...");
  const token = await SimpleToken.deploy(
    tokenName, 
    tokenSymbol, 
    tokenDecimals, 
    initialSupply,
    deployer.address
  );
  
  // 배포 완료 대기
  await token.waitForDeployment();
  
  // 배포된 컨트랙트 주소 출력
  console.log("SimpleToken 배포됨:", await token.getAddress());
  console.log("토큰 정보:");
  console.log(" - 이름:", await token.name());
  console.log(" - 심볼:", await token.symbol());
  console.log(" - 소수점 자릿수:", await token.decimals());
  console.log(" - 총 공급량:", ethers.formatUnits(await token.totalSupply(), await token.decimals()));
}

// 스크립트 실행 및 에러 처리
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 