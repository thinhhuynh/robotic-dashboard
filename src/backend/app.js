const { App } = require('uWebSockets.js');
const qs = require('node:querystring');
const { connectDB } = require('./database/index.js');

const PORT = process.env.PORT || 8080;

const app = App({
  // Configure for production
  maxCompressedSize: 64 * 1024,
  maxBackpressure: 64 * 1024,
}).ws('/robots', {
  // Robot WebSocket connection handler
  message: async (ws, message) => {
    try {
      const data = JSON.parse(Buffer.from(message).toString());
      console.log(`Received data from ${ws.robotId}:`, data);
    } catch (error) {
      console.error('Error processing robot message:', error);
    }
  },

  open: (ws) => {
    console.log(`Robot ${ws.robotId} connected`);
  },

  upgrade: (res, req, context) => {
    const upgradeAborted = { aborted: false };
    const secWebSocketKey = req.getHeader('sec-websocket-key');
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
    const query = qs.parse(req.getQuery()) || {};

    setTimeout(async () => {
      if (upgradeAborted.aborted) return;
      res.cork(async () => {
        res.upgrade(
          {
            robotId: query.robotId,
          },
          secWebSocketKey,
          secWebSocketProtocol,
          secWebSocketExtensions,
          context
        );
      });
    }, 300);

    res.onAborted(() => {
      upgradeAborted.aborted = true;
    });
  },

  close: (ws) => {
    console.log(`Robot ${ws.robotId} disconnected`);
  }
}).ws('/dashboard', {
  message: (ws, message) => {
    try {
      const data = JSON.parse(Buffer.from(message).toString());
      // TODO: Handle dashboard-specific messages
      console.log('Dashboard message:', data);
    } catch (error) {
      console.error('Error processing dashboard message:', error);
    }
  },

  open: (ws) => {
    console.log('Dashboard client connected');
  },

  close: (ws, code, message) => {
    console.log('Dashboard client disconnected');
  }

}).listen(PORT, (token) => {
  if (token) {
    console.log(`🚀 Robot Fleet Server listening on port ${PORT}`);
  } else {
    console.log('❌ Failed to listen on port', PORT);
    process.exit(1);
  }
});

// Initialize database connection
connectDB().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📛 Shutting down server...');
  process.exit(0);
});

module.exports = app;
