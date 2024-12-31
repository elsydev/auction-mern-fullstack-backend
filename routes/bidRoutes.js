import express from "express";
import {authRequired,isAuthorized} from "../middlewares/validateToken.js";
import { placeBid } from "../controllers/bidControllers.js";
import { checkAuctionEndTime } from "../middlewares/checkAuctionEndTime.js";
import  checkAuth  from "../middlewares/checkAuth.js";

const router = express.Router();

router.post("/place/:id",checkAuth,isAuthorized("Bidder"),checkAuctionEndTime, placeBid)
export default router;