const WebSocket = require('ws');
const { db } = require('./db');
const { getETHPrice } = require('./price');
const ALCHEMY_WS = process.env.ALCHEMY_WS;
const sentTx = new Set();

let trackedWallets = [];
let isLoading = false;

async function loadWallets() {
  if (isLoading) return;
  isLoading = true;

  try {
    const [rows] = await db.execute('SELECT * FROM wallets');
    trackedWallets = rows.map(w => ({
      address: w.address.toLowerCase(),
      user_id: w.user_id,
      name: w.name,
    }));

    console.log('📦 Wallet loaded:', trackedWallets.length);
  } catch (err) {
    console.error('Load wallet error:', err.message);
  }

  isLoading = false;
}

function sendRPC(ws, method, params, id = 2) {
  ws.send(
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params,
    })
  );
}

function startWS(bot) {
  loadWallets();
  setInterval(loadWallets, 30000); // tiap 30 detik

  setInterval(() => {
  sentTx.clear();
  console.log('🧹 Clear TX cache');
}, 10 * 60 * 1000); // 10 menit

  const ws = new WebSocket(ALCHEMY_WS);
  ws.on('open', () => {
    console.log('✅ WebSocket connected');
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
      })
    );
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.method === 'eth_subscription') {
      const txHash = msg.params.result;
      sendRPC(ws, 'eth_getTransactionByHash', [txHash], Date.now());
      return;
    }
    if (msg.result && msg.result.hash) {
      const tx = msg.result;
      if (!tx.value || tx.value === '0x0') return;
      if (!tx.to) return;
      if (tx.input && tx.input !== '0x') return;

      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      const matched = trackedWallets.find(w => w.address === from || w.address === to);
      if (!matched) return;

      const isIncoming = to === matched.address;
      const eth = parseInt(tx.value, 16) / 1e18;
      const type = isIncoming ? '🟢 ETH Masuk' : '🔴 ETH Keluar';

      if (sentTx.has(tx.hash)) return;

      const price = await getETHPrice();
      const idr = eth * price;

      const formatRupiah = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0 // Mengatur agar tidak ada ,00 di belakang
      }).format(idr);

      await bot.telegram.sendMessage(
        matched.user_id,
        `${type}
${matched.name}
${matched.address}

Amount: ${eth} ETH (~ ${formatRupiah})
Tx: https://etherscan.io/tx/${tx.hash}`,
{
  parse_mode: 'HTML',
  link_preview_options: {
    is_disabled: true
  }
});
      
      sentTx.add(tx.hash);
    }
  });

  ws.on('error', (err) => {
    console.error('WS Error:', err.message);
  });
  ws.on('close', () => {
    console.log('❌ WS disconnected');
  });
}

module.exports = startWS;
