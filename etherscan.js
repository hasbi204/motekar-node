const axios = require('axios');

const API_KEY = process.env.ETHERSCAN_API_KEY;

const BASE_URL = 'https://api.etherscan.io/v2/api?chainid=1';

async function getNormalTx(address) {
  const res = await axios.get(BASE_URL, {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      offset: 15,
      page: 1,
      sort: 'desc',
      apikey: API_KEY,
    },
  });

  return res.data.result;
}

async function getTokenTx(address) {
  const res = await axios.get(BASE_URL, {
    params: {
      module: 'account',
      action: 'tokentx',
      address,
      sort: 'desc',
      apikey: API_KEY,
    },
  });

  return res.data.result;
}

async function getInternalTx(address) {
  const res = await axios.get(BASE_URL, {
    params: {
      module: 'account',
      action: 'txlistinternal',
      address,
      sort: 'desc',
      apikey: API_KEY,
    },
  });

  return res.data.result;
}

module.exports = {
  getNormalTx,
  getTokenTx,
  getInternalTx,
};
