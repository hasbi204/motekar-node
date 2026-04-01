const WebSocket = require('ws');
const ALCHEMY_WS = process.env.ALCHEMY_WS;

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

function startWS() {
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

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.method === 'eth_subscription') {
      const txHash = msg.params.result;
      sendRPC(ws, 'eth_getTransactionByHash', [txHash], Date.now());
      return;
    }
    if (msg.result && msg.result.hash) {
      const tx = msg.result;
      console.log('TX DETAIL:', {
        from: tx.from,
        to: tx.to,
        value: tx.value,
      });
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
