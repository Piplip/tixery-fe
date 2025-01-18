import {Stack} from "@mui/material";
import {useState} from "react";
import EventList from "../shared/EventList.jsx";
import "../../styles/browse-events-styles.css"

const genres = [
    'All', 'For You', 'Online', 'Today', 'This Weekend', 'This Week', 'This Month', 'Free', 'Music', 'Food & Drink', 'Health', 'Science & Tech', 'Spirituality'
]

function BrowseEvents(){
    const [active, setActive] = useState(0);
    const [location, setLocation] = useState('')

    return (
        <div className="browse-events">
            <Stack direction={'row'} className="browse-events__header">
                <p className="browse-events__header-text">Browse events in</p>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type={'text'} placeholder={'City or Zip Code'} className="browse-events__header-input"/>
            </Stack>
            <Stack direction={'row'} className="browse-events__genres">
                {genres.map((genre, index) => {
                    return <p key={index} className={`browse-events__genre ${active === index ? 'browse-events__genre--active' : ''}`} onClick={() => setActive(index)}>{genre}</p>
                })}
            </Stack>
            <EventList genre={genres[active]} scope={'popular'}/>
        </div>
    )
}

export default BrowseEvents