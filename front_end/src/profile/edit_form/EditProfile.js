import { TextInput } from "./TextInput";
import { useState, useContext } from "react";
import { client } from "../../api/api";
import AuthContext from "../../context/AuthContext";
import AdminAuthContext from "../../context/AdminAuthContext";

const EditProfile = ({ user }) => {
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [cellphone, setCellphone] = useState(user.cellphone);
    const [address, setAddress] = useState(user.address);
    const { auth } = useContext(AuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    const endpoint = `/${auth.username ? "alumni/edit" : "admin/edit"}`;
    const token = auth.token ? auth.token : authAdmin.token;

    const submit = (e) => {
        e.preventDefault();
        console.log("submitted");
        if (!email && !phone && !address) {
            alert(" Atleast one input must have.");
            return;
        }

        const postEditData = async () => {
            console.log("api called");
            const res = await client.put(
                `${endpoint}`,
                {
                    avatar: "",
                    address: address,
                    phone: phone,
                    cellphone: cellphone,
                    email: email,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("response: ", res);
            console.log("done..");
            if (res) {
                alert("Saved!");
            }
        };

        postEditData();
    };

    return (
        <>
            <form className="relative inset-0 mx-auto z-50 mx-auto my-20 w-112 bg-grey-100 px-5 py-5 font-poppins flex flex-col border border-grey-200 shadow-sm shadow-grey-400">
                <p className="mb-2 text-2xl text-grey mx-auto">Edit Profile</p>
                <div className="my-3 self-center text-center">
                    <div className="w-32 h-32 bg-black text-white"></div>
                    <p className="text-blue">Change Avatar</p>
                </div>
                <div className="my-2 flex flex-col gap-3">
                    <TextInput
                        value={email}
                        label={"Email"}
                        type={"text"}
                        handleChange={(e) => {
                            console.log("triggered");
                            setEmail(e.target.value);
                        }}
                    />
                    <TextInput
                        value={cellphone}
                        label={"Cellphone"}
                        type={"text"}
                        handleChange={(e) => {
                            console.log("triggered");
                            setCellphone(e.target.value);
                        }}
                    />
                    <TextInput
                        value={phone}
                        label={"Phone"}
                        type={"text"}
                        handleChange={(e) => {
                            console.log("triggered");
                            setPhone(e.target.value);
                        }}
                    />
                    <TextInput
                        value={address}
                        label={"Address"}
                        type={"text"}
                        handleChange={(e) => {
                            console.log("triggered");
                            setAddress(e.target.value);
                        }}
                    />

                    <button
                        className="bg-blue text-white w-24 py-1 font-poppins text-sm rounded self-center"
                        onClick={submit}
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    );
};

export { EditProfile };
