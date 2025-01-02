import OrganizerProfileForm from "./OrganizerProfileForm.jsx";
import {useLoaderData} from "react-router-dom";

function OrganizerEditProfile(){
    const loaderData = useLoaderData()

    return (
        <OrganizerProfileForm profileData={loaderData}/>
    )
}

export default OrganizerEditProfile;