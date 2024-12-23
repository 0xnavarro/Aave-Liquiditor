export interface Price {
    priceInUSD: string;
}

export interface Reserve {
    id: string;
    symbol: string;
    decimals: number;
    price: Price;
}

export interface UserReserve {
    currentATokenBalance: string;
    currentStableDebt: string;
    currentVariableDebt: string;
    reserve: Reserve;
}

export interface User {
    id: string;
    borrowedReservesCount: number;
    healthFactor: string;
    totalCollateralUSD: string;
    totalDebtUSD: string;
    reserves: UserReserve[];
}

export interface RiskyPositionsResponse {
    users: User[];
} 