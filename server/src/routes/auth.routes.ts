import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { forgotPassword } from "../controllers/auth.controller"; 


const router = Router();

router.post("/register", register); 
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);


export default router;