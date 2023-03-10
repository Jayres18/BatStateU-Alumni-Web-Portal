const express = require("express");
const router = express.Router();
const alumniController = require("../controllers/alumniController");
const refreshTokenController = require("../controllers/refreshTokenController");
const authMiddleware = require("../middleware/authMiddleware");
const logoutController = require("../controllers/logoutController");
const { upload } = require("../configs/multer.js");

router.post("/auth", alumniController.authenticateAlumni);
router.post("/signup", alumniController.createAlumni);
router.get(
    "/account/:username",
    authMiddleware.verifyJWT,
    alumniController.getAlumniUser
);

router.put(
    "/edit",
    // authMiddleware.verifyJWT,
    upload("avatar"),
    alumniController.editAlumni
);
router.get("/refresh", refreshTokenController.handleAlumniRefreshToken);

router.get(
    "/logout",
    authMiddleware.verifyJWT,
    logoutController.handleAlumniLogout
);
router.post(
    "/edit-pass",
    authMiddleware.verifyJWT,
    alumniController.handleEditPass
);

module.exports = router;
