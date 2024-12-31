import express from "express";
import { proofOfCommission} from "../controllers/commissionController.js"
import {authRequired,isAuthorized} from "../middlewares/validateToken.js";
import checkAuth from "../middlewares/checkAuth.js";


const router =express.Router();

router.post("/proof",checkAuth,isAuthorized("Auctioneer"),proofOfCommission)

export default router;