import express from "express"
import { Router } from "express";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import {authRequired, isAuthorized} from "../middlewares/validateToken.js"
import  checkAuth  from "../middlewares/checkAuth.js";
import { login,
    logout,
    profile,
    register,
    verifyToken,
    confirmar,
    requirePassword,
    validateToken,
    perfil,
    updatePasswordWithToken,fetchLeaderboard,pruebatecnica } from "../controllers/user.controller.js";

const router =express.Router();

router.post("/login", validateSchema(loginSchema), login);
router.post("/forgot-password", requirePassword);
router.get("/pruebatecnica",pruebatecnica)
router.post("/validate-token", validateToken);
router.post("/update-password/:token", updatePasswordWithToken);

router.post("/confirm-account", confirmar);
router.post("/register", validateSchema(registerSchema), register);
router.post("/logout", checkAuth, logout);
router.get("/verify", verifyToken);

router.get("/profile", checkAuth, profile);
router.get("/perfil", checkAuth, perfil);
router.get("/leaderboard",checkAuth, fetchLeaderboard);

export default router;

