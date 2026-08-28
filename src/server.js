import express from 'express';
import dotenv from 'dotenv';
import connectDb from './startup/db.js';
import configDb from './startup/config.js';
import routes from './startup/routes.js'
import helmet from 'helmet';
import morgan from 'morgan';
import debug from 'debug';
import Joi from 'joi';
import joiObjectId from 'joi-objectid';
import 'express-async-errors';

const Debugger = debug('app:startup'); //$env:DEBUG="app:startup"
Joi.objectId = joiObjectId(Joi);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
connectDb();
configDb();
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    Debugger('Morgan Enabled');
}
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(helmet());
app.use(express.static('public'));
app.use(function(req, res, next) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://hilarious-salamander-ce3491.netlify.app/'
    ];
    const requestOrigin = req.headers.origin;

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
});

routes(app);


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Samurdhi backend',
    status: 'ok',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'samurdhi-backend',
    uptime: process.uptime(),
  });
});

app.listen(port, () => {
  console.log(`Samurdhi backend running on http://localhost:${port}`);
});
