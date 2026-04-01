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

    // 1️⃣ Subscribe ETH pending tx
    // ws.send(JSON.stringify({
    //   jsonrpc: '2.0',
    //   id: 1,
    //   method: 'eth_subscribe',
    //   params: ['newPendingTransactions'],
    // })); {"jsonrpc":"2.0","id": 1, "method": "eth_subscribe", "params": ["logs", {"address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]}]}
    // wscat -c wss://mainnet.infura.io/ws/v3/<YOUR-API-KEY> -x ''

    // 2️⃣ Subscribe ERC20 logs
    ws.send(JSON.stringify({"jsonrpc": "2.0", "id": 1, "method": "eth_subscribe", "params": ["logs", {"address": "0x85b931A32a0725Be14285B66f1a22178c672d69B", "topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55aeea4a7f4f"]}]})

      // {"jsonrpc": "2.0", "id": 1, "method": "eth_subscribe", "params": ["logs", {"address": "0x85b931A32a0725Be14285B66f1a22178c672d69B", "topics":["0xd78a0cb8bb633d06981248b816e7bd33c2a35a6089241d099fa519e361cab902","0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55aeea4a7f4f"]}]}


    //   JSON.stringify({
    //   jsonrpc: "2.0",
    //   id: 1,
    //   method: "eth_subscribe",
    //   params: [
    //     "logs",
    //     {
    //       address: "0x85b931A32a0725Be14285B66f1a22178c672d69B",
    //       topics: [
    //         "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55aeea4a7f4f"
    //       ]
    //     }
    //   ],

    // })

      );
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());
    console.log(msg);

    // Handle transaksi ETH
//     if (msg.method === 'eth_subscription' && typeof msg.params.result === 'string') {
//       const txHash = msg.params.result;
//       sendRPC(ws, 'eth_getTransactionByHash', [txHash], Date.now());
//       return;
//     }
//     if (msg.result && msg.result.hash) {
//       const tx = msg.result;
//       if (!tx.value || tx.value === '0x0') return;
//       if (!tx.to) return;
//       if (tx.input && tx.input !== '0x') return;

//       const from = tx.from?.toLowerCase();
//       const to = tx.to?.toLowerCase();
//       const matched = trackedWallets.find(w => w.address === from || w.address === to);
//       if (!matched) return;

//       const isIncoming = to === matched.address;
//       const eth = parseInt(tx.value, 16) / 1e18;
//       const type = isIncoming ? '🟢 ETH Masuk' : '🔴 ETH Keluar';

//       if (sentTx.has(tx.hash)) return;

//       const price = await getETHPrice();
//       const idr = eth * price;

//       const formatRupiah = new Intl.NumberFormat('id-ID', {
//         style: 'currency',
//         currency: 'IDR',
//         minimumFractionDigits: 0 // Mengatur agar tidak ada ,00 di belakang
//       }).format(idr);

//       await bot.telegram.sendMessage(
//         matched.user_id,
//         `${type}
// ${matched.name}
// ${matched.address}

// Amount: ${eth} ETH (~ ${formatRupiah})
// Tx: https://etherscan.io/tx/${tx.hash}`,
// {
//   parse_mode: 'HTML',
//   link_preview_options: {
//     is_disabled: true
//   }
// });
      
//       sentTx.add(tx.hash);
//       return;
//     }

    // Handle transaksi ERC20
    if (msg.method === 'eth_subscription' && msg.params?.result?.topics) {
      const log = msg.params.result;
      if (!log.topics || log.topics.length < 3) return;
      const from = '0x' + log.topics[1].slice(26);
      const to = '0x' + log.topics[2].slice(26);
      const matched = trackedWallets.find(w => w.address === from.toLowerCase() || w.address === to.toLowerCase());
      if (!matched) return;

      const isIncoming = to.toLowerCase() === matched.address;
      const rawValue = BigInt(log.data);
      const amount = Number(rawValue); // nanti kita adjust
      const type = isIncoming ? '📥 Token Masuk' : '📤 Token Keluar';
      console.log('ERC20 TX:', { from, to, amount });

      if (sentTx.has(log.transactionHash)) return;

  await bot.telegram.sendMessage(
    matched.user_id,
    `${type}
${matched.name}

From: ${from}
To: ${to}

Amount: ${amount}
Tx: https://etherscan.io/tx/${log.transactionHash}`);

  sentTx.add(log.transactionHash);
  return;
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
