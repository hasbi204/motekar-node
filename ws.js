const WebSocket = require('ws');

const ALCHEMY_WS = process.env.ALCHEMY_WS;

function startWS() {
  const ws = new WebSocket(ALCHEMY_WS);

  ws.on('open', () => {
    console.log('✅ WebSocket connected');

    // subscribe pending tx
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

      // console.log('TX HASH:', txHash);
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
