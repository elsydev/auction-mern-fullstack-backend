import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import userRouter from "./routes/user.routes.js";
import { errorMiddleware } from "./middlewares/error.js";
import auctionRouter from './routes/auctionItRoutes.js';
import bidRouter from './routes/bidRoutes.js';
import commissionRouter from './routes/commissionRouter.js'
import superAdminRouter from './routes/superAdminRoutes.js'
import {endedAuctionCron} from "./automation/endedAuctionCron.js";
import {verifyCommissionCron} from "./automation/verifyCommissionCron.js"
import conectarDB from "./config/db.js";
dotenv.config();
const app= express();

app.use(cookieParser());
app.use(express.json());
const ACCEPTED_ORIGINS = [
    'http://localhost:5000',
    'http://localhost:4000',
    'http://localhost:1234',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5173/',
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://heartfelt-clafoutis-4aa53b.netlify.app/",
    "https://heartfelt-clafoutis-4aa53b.netlify.app",
    "https://auction-mern-fullstack-backend.onrender.com/",
    "https://auction-mern-fullstack-backend.onrender.com"
     
  ]
/* app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);  */
     app.use(cors({
    origin: (origin, callback) => {
      
  
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      if (!origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
  }))    
app.use(morgan('dev'));

app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));
app.use('/api/user',userRouter);
app.use('/api/auctionitem',auctionRouter);
app.use('/api/bid',bidRouter);
app.use('/api/commission',commissionRouter);
app.use('/api/superadmin',superAdminRouter);
endedAuctionCron();
verifyCommissionCron();
conectarDB(); 
app.use(errorMiddleware);
export default app
