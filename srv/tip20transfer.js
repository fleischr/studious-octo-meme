// tip20Transfer.js
const { PrivyClient } = require('@privy-io/node');
const { ethers } = require('ethers');

/**
 * Transfer TIP20 tokens using Privy wallet
 * @param {Object} config - Configuration object
 * @param {string} config.appId - Privy app ID
 * @param {string} config.appSecret - Privy app secret
 * @param {string} config.walletId - Privy wallet ID
 * @param {string} config.tokenAddress - TIP20 token contract address
 * @param {string} config.recipientAddress - Recipient address
 * @param {string} config.amount - Amount to transfer
 * @param {number} [config.decimals=6] - Token decimals
 * @param {string} config.userJwt - User JWT token
 * @param {number} [config.chainId=41144] - Chain ID
 * @returns {Promise<Object>} Transaction response
 */
async function transferTIP20Token(config) {
  const {
    appId,
    appSecret,
    walletId,
    tokenAddress,
    recipientAddress,
    amount,
    decimals = 6,
    userJwt,
    chainId = 42431
  } = config;

  // Initialize Privy client
  const privy = new PrivyClient({
    appId,
    appSecret
  });

  try {
    validatedTokenAddress = ethers.getAddress(tokenAddress);
  } catch (error) {
    throw new Error(`Invalid token address format: ${error.message}`);
  }

  try {
    validatedRecipientAddress = ethers.getAddress(recipientAddress);
  } catch (error) {
    throw new Error(`Invalid recipient address format: ${error.message}`);
  }

  // Create ERC20 transfer function call data
  const erc20Interface = new ethers.Interface([
    'function transfer(address to, uint256 amount) returns (bool)'
  ]);
  
  // Convert amount to token units
  const amountInUnits = ethers.parseUnits(amount.toString(), decimals);
  
  // Encode the transfer function call
  const data = erc20Interface.encodeFunctionData('transfer', [
    validatedRecipientAddress,
    amountInUnits
  ]);

  // Send the transaction
  const response = await privy
    .wallets()
    .ethereum()
    .sendTransaction(walletId, {
      caip2: `eip155:${chainId}`,
      params: {
        transaction: {
          to: validatedTokenAddress,
          data: data,
          value: '0x0'
        }
      }
    });

  return response;
}

module.exports = { transferTIP20Token };