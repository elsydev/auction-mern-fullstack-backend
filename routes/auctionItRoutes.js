import express from "express";
//import {isAuthenticated,isAuthorized} from "../middlewares/checkAuth.js"
import {authRequired,isAuthorized} from '../middlewares/validateToken.js';
import  checkAuth  from "../middlewares/checkAuth.js";
import {addNewAuctionItem,
    getAllItems,
    getMyAuctionItems,
    getAuctionDetails,
    removeFromAuction,
    republishItem} from "../controllers/auctionItController.js"
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js";



const router = express.Router();

router.post(
    "/create"
    ,checkAuth,
    isAuthorized("Auctioneer"),
    trackCommissionStatus,
    addNewAuctionItem);
router.get("/allitems",getAllItems);
router.get("/auction/:id",checkAuth,getAuctionDetails);
router.get("/myitems",checkAuth,isAuthorized("Auctioneer"),getMyAuctionItems);
router.delete("/remove/:id",checkAuth,isAuthorized("Auctioneer"),removeFromAuction);
router.put("/republish/:id",checkAuth,isAuthorized("Auctioneer"),republishItem)

export default router;