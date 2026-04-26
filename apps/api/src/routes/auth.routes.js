const { Router } = require("express");
const { nonce, verify, me, demo } = require("../controllers/auth.controller");
const { register, login } = require("../controllers/user.controller");

const router = Router();

router.get("/nonce", nonce);
router.post("/verify", verify);
router.get("/me", me);
router.get("/demo", demo);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
