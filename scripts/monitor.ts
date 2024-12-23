import { PositionMonitor } from '../src/monitor/positions';

async function main() {
    const monitor = new PositionMonitor();
    
    console.log('🔍 Iniciando monitoreo de posiciones en Aave v3 (Arbitrum)...');
    console.log('⚙️ Configuración:');
    console.log(`   Min Health Factor: ${process.env.MIN_HEALTH_FACTOR || '1.1'}`);
    console.log(`   Min Profit USD: $${process.env.MIN_PROFIT_USD || '100'}`);
    
    const positions = await monitor.findLiquidatablePositions();
    
    if (positions.length > 0) {
        console.log(`\n✅ Encontradas ${positions.length} posiciones liquidables:`);
        positions.forEach(pos => {
            console.log(`
            👤 Usuario: ${pos.user}
            ❤️ Health Factor: ${pos.healthFactor.toFixed(4)}
            💰 Beneficio estimado: $${pos.estimatedProfit.toFixed(2)}
            🏦 Colateral Total: ${pos.totalCollateralETH.toFixed(4)} ETH
            💸 Deuda Total: ${pos.totalDebtETH.toFixed(4)} ETH
            🪙 Asset Colateral: ${pos.collateralAsset}
            🎁 Bonus Liquidación: ${pos.liquidationBonus?.toFixed(2)}%
            `);
        });
    } else {
        console.log('\n❌ No se encontraron posiciones liquidables');
    }
}

main().catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
}); 