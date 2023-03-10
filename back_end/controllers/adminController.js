const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const controllersUtilities = require("../utilities/controllersUtilities");
const { body } = require("express-validator");
require("dotenv").config();

const createAdmin = asyncHandler(async (req, res) => {
    const requiredKeys = [
        "firstName",
        "lastName",
        "username",
        "password",
        "avatar",
        "role",
        "phone",
        "cellphone",
        "address",
    ];
    let missingProperty = controllersUtilities.findMissingProp(
        requiredKeys,
        req.body
    );

    // checks if all required data are included
    if (missingProperty.length !== 0) {
        res.status(400);
        throw new Error(
            `missing property for creating alumni: ${missingProperty}`
        );
    }

    //checks if username is taken
    const foundUser = await Admin.findOne({ username: req.body.username });
    if (foundUser) {
        res.status(409);
        throw new Error(`Username ${req.body.username} is taken.`);
    }
    console.log(foundUser);

    const adminRegistrationData = {
        name: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        },
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        refreshToken: "",
        contact: {
            phone: req.body.phone,
            cellphone: req.body.cellphone,
        },
        address: req.body.address,
    };

    //hasing pass

    const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
    adminRegistrationData.password = hashedPass;

    const newAdmin = await Admin.create(adminRegistrationData);
    console.log("newAdmin: ", newAdmin);

    //jwt ref
    const token = jwt.sign(
        { username: newAdmin.username },
        process.env.SECRET_KEY,
        {
            expiresIn: "6h",
        }
    );

    res.status(200).json({
        username: newAdmin.username,
        firstName: newAdmin.name.firstName,
        lastName: newAdmin.name.lastName,
        token: token,
        avatar: "",
    });
});

const authenticateAdmin = asyncHandler(async (req, res) => {
    console.log("authenticateAdmin controller: ", req.body);

    const requiredKeys = ["username", "password"];
    const missingProp = controllersUtilities.findMissingProp(
        requiredKeys,
        req.body
    );

    //check if username and password are in request body
    if (missingProp.length !== 0) {
        res.status(400);
        throw new Error(
            `${missingProp.includes("Username") ? username : ""} ${
                missingProp.includes("password") ? "and Password" : ""
            } ${missingProp.length > 1 ? "are" : "is"} required.`
        );
    }

    const foundUser = await Admin.findOne({ username: req.body.username });

    //check if user exist
    if (!foundUser) {
        res.status(404);
        throw new Error("user does no exist");
    }

    //decrypting pass and comparing to password input
    const matchedPass = await bcrypt.compare(
        req.body.password,
        foundUser.password
    );

    if (!matchedPass) {
        res.status(401);
        throw new Error("Wrong Password");
    }

    //creates token
    const accessToken = jwt.sign(
        { username: foundUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "2h",
        }
    );

    const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "1d",
        }
    );

    //save refresh token in the databse for preventing refresh token reuse, a kind of exploiting resources with refresh token

    console.log("foundUser: ", foundUser);
    foundUser.refreshToken = refreshToken;
    const updatedUser = await foundUser.save();
    console.log("refresh token in authuser: ", updatedUser.refreshToken);

    if (!updatedUser) {
        throw new Error("mongoose did not update refresh token");
    }

    console.log(updatedUser);

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("found user: ", foundUser);

    res.status(200).json({
        username: foundUser.username,
        firstName: foundUser.name.firstName,
        lastName: foundUser.name.lastName,
        token: accessToken,
        avatar: foundUser.avatar,
    });
});

const editAdmin = asyncHandler(async (req, res) => {
    console.log("req: at admin edit", req.body);

    const updateObject = {
        email: req.body.email,
        avatar: req.file.location,
        phone: req.body.phone,
        address: req.body.address,
    };
    const requiredKeys = ["avatar", "address", "phone", "email"];

    let missingProperty = controllersUtilities.findMissingProp(
        requiredKeys,
        updateObject
    );

    // check if required properties are in request body
    if (missingProperty.length !== 0) {
        res.status(400);
        throw new Error(
            `Missing ${
                missingProperty.length > 1 ? "properties" : "property"
            }: ${missingProperty}`
        );
    }

    //filtering out the properties with null values
    const filteredUpdateObj = controllersUtilities.removeEmptyProp({
        ...req.body,
        avatar: req.file.location,
    });

    console.log("updated: ", filteredUpdateObj);
    console.log("user: ", req.user);

    //formatting the objects for $set operator
    const formattedUpdateQuery =
        controllersUtilities.formatUpdateData(filteredUpdateObj);

    console.log("formated!!!!!!: ", formattedUpdateQuery);
    console.log("user: ", req.user);

    const foundUser = await Admin.findOneAndUpdate(
        { username: req.user },
        formattedUpdateQuery,
        { new: true }
    ).exec();

    if (!foundUser) {
        res.status(404);
        throw new Error("User not found and not updated");
    }

    res.status(200).json({
        message: "account Updated",
    });
});

const getAdminUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await Admin.findOne({ username: username }).exec();

    if (!user) {
        res.status(400);
        throw new Error("User not found.");
    }

    res.status(200).json({
        avatar: user.avatar,
        firstname: user.name.firstName,
        lastname: user.name.lastName,
        username: user.username,
        role: user.role,
        address: user.address,
        phone: user.contact.phone,
        cellphone: user.contact.cellphone,
        email: user.contact.email,
    });
});

const handleEditPass = asyncHandler(async (req, res) => {
    console.log("\n\n");
    console.log("at pass \n\n body: ", req.body);
    console.log("user: ", req.user);

    const foundAdmin = await Admin.findOne({ username: req.user });
    if (!foundAdmin) {
        res.status(404);
        throw new Error("Unauthorized");
    }
    const matchedPass = await bcrypt.compare(
        req.body.oldPassword,
        foundAdmin.password
    );

    if (!matchedPass) {
        res.status(401);
        throw new Error("Wrong Old Password");
    }

    const hashedPass = await bcrypt.hash(req.body.newPassword, saltRounds);
    foundAdmin.password = hashedPass;
    await foundAdmin.save();

    res.status(200).json({ message: "Password Updated!" });
});

module.exports = {
    authenticateAdmin,
    createAdmin,
    getAdminUser,
    editAdmin,
    handleEditPass,
};
