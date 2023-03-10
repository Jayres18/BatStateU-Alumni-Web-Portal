const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const announcementController = require("../controllers/announcementController.js");
const multer = require("multer");
const { upload } = require("../configs/multer.js");

router.get(
    "/",
    announcementController.validate("handleEditAnnouncement"),
    announcementController.handleGetAllAnnouncement
);

router.get(
    "/:id",
    // authMiddleware.verifyJWT,
    announcementController.handleGetOneAnnounncement
);

router.post(
    "/add",
    authMiddleware.verifyJWT,
    upload("announcementImage"),
    announcementController.handlePostAnnouncement
);

router.post(
    "/edit/:id",
    authMiddleware.verifyJWT,
    //     announcementController.validate('handleEditAnnouncement'),
    upload("announcementImage"),
    announcementController.handleEditAnnouncement
);

router.delete(
    "/delete/:id",
    announcementController.validate("handleEditAnnouncement"),
    announcementController.handleDeleteAnnouncement
);

router.get(
    "/image/:filename",
    authMiddleware.verifyJWT,
    announcementController.handleGetAnnouncementImage
);

router.get(
    "/search",
    authMiddleware.verifyJWT,
    announcementController.handleGetAnnouncementsByTitle
);

module.exports = router;
