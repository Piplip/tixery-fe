import AttendeeHero from "./AttendeeHero.jsx";
import BrowseEvents from "./BrowseEvents.jsx";

function AttendeeHome(){
    // TODO: handle the case where user haven't set up roles

    return (
        <div>
            <AttendeeHero />
            <BrowseEvents />
        </div>
    )
}

export default AttendeeHome