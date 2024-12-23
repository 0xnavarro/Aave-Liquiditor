// SPDX-License-Identifier: MIT

/*
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

@title Flash Liquidator Contract for Aave v3
@author Carlos Navarro (@0xnavarro)
@notice This contract performs flash loan liquidations on Aave v3
@dev Implements flash loan and liquidation logic for underwater positions
@custom:website https://github.com/0xnavarro/Aave-Liquiditor
*/

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract FlashLiquidator is FlashLoanSimpleReceiverBase {
    using SafeERC20 for IERC20;

    address public owner;
    IPool public pool;

    struct LiquidationParams {
        address collateralAsset;
        address debtAsset;
        address user;
        uint256 debtToCover;
        bool receiveAToken;
    }

    LiquidationParams private liquidationParams;

    constructor(address _addressProvider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
        pool = IPool(_addressProvider);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Decode liquidation parameters
        liquidationParams = abi.decode(params, (LiquidationParams));

        // Approve the pool to use the flash loaned asset
        IERC20(asset).approve(address(pool), amount + premium);

        // Execute liquidation
        pool.liquidationCall(
            liquidationParams.collateralAsset,
            liquidationParams.debtAsset,
            liquidationParams.user,
            liquidationParams.debtToCover,
            liquidationParams.receiveAToken
        );

        // Return the flash loan
        uint256 amountToReturn = amount + premium;
        require(
            IERC20(asset).balanceOf(address(this)) >= amountToReturn,
            "Insufficient funds to repay flash loan"
        );

        return true;
    }

    function executeLiquidation(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external onlyOwner {
        // Prepare liquidation parameters
        bytes memory params = abi.encode(
            LiquidationParams({
                collateralAsset: collateralAsset,
                debtAsset: debtAsset,
                user: user,
                debtToCover: debtToCover,
                receiveAToken: receiveAToken
            })
        );

        // Request flash loan
        pool.flashLoanSimple(
            address(this),
            debtAsset,
            debtToCover,
            params,
            0
        );
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner, amount);
    }

    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Función para recibir ETH
    receive() external payable {}
} 