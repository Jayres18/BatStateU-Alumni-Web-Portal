const Survey = require("../models/Survey");
const Alumni = require("../models/Alumni");
const asyncHandler = require("express-async-handler");
const { sendVerificationEmail } = require("../mailer.js");

const handleGetAllSurvey = asyncHandler(async (req, res) => {
    const surveys = await Survey.find();
    res.status(200).json(surveys);
});

const handleGetSurvey = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        res.status(400);
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
        res.status(404);
    }

    res.status(200).json(survey);
});

const handlePostSurvey = asyncHandler(async (req, res) => {
    console.log("\n\n\n Post Survey routes");
    if (
        !(
            req.body.title &&
            req.body.description &&
            req.body.gLink &&
            req.body.editableGLink
        )
    ) {
        res.status(400);
    }

    console.log("Post survey data at controller", req.body);

    const survey = await Survey.createAndRecordOnLog(req.body);

    if (!survey) {
        res.sendStatus(400);
    }

    const alumniContacts = await Alumni.find({}, "contact.email -_id");
    const emailList = alumniContacts.map((data) => data.contact.email);

    console.log("survey: ", survey);

    console.log("email list: ", emailList);
    await sendVerificationEmail({
        multipleUsers: emailList,
        surveyTitle: survey.title,
        glink: survey.gLink,
    });

    console.log("survet at controller: ", survey);
    res.status(200).json(survey);
});

const handleEditSurvey = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        res.sendStatus(400);
    }

    const updatedSurvey = await Survey.updateAndRecordOnLog(req.params.id, {
        ...req.body,
    });

    if (!updatedSurvey) {
        res.sendStatus(400);
    }

    console.log("updated survey: ", updatedSurvey);

    res.status(200).json(updatedSurvey);
});

const handleDeleteSurvey = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        res.sendStatus(400);
    }

    const foundSurvey = await Survey.findById({ _id: req.params.id });
    if (!foundSurvey) {
        res.sendStatus(404);
    }

    console.log("found survey: ", foundSurvey);

    await foundSurvey.remove();

    res.sendStatus(200);
});

module.exports = {
    handleGetSurvey,
    handleGetAllSurvey,
    handleEditSurvey,
    handlePostSurvey,
    handleDeleteSurvey,
};
