const mongoose = require("mongoose");
const { Schema } = mongoose;
const ActivityLog = require("./ActivityLog");
const Admin = require("../models/Admin");
const controllersUtilities = require("../utilities/controllersUtilities");

const announcementSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: String,
        body: String,
        author: String,
    },
    { timestamps: true }
);

//creates a record on activity log after the announcement is created
announcementSchema.statics.createAndRecordOnLog = async (
    announcemenData,
    imageUrl
) => {
    const announcement = await Announcement.create({
        title: announcemenData.title,
        image: imageUrl,
        body: announcemenData.body,
        author: announcemenData.author,
    });

    if (!announcement) {
        throw new Error("Announcement not found");
    }

    const activityLog = await ActivityLog.create({
        user: announcement.author,
        activity: "Create",
        entry: "Announcement",
        description: `Title: ${announcement.title}`,
    });

    if (!activityLog) {
        throw new Error("error on activity log document");
    }

    return announcement;
};

announcementSchema.statics.updateAndRecordOnLog = async (
    id,
    announcementData
) => {
    const filteredAnnouncementData =
        controllersUtilities.removeEmptyProp(announcementData);
    const formattedAnnouncementQuery = controllersUtilities.formatUpdateData(
        filteredAnnouncementData
    );

    const announcement = await Announcement.findByIdAndUpdate(
        { _id: id },
        {
            $set: formattedAnnouncementQuery,
        },
        {
            new: true,
        }
    );
    if (!announcement) {
        throw new Error("Announcement not found");
    }

    const activityLog = await ActivityLog.create({
        dateCreated: announcement.dateCreated,
        user: announcement.author,
        activity: "Edit",
        entry: "Announcement",
        description: announcementData.description,
    });

    if (!activityLog) {
        throw new Error("error on activity log document");
    }

    console.log("Activity Log: ", activityLog);

    return announcement;
};

announcementSchema.pre("remove", async function (next) {
    console.log("REMOVE MIDDLEWARE INVOKED!!!");
    const announcement = this;
    const activityLog = await ActivityLog.create({
        dateCreated: announcement.dateCreated,
        user: announcement.author,
        activity: "Delete",
        entry: "Announcement",
        description: `Remove Announcement: ${announcement.title}`,
    });

    if (!activityLog) {
        throw new Error("error on activity log document");
    }

    next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
