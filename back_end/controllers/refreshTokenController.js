const Alumni = require("../models/Alumni");
const Admin = require("../models/Admin");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const handleAlumniRefreshToken = asyncHandler(async (req, res) => {
    console.log("cookies: ", req.cookies);
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        res.status(401);
        throw new Error("missing cookies");
    }

    const refreshToken = cookies.jwt;

    const foundUser = await Alumni.findOne({
        refreshToken: refreshToken,
    }).exec();

    console.log("found user: ", foundUser);

    if (!foundUser) {
        res.statusCode = 403;
        throw new Error("invalid token");
    }

    const decoded = await jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    if (!decoded || decoded.username !== foundUser.username) {
        res.statusCode(403);
        throw new Error("invalid token");
    }

    const accessToken = jwt.sign(
        { username: foundUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "2h",
        }
    );

    res.status(200).json({
        username: foundUser.username,
        firstName: foundUser.name.firstName,
        lastName: foundUser.name.lastName,
        token: accessToken,
        avatar: foundUser.avatar,
    });
});

const handleAdminRefreshToken = asyncHandler(async (req, res) => {
    //checks if username is taken
    console.log("\n\n\n checking cookies: ");
    console.log(req.cookies ? req.cookies : "none");

    const cookies = req.cookies;
    if (!cookies?.jwt) {
        res.status(401);
        throw new Error("missing cookies");
    }

    const refreshToken = cookies.jwt;

    const foundUser = await Admin.findOne({
        refreshToken: refreshToken,
    }).exec();

    if (!foundUser) {
        res.statusCode = 403;
        throw new Error("no user");
    }

    const decoded = await jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    console.log("decoded ref token: ", decoded);
    console.log("username: ", foundUser.username);

    if (!decoded || decoded.username !== foundUser.username) {
        res.statusCode(403);
        throw new Error("invalid token");
    }

    console.log("decoded username as payload: ", decoded.username);

    const accessToken = jwt.sign(
        { username: decoded.username },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "2h",
        }
    );
    console.log("ref founduser: ", foundUser);

    res.status(200).json({
        username: foundUser.username,
        firstName: foundUser.name.firstName,
        lastName: foundUser.name.lastName,
        token: accessToken,
        avatar: foundUser.avatar,
    });
});

module.exports = { handleAdminRefreshToken, handleAlumniRefreshToken };
