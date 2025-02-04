import express from 'express';
import cors from 'cors';

import config from './config.js';

import userRoute from './routes/userRoute.js';

import authRoute from './routes/auth.js';

import companyRoute from './routes/company.js';

import collegeRoute from './routes/college.js';

import bodyParser from 'body-parser';

import path from 'path';
import { fileURLToPath } from 'url';

import cron from 'node-cron';
// const { cypherQuerySession } = config;
// import { mergeUserQuery } from './cypher/child.js';
// import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
// for parsing application/json
app.use(
  bodyParser.json({
    limit: '50mb'
  })
);
// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
  })
);

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);

app.use('/api/company', companyRoute);

app.use('/api/college', collegeRoute);

app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

app.listen(config.port, async () => {
  console.log(`Hello the server is live`);
});
