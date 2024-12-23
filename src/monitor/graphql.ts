import { gql } from 'graphql-request';

export const QUERY_RISKY_POSITIONS = gql`
  query GetRiskyPositions($healthFactor: BigDecimal!) {
    users(
      where: {
        borrowedReservesCount_gt: 0,
        healthFactor_lt: $healthFactor
      }
      first: 1000
      orderBy: healthFactor
      orderDirection: asc
    ) {
      id
      borrowedReservesCount
      healthFactor
      totalCollateralUSD
      totalDebtUSD
      reserves {
        currentATokenBalance
        currentStableDebt
        currentVariableDebt
        reserve {
          id
          symbol
          decimals
          price {
            priceInUSD
          }
        }
      }
    }
  }
`;

export const QUERY_USER_POSITION = gql`
  query GetUserPosition($userId: String!) {
    user(id: $userId) {
      id
      borrowedReservesCount
      collateralReserve {
        id
        symbol
        decimals
        price {
          priceInEth
        }
      }
      healthFactor
      totalCollateralETH
      totalDebtETH
    }
  }
`; 