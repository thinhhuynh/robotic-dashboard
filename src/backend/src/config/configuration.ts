export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/robot-dashboard',
  },
  websocket: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  },
});