import { createApp } from './app.js';
import { connectDatabase, setupDatabaseListeners } from './config/database.js';
const port = process.env.PORT || 4000;
const useMongo = process.env.USE_MONGO === 'true';

if (useMongo) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vpp-dispatch';
  
  setupDatabaseListeners();
  
  connectDatabase(mongoUri)
    .then(() => {
      const app = createApp({ useMongo: true });
      app.listen(port, () => {
        console.log(`ShineHub VPP dispatch API listening on http://localhost:${port} (MongoDB mode)`);
      });
    })
    .catch((err) => {
      console.error('Critical database connection failure. Exiting app.');
      console.error(err.message);
      process.exit(1);
    });
} else {
  console.log('Running ShineHub VPP dispatch API in local IN-MEMORY mode.');
  const app = createApp({ useMongo: false });
  app.listen(port, () => {
    console.log(`ShineHub VPP dispatch API listening on http://localhost:${port} (InMemory mode)`);
  });
}

