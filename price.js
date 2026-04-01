const axios = require('axios');

let cachedPrice = 0;
let lastFetch = 0;

async function getETHPrice() {
  const now = Date.now();

  // cache 1 menit
  if (now - lastFetch < 60000 && cachedPrice) {
    return cachedPrice;
  }

  try {
    const res = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'ethereum',
          vs_currencies: 'idr',
        },
      }
    );

    cachedPrice = res.data.ethereum.idr;
    lastFetch = now;

    return cachedPrice;
  } catch (err) {
    console.error('Price error:', err.message);
    return cachedPrice || 0;
  }
}

module.exports = { getETHPrice };