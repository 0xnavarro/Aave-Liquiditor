import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Iniciando despliegue del contrato FlashLiquidator...");

  // Dirección del Pool Addresses Provider de Aave v3 en Arbitrum
  const AAVE_POOL_ADDRESSES_PROVIDER = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";

  const FlashLiquidator = await ethers.getContractFactory("FlashLiquidator");
  const flashLiquidator = await FlashLiquidator.deploy(AAVE_POOL_ADDRESSES_PROVIDER);

  await flashLiquidator.waitForDeployment();

  console.log(
    `✅ FlashLiquidator desplegado en: ${await flashLiquidator.getAddress()}`
  );
}

main().catch((error) => {
  console.error("❌ Error en el despliegue:", error);
  process.exitCode = 1;
}); 