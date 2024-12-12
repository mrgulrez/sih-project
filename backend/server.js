import dotenv from "dotenv";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import AuthRegRoutes from './routes/AuthRegRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import fetchRoutes from './routes/fetchRoutes.js';
import indRegRoutes from './routes/indRegRoutes.js';
import otpRoutes from './routes/otpRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGOURI, {
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => console.log(error.message));

app.get('/', (req, res) => {
  res.send('Hello from MERN Project');
});

app.use('/api', accessRoutes);
app.use('/api/auth', AuthRegRoutes);
app.use('/api/user', fetchRoutes);
app.use('/api/individual', indRegRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', contractRoutes);
app.use('/api/otp', otpRoutes);

// import dotenv from "dotenv";
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import https from 'https';
// import fs from 'fs';

// import AuthRegRoutes from './routes/AuthRegRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import accessRoutes from './routes/accessRoutes.js';
// import contractRoutes from './routes/contractRoutes.js';
// import fetchRoutes from './routes/fetchRoutes.js';
// import indRegRoutes from './routes/indRegRoutes.js';

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.use('/uploads', express.static('uploads'));

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGOURI, {
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((error) => console.log(error.message));

// const sslOptions = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem'),
// };

// app.get('/', (req, res) => {
//   res.send('Hello from MERN Project');
// });

// app.use('/api', accessRoutes);
// app.use('/api/auth', AuthRegRoutes);
// app.use('/api/user', fetchRoutes);
// app.use('/api/individual', indRegRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/documents', contractRoutes);

// https.createServer(sslOptions, app).listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });