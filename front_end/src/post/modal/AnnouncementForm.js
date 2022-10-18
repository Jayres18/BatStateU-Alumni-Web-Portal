import { useState } from "react";
import { client } from "../../api/api";
import { useContext } from "react";
import AnnouncementInputContext from "../../context/AnnouncementInputContext";

const AnnouncementForm = ({ name, endpoint }) => {
    const { announcementInput, setAnnouncementInput } = useContext(
        AnnouncementInputContext
    );

    const [isLoading, setIsLoading] = useState(false);
    // const [announcementData, setAnnouncementData] = useState({
    //     title: "",
    //     body: "",
    //     image: "",
    // });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", announcementInput.title);
        formData.append("body", announcementInput.body);
        formData.append("announcementImage", announcementInput.image);

        const postAnnouncement = async () => {
            try {
                await client.post(endpoint, formData);
            } catch (err) {
                alert("Adding announcement failed.");
                console.log(err);
            } finally {
                setIsLoading(false);
                setAnnouncementInput({});
            }
        };

        postAnnouncement();
    };

    const handleOnChangeTitle = (e) => {
        setAnnouncementInput({ ...announcementInput, title: e.target.value });
    };

    const handleOnChangeDescription = (e) => {
        setAnnouncementInput({ ...announcementInput, body: e.target.value });
    };

    const handleOnChangeFile = (e) => {
        console.log("file: ", e.target.files);
        setAnnouncementInput({
            ...announcementInput,
            image: e.target.files[0],
        });
    };

    return (
        <form
            encType="multipart/form-data"
            className="max-w-xl w-full p-7 bg-white font-poppins"
        >
            <h1 className="text-2xl">{name}</h1>
            <div className="flex flex-col mt-2 ">
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    name="title"
                    className="p-2 rounded border border-grey-300"
                    type="text"
                    placeholder="Enter announcement title here."
                    value={announcementInput.title}
                    onChange={handleOnChangeTitle}
                />
            </div>

            <div className="flex flex-col mt-2">
                <label htmlFor="description">Description</label>
                <textarea
                    className="h-64 p-2 rounded border border-grey-300"
                    id="description"
                    name="description"
                    type="text"
                    placeholder="Enter announcement details here."
                    value={announcementInput.body}
                    onChange={handleOnChangeDescription}
                />
            </div>
            <div className="mt-3">
                <label htmlFor="announcementImage">
                    Choose an announcement image
                </label>
                <input
                    className="text-sm"
                    id="announcementImage"
                    name="announcementImage"
                    type="file"
                    accept=".png, .jpg, .svg"
                    onChange={handleOnChangeFile}
                />
            </div>

            <button
                className="block w-full px-4 py-2 bg-green text-white rounded mt-3"
                onClick={handleSubmit}
            >
                Add Announcement
            </button>
            {isLoading ? "Loading..." : null}
        </form>
    );
};

export { AnnouncementForm };
