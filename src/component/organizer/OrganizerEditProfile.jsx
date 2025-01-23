import OrganizerProfileForm from "./OrganizerProfileForm.jsx";
import {useLoaderData} from "react-router-dom";

function OrganizerEditProfile(){
    const loaderData = useLoaderData()

    return (
        <div>
            <OrganizerProfileForm profileData={loaderData}/>
        </div>
    )
}

export default OrganizerEditProfile;