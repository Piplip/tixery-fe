import {Stack} from "@mui/material";
import {useCallback, useState} from "react";
import "../../styles/browse-events-styles.css"
import EventSuggestion from "../shared/EventSuggestion.jsx";
import debounce from "lodash.debounce";
import {nominatimAxios} from "../../config/axiosConfig.js";
import {getCookie} from "../../common/Utilities.js";

const genres = [
    {type: null, label: 'All', value: 'all'},
    {type: null, label: 'For You', value: 'foryou'},
    {type: 'online', label: 'Online', value: 'online'},
    {type: 'time', label: 'Today', value: 'today'},
    {type: 'time', label: 'This Weekend', value: 'weekend'},
    {type: 'time', label: 'This Week', value: 'week'},
    {type: 'time', label: 'This Month', value: 'month'},
    {type: 'cost', label: 'Free', value: 0},
    {type: 'category', label: 'Music', value: 'music'},
    {type: 'category', label: 'Food & Drink', value: 'food & drink'},
    {type: 'category', label: 'Health', value: 'health'},
    {type: 'category', label: 'Science & Tech', value: 'science & tech'},
    {type: 'category', label: 'Spirituality', value: 'spirituality'},
]

function BrowseEvents(){
    const [active, setActive] = useState({
        type: null,
        value: 'all'
    });
    const [suggestedLocation, setSuggestedLocation] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [location, setLocation] = useState({
        location:  getCookie("user-location").city,
        lat:  getCookie("user-location").lat,
        lon: getCookie("user-location").lon,
    })

    const debouncedApiCall = useCallback(
        debounce((query) => {
            if(query !== ''){
                nominatimAxios
                    .get(`/search?q=${query}&format=json&limit=3&layer=poi,address`)
                    .then((r) => {
                        console.log(r.data)
                        setSuggestedLocation(r.data);
                        setShowSuggestion(true);
                    })
                    .catch((err) => console.log(err));
            }
        }, 500),
        []
    );

    function handleChangeGenre(index){
        setActive(genres[index])
    }

    function handleLocationChange(e) {
        const value = e.target.value;
        setLocation(prev => ({...prev, location: value}))
        debouncedApiCall(value);
    }

    function handleSelectLocation(location){
        setShowSuggestion(false)
        setLocation(prev =>
            ({...prev, location: location.display_name, lat: location.lat, lon: location.lon, locationName: location.name})
        )
    }

    return (
        <div className="browse-events">
            <Stack direction={'row'} className="browse-events__header">
                <p className="browse-events__header-text">Browse events in</p>
                <Stack sx={{position: 'relative'}}>
                    <input
                        value={location.location}
                        onChange={handleLocationChange}
                        type={'text'} placeholder={'City or Zip Code'} className="browse-events__header-input"/>
                    {suggestedLocation.length > 0 && showSuggestion && location &&
                        <Stack className={'relative-suggestion-panel'} rowGap={2}>
                            {suggestedLocation.map((location, index) => (
                                <p key={index}
                                   onClick={() => handleSelectLocation(location)}
                                >{location.display_name}</p>
                            ))}
                        </Stack>
                    }
                </Stack>
            </Stack>
            <Stack direction={'row'} className="browse-events__genres">
                {genres.map((genre, index) => {
                    return <p key={index} className={`browse-events__genre ${active.value === genre.value ? 'browse-events__genre--active' : ''}`}
                              onClick={() => handleChangeGenre(index)}>{genre.label}</p>
                })}
            </Stack>
            <EventSuggestion {...active} lat={location.lat} lon={location.lon}/>
        </div>
    )
}

export default BrowseEvents