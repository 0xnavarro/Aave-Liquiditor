import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// ABI mínimo necesario para consultar el Pool de Aave
const AAVE_POOL_ABI = [
    "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
    "function getReservesList() view returns (address[])",
    "function getReserveData(address asset) view returns (tuple(uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp) data)",
    "function getConfiguration(address asset) view returns (tuple(uint256 data) config)",
    "function getUserConfiguration(address user) view returns (tuple(uint256 data) config)"
];

// Interfaz para la configuración de reservas
interface ReserveConfig {
    ltv: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    decimals: number;
    reserveFactor: number;
    usageAsCollateralEnabled: boolean;
    borrowingEnabled: boolean;
    stableBorrowRateEnabled: boolean;
    isActive: boolean;
    isFrozen: boolean;
}

interface Position {
    user: string;
    healthFactor: number;
    totalCollateralETH: number;
    totalDebtETH: number;
    estimatedProfit: number;
    collateralAsset?: string;
    liquidationBonus?: number;
}

export class PositionMonitor {
    private provider: ethers.JsonRpcProvider;
    private pool: ethers.Contract;
    private minHealthFactor: number;
    private minProfitUSD: number;
    private addressesCache: Set<string>;
    private lastUpdate: number;
    private reservesList: string[] | null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
        this.pool = new ethers.Contract(
            process.env.AAVE_LENDING_POOL || '',
            AAVE_POOL_ABI,
            this.provider
        );
        this.minHealthFactor = parseFloat(process.env.MIN_HEALTH_FACTOR || '1.1');
        this.minProfitUSD = parseFloat(process.env.MIN_PROFIT_USD || '100');
        this.addressesCache = new Set<string>();
        this.lastUpdate = 0;
        this.reservesList = null;
    }

    private async getAddressesFromArbiscan(): Promise<string[]> {
        try {
            // Solo actualizar cada 5 minutos
            const now = Date.now();
            if (now - this.lastUpdate < 5 * 60 * 1000 && this.addressesCache.size > 0) {
                return Array.from(this.addressesCache);
            }

            const apiKey = process.env.ARBISCAN_API_KEY;
            if (!apiKey) {
                console.error('❌ ARBISCAN_API_KEY no configurada');
                return Array.from(this.addressesCache);
            }

            // Obtener las últimas 10,000 transacciones del contrato de Aave
            const response = await axios.get(`https://api.arbiscan.io/api`, {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address: process.env.AAVE_LENDING_POOL,
                    startblock: 0,
                    endblock: 99999999,
                    page: 1,
                    offset: 10000,
                    sort: 'desc',
                    apikey: apiKey
                }
            });

            if (response.data.status === '1' && response.data.result) {
                // Extraer direcciones únicas de las transacciones
                const addresses = new Set<string>();
                for (const tx of response.data.result) {
                    addresses.add(tx.from.toLowerCase());
                }

                this.addressesCache = addresses;
                this.lastUpdate = now;
                
                console.log(`📊 Encontradas ${addresses.size} direcciones únicas interactuando con Aave`);
                return Array.from(addresses);
            }

            return Array.from(this.addressesCache);
        } catch (error) {
            console.error('Error al obtener direcciones de Arbiscan:', error);
            return Array.from(this.addressesCache);
        }
    }

    private async getReservesList(): Promise<string[]> {
        if (!this.reservesList) {
            this.reservesList = await this.pool.getReservesList();
        }
        return this.reservesList || [];
    }

    private async getUserCollateral(user: string): Promise<string | null> {
        const reserves = await this.getReservesList();
        const { data } = await this.pool.getUserConfiguration(user);
        const config = BigInt(data.toString());
        
        // Iterar sobre las reservas para encontrar el colateral activo
        for (let i = 0; i < reserves.length; i++) {
            const isUsedAsCollateral = Boolean((config >> BigInt(i * 2)) & 1n);
            if (isUsedAsCollateral) {
                return reserves[i];
            }
        }
        
        return null;
    }

    private async getReserveConfig(asset: string): Promise<ReserveConfig> {
        const { data } = await this.pool.getConfiguration(asset);
        const config = BigInt(data.toString());
        
        return {
            ltv: Number((config >> 0n) & 0xFFFFn) / 100,
            liquidationThreshold: Number((config >> 16n) & 0xFFFFn) / 100,
            liquidationBonus: Number((config >> 32n) & 0xFFFFn) / 100,
            decimals: Number((config >> 48n) & 0xFFn),
            reserveFactor: Number((config >> 64n) & 0xFFFFn) / 100,
            usageAsCollateralEnabled: Boolean((config >> 80n) & 1n),
            borrowingEnabled: Boolean((config >> 81n) & 1n),
            stableBorrowRateEnabled: Boolean((config >> 82n) & 1n),
            isActive: Boolean((config >> 83n) & 1n),
            isFrozen: Boolean((config >> 84n) & 1n)
        };
    }

    async findLiquidatablePositions(): Promise<Position[]> {
        try {
            const addresses = await this.getAddressesFromArbiscan();
            const positions: Position[] = [];

            console.log(`🔍 Analizando ${addresses.length} direcciones...`);
            let checked = 0;

            for (const user of addresses) {
                try {
                    const {
                        totalCollateralBase,
                        totalDebtBase,
                        healthFactor
                    } = await this.pool.getUserAccountData(user);

                    const healthFactorNumber = parseFloat(ethers.formatUnits(healthFactor, 18));
                    
                    if (healthFactorNumber >= this.minHealthFactor) continue;

                    const totalCollateralETH = parseFloat(ethers.formatUnits(totalCollateralBase, 18));
                    const totalDebtETH = parseFloat(ethers.formatUnits(totalDebtBase, 18));

                    // Obtener el activo usado como colateral
                    const collateralAsset = await this.getUserCollateral(user);
                    if (!collateralAsset) continue;

                    // Obtener configuración de la reserva
                    const reserveConfig = await this.getReserveConfig(collateralAsset);
                    const liquidationBonus = reserveConfig.liquidationBonus / 100; // Convertir de porcentaje a decimal

                    // Calcular beneficio potencial
                    const maxLiquidation = totalDebtETH * 0.5; // Máximo 50% de la deuda
                    const estimatedProfit = (maxLiquidation * liquidationBonus) - 
                        (maxLiquidation * 0.001); // 0.1% fee por flash loan

                    // Convertir a USD usando el precio de ETH (aproximado)
                    const ethPriceUSD = 2200; // TODO: Obtener precio real
                    const estimatedProfitUSD = estimatedProfit * ethPriceUSD;

                    if (estimatedProfitUSD < this.minProfitUSD) continue;

                    positions.push({
                        user,
                        healthFactor: healthFactorNumber,
                        totalCollateralETH,
                        totalDebtETH,
                        estimatedProfit: estimatedProfitUSD,
                        collateralAsset,
                        liquidationBonus: liquidationBonus * 100 // Convertir a porcentaje para mostrar
                    });

                    checked++;
                    if (checked % 100 === 0) {
                        console.log(`✓ Analizadas ${checked}/${addresses.length} direcciones`);
                    }
                } catch (error) {
                    // Ignorar errores individuales y continuar con la siguiente dirección
                    continue;
                }
            }

            return positions.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
        } catch (error) {
            console.error('Error al buscar posiciones:', error);
            return [];
        }
    }

    async startMonitoring(interval: number = 60000) {
        console.log('🚀 Iniciando monitoreo de posiciones...');
        
        const checkPositions = async () => {
            const positions = await this.findLiquidatablePositions();
            
            if (positions.length > 0) {
                console.log(`\n✅ Encontradas ${positions.length} posiciones liquidables:`);
                positions.forEach(pos => {
                    console.log(`
                        👤 Usuario: ${pos.user}
                        ❤️ Health Factor: ${pos.healthFactor}
                        💰 Beneficio estimado: $${pos.estimatedProfit.toFixed(2)}
                        🏦 Colateral Total: ${pos.totalCollateralETH.toFixed(4)} ETH
                        💸 Deuda Total: ${pos.totalDebtETH.toFixed(4)} ETH
                    `);
                });
            } else {
                console.log('\n❌ No se encontraron posiciones liquidables');
            }
        };

        // Primera ejecución inmediata
        await checkPositions();

        // Configurar el intervalo
        setInterval(checkPositions, interval);
    }
} 