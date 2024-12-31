import express from "express";
import {authRequired,isAuthorized} from "../middlewares/validateToken.js";
import {deleteAuctionItem,
    getAllPaymentProofs,
    getPaymentProofDetail,
    updateProofStatus,
    deletePaymentProof,
    fetchAllUsers,
monthlyRevenue} from "../controllers/superAdminController.js"
import  checkAuth  from "../middlewares/checkAuth.js";

const router = express.Router();

router.delete(
    "/auctionitem/delete/:id",
    checkAuth,
    isAuthorized("Super Admin"),
    deleteAuctionItem);

router.get(
    "/paymentproofs/all",
    checkAuth,
    isAuthorized("Super Admin"),
    getAllPaymentProofs,
);
router.get(
    "/paymentproof/:id",
    checkAuth,
    isAuthorized("Super Admin"),
    getPaymentProofDetail,
);
router.put(
    "/paymentproof/status/update/:id",
    checkAuth,
    isAuthorized("Super Admin"),
    updateProofStatus,
);
router.delete(
    "/paymentproof/delete/:id",
    checkAuth,
    isAuthorized("Super Admin"),
    deletePaymentProof,
);

router.get("/users/getall",checkAuth,isAuthorized("Super Admin"),fetchAllUsers);

router.get(
    "/monthlyincome",
    checkAuth,
    isAuthorized("Super Admin"),
    monthlyRevenue
  );
export default router;