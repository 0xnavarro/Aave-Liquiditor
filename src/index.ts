import { ethers } from 'ethers';
import { PositionMonitor } from './monitor/positions';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function main() {
    try {
        // Configurar provider y wallet
        const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

        console.log('🚀 Iniciando bot liquidador de Aave');
        console.log('Dirección del bot:', wallet.address);

        // Iniciar monitor de posiciones
        const monitor = new PositionMonitor();
        
        // Iniciar monitoreo cada 1 minuto
        await monitor.startMonitoring(60000);

    } catch (error) {
        console.error('Error en el bot:', error);
        process.exit(1);
    }
}

main(); 