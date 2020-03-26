/* eslint-disable no-console */
import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

mongoose.connect(mongoURI, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log(`Connected to database: ${mongoURI}`);
});
