# 🚀 Bot Liquidador para Aave v3 en Arbitrum | Aave v3 Liquidator Bot on Arbitrum

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/0xnavarro/Aave-Liquiditor)
[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://x.com/0xnavarro)

```
 ███▄    █  ▄▄▄       ██▒   █▓ ▄▄▄       ██▀███   ██▀███   ▒█████  
 ██ ▀█   █ ▒████▄    ▓██░   █▒▒████▄    ▓██ ▒ ██▒▓██ ▒ ██▒▒██▒  ██▒
▓██  ▀█ ██▒▒██  ▀█▄   ▓██  █▒░▒██  ▀█▄  ▓██ ░▄█ ▒▓██ ░▄█ ▒▒██░  ██▒
▓██▒  ▐▌██▒░██▄▄▄▄██   ▒██ █░░░██▄▄▄▄██ ▒██▀▀█▄  ▒██▀▀█▄  ▒██   ██░
▒██░   ▓██░ ▓█   ▓██▒   ▒▀█░   ▓█   ▓██▒░██▓ ▒██▒░██▓ ▒██▒░ ████▓▒░
░ ▒░   ▒ ▒  ▒▒   ▓▒█░   ░ ▐░   ▒▒   ▓▒█░░ ▒▓ ░▒▓░░ ▒▓ ░▒▓░░ ▒░▒░▒░ 
░ ░░   ░ ▒░  ▒   ▒▒ ░   ░ ░░    ▒   ▒▒ ░  ░▒ ░ ▒░  ░▒ ░ ▒░  ░ ▒ ▒░ 
   ░   ░ ░   ░   ▒        ░░    ░   ▒     ░░   ░   ░░   ░ ░ ░ ░ ▒  
         ░       ░  ░      ░        ░  ░   ░        ░         ░ ░  
                          ░                                          
```

```
 █████╗  █████╗ ██╗   ██╗███████╗    ██╗      ██████╗  █████╗ ███╗   ██╗
██╔══██╗██╔══██╗██║   ██║██╔════╝    ██║     ██╔═══██╗██╔══██╗████╗  ██║
███████║███████║██║   ██║█████╗      ██║     ██║   ██║███████║██╔██╗ ██║
██╔══██║██╔══██║╚██╗ ██╔╝██╔══╝      ██║     ██║   ██║██╔══██║██║╚██╗██║
██║  ██║██║  ██║ ╚████╔╝ ███████╗    ███████╗╚██████╔╝██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
██╗     ██╗ ██████╗ ██╗   ██╗██╗██████╗  █████╗ ████████╗ ██████╗ ██████╗ 
██║     ██║██╔═══██╗██║   ██║██║██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██║██║   ██║██║   ██║██║██║  ██║███████║   ██║   ██║   ██║██████╔╝
██║     ██║██║▄▄ ██║██║   ██║██║██║  ██║██╔══██║   ██║   ██║   ██║██╔══██╗
███████╗██║╚██████╔╝╚██████╔╝██║██████╔╝██║  ██║   ██║   ╚██████╔╝██║  ██║
╚══════╝╚═╝ ╚══▀▀═╝  ╚═════╝ ╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

                    .-.
                   ()   \
                    /    |
                   ( )   |
                    \  /
                   .-.
                  ()   \
                   /    |
                  ( )   |  
                   \  /
                    \/
```

[English version below](#english-version)

# 🚀 Bot Liquidador para Aave v3 en Arbitrum

## 📝 Descripción
Bot automatizado para monitorear y ejecutar liquidaciones en Aave v3 en Arbitrum. El proyecto consta de dos partes principales:
1. Monitor de posiciones en riesgo
2. Ejecutor de liquidaciones con flash loans

## 🔍 ¿Cómo funciona una liquidación?

### Conceptos Básicos
- **Health Factor**: Métrica que indica la salud de una posición
  - > 1: Posición saludable
  - < 1: Posición liquidable
  - Ejemplo: Health Factor = 0.95 significa que la posición está en riesgo

- **Colateral**: Activos depositados como garantía
- **Deuda**: Activos prestados
- **Liquidación**: Proceso de pagar la deuda de alguien a cambio de su colateral + bonus

### Proceso de Liquidación
1. **Detección**:
   - Bot monitorea posiciones en Aave
   - Identifica usuarios con Health Factor < 1
   - Calcula beneficio potencial

2. **Ejecución**:
   - Obtener flash loan para el capital necesario
   - Pagar parte de la deuda del usuario (máx. 50%)
   - Recibir colateral + bonus de liquidación
   - Devolver flash loan
   - Obtener beneficio = bonus - gastos

### Ejemplo Numérico
```
Usuario tiene:
- Colateral: 10 ETH ($22,000)
- Deuda: 8 ETH ($17,600)
- Health Factor: 0.95

Liquidación:
1. Pagas: 4 ETH de su deuda (50%)
2. Recibes: 4.2 ETH de colateral (5% bonus)
3. Beneficio: 0.2 ETH (~$440) - gastos
```

## ❓ Preguntas Frecuentes

### ¿Por qué existe el bonus de liquidación?
- Incentiva a liquidadores a mantener el protocolo saludable
- Compensa los costos de gas y riesgos
- Crea competencia que beneficia al protocolo

### ¿Por qué Aave no automatiza las liquidaciones?
1. **Descentralización**:
   - Evita puntos centrales de control
   - Cualquiera puede participar

2. **Competencia de Mercado**:
   - Múltiples liquidadores compiten
   - Mejor eficiencia y precios
   - Mayor velocidad de liquidación

3. **Distribución de Riesgos**:
   - No depende de un solo sistema
   - Múltiples participantes asumen riesgos
   - Mayor resistencia a fallos

### ¿Cuáles son los riesgos?
1. **Técnicos**:
   - Fallos en el monitoreo
   - Problemas de red
   - Errores en smart contracts

2. **Económicos**:
   - Costos de gas elevados
   - Competencia de otros bots
   - Volatilidad de precios

3. **Operacionales**:
   - Necesidad de mantenimiento 24/7
   - Gestión de infraestructura
   - Actualizaciones del protocolo

## 🛠 Arquitectura del Bot

### Componentes
1. **Monitor**:
   - Consulta Arbiscan para direcciones activas
   - Verifica health factors
   - Calcula beneficios potenciales

2. **Liquidador**:
   - Smart contract para flash loans
   - Lógica de liquidación
   - Gestión de tokens

3. **Configuración**:
   - Health factor mínimo
   - Beneficio mínimo
   - Límites de gas

### Tecnologías
- Ethereum/Arbitrum
- Hardhat
- TypeScript
- ethers.js
- The Graph/Arbiscan

## 📊 Estrategias de Optimización

### Velocidad
- Múltiples nodos RPC
- Caché de datos
- Monitoreo paralelo

### Gas
- Estimación precisa
- Prioridad dinámica
- Bundles de transacciones

### Beneficios
- Filtros de rentabilidad
- Análisis de competencia
- Gestión de riesgos

## 🚀 Próximos Pasos
1. Implementar liquidaciones reales
2. Optimizar velocidad de detección
3. Mejorar estrategias de gas
4. Añadir más redes y protocolos

## ⚠️ Consideraciones
- Requiere capital inicial para gas
- Alta competencia de otros bots
- Necesita monitoreo constante
- Riesgos de pérdidas por gas

## 🔧 Instrucciones de Uso

### Prerrequisitos
- Node.js v16 o superior
- Git
- Cuenta en Arbitrum con ETH para gas

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/0xnavarro/Aave-Liquiditor.git

# Entrar al directorio
cd Aave-Liquiditor

# Instalar dependencias
npm install

# Copiar el archivo de ejemplo de variables de entorno
cp .env.example .env
```

### Configuración
1. Edita el archivo `.env` con tus credenciales:
   ```
   PRIVATE_KEY=tu_llave_privada
   RPC_URL=tu_url_rpc
   ```

2. Ajusta los parámetros en `config.ts`:
   - Límites de gas
   - Factor de salud mínimo
   - Beneficio mínimo esperado

### Ejecución
```bash
# Compilar contratos
npm run compile

# Ejecutar tests
npm run test

# Iniciar el monitor
npm run monitor

# Iniciar el liquidador
npm run liquidator
```

## 📱 Contacto
- Twitter: [@0xnavarro](https://x.com/0xnavarro)

# English Version

## 📝 Description
Automated bot to monitor and execute liquidations on Aave v3 on Arbitrum. The project consists of two main parts:
1. Risk position monitor
2. Liquidation executor with flash loans

## 🔍 How does a liquidation work?

### Basic Concepts
- **Health Factor**: Metric that indicates the health of a position
  - > 1: Healthy position
  - < 1: Liquidatable position
  - Example: Health Factor = 0.95 means the position is at risk

- **Collateral**: Assets deposited as guarantee
- **Debt**: Borrowed assets
- **Liquidation**: Process of paying someone's debt in exchange for their collateral + bonus

### Liquidation Process
1. **Detection**:
   - Bot monitors positions in Aave
   - Identifies users with Health Factor < 1
   - Calculates potential profit

2. **Execution**:
   - Get flash loan for required capital
   - Pay part of user's debt (max. 50%)
   - Receive collateral + liquidation bonus
   - Return flash loan
   - Get profit = bonus - expenses

### Numerical Example
```
User has:
- Collateral: 10 ETH ($22,000)
- Debt: 8 ETH ($17,600)
- Health Factor: 0.95

Liquidation:
1. You pay: 4 ETH of their debt (50%)
2. You receive: 4.2 ETH of collateral (5% bonus)
3. Profit: 0.2 ETH (~$440) - expenses
```

## ❓ Frequently Asked Questions

### Why does the liquidation bonus exist?
- Incentivizes liquidators to keep the protocol healthy
- Compensates for gas costs and risks
- Creates competition that benefits the protocol

### Why doesn't Aave automate liquidations?
1. **Decentralization**:
   - Avoids central points of control
   - Anyone can participate

2. **Market Competition**:
   - Multiple liquidators compete
   - Better efficiency and prices
   - Higher liquidation speed

3. **Risk Distribution**:
   - Doesn't depend on a single system
   - Multiple participants assume risks
   - Greater fault tolerance

### What are the risks?
1. **Technical**:
   - Monitoring failures
   - Network issues
   - Smart contract errors

2. **Economic**:
   - High gas costs
   - Competition from other bots
   - Price volatility

3. **Operational**:
   - Need for 24/7 maintenance
   - Infrastructure management
   - Protocol updates

## 🛠 Bot Architecture

### Components
1. **Monitor**:
   - Queries Arbiscan for active addresses
   - Verifies health factors
   - Calculates potential profits

2. **Liquidator**:
   - Smart contract for flash loans
   - Liquidation logic
   - Token management

3. **Configuration**:
   - Minimum health factor
   - Minimum profit
   - Gas limits

### Technologies
- Ethereum/Arbitrum
- Hardhat
- TypeScript
- ethers.js
- The Graph/Arbiscan

## 📊 Optimization Strategies

### Speed
- Multiple RPC nodes
- Data caching
- Parallel monitoring

### Gas
- Precise estimation
- Dynamic priority
- Transaction bundles

### Profits
- Profitability filters
- Competition analysis
- Risk management

## 🚀 Next Steps
1. Implement real liquidations
2. Optimize detection speed
3. Improve gas strategies
4. Add more networks and protocols

## ⚠️ Considerations
- Requires initial capital for gas
- High competition from other bots
- Needs constant monitoring
- Risk of losses due to gas

## 🔧 Usage Instructions

### Prerequisites
- Node.js v16 or higher
- Git
- Arbitrum account with ETH for gas

### Installation
```bash
# Clone repository
git clone https://github.com/0xnavarro/Aave-Liquiditor.git

# Enter directory
cd Aave-Liquiditor

# Install dependencies
npm install

# Copy environment variables example file
cp .env.example .env
```

### Configuration
1. Edit the `.env` file with your credentials:
   ```
   PRIVATE_KEY=your_private_key
   RPC_URL=your_rpc_url
   ```

2. Adjust parameters in `config.ts`:
   - Gas limits
   - Minimum health factor
   - Expected minimum profit

### Execution
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Start monitor
npm run monitor

# Start liquidator
npm run liquidator
```

## 📱 Contact
- Twitter: [@0xnavarro](https://x.com/0xnavarro)
