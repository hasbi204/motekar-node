const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth/392091909ba36c00c4046cef63008b300c38fa871d816e9963e20d0b72039c6b');
async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
module.exports = { getBalance };
