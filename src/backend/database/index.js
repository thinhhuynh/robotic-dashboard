const mongoose = require('mongoose');

import * as models from './models';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/robot-fleet', {});
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    process.exit(1);
  }
};

// module.exports = {
//   connectDB,
//   models: { Robot, },
// };

export {
  connectDB,
  models,
};