import {Stack} from "@mui/material";
import {useCallback, useState} from "react";
import "../../styles/browse-events-styles.css"
import EventSuggestion from "../shared/EventSuggestion.jsx";
import debounce from "lodash.debounce";
import {nominatimAxios} from "../../config/axiosConfig.js";
import {getCookie} from "../../common/Utilities.js";
import {useTranslation} from "react-i18next";

function BrowseEvents(){
    const {t} = useTranslation()
    const [active, setActive] = useState({
        type: "self",
        value: 'self'
    });
    const [suggestedLocation, setSuggestedLocation] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [location, setLocation] = useState({
        location:  getCookie("user-location")?.city || '',
        lat:  getCookie("user-location")?.lat || null,
        lon: getCookie("user-location")?.lon || null,
    })

    const genres = [
        { type: "self", labelKey: 'browseEvents.forYou', value: 'self' },
        { type: 'online', labelKey: 'browseEvents.online', value: 'online' },
        { type: 'time', labelKey: 'browseEvents.today', value: 'today' },
        { type: 'time', labelKey: 'browseEvents.thisWeekend', value: 'weekend' },
        { type: 'time', labelKey: 'browseEvents.thisWeek', value: 'week' },
        { type: 'time', labelKey: 'browseEvents.thisMonth', value: 'month' },
        { type: 'cost', labelKey: 'browseEvents.free', value: 0 },
        { type: 'category', value: 'Music' },
        { type: 'category', value: 'Food & Drink' },
        { type: 'category', value: 'Health & Wellness' },
        { type: 'category', value: 'Religion & Spirituality' },
        { type: 'category', value: 'Dinner' },
        { type: 'category', value: 'Travel & Outdoor' }
    ];

    const debouncedApiCall = useCallback(
        debounce((query) => {
            if(query !== '' && !getCookie('user-location')){
                nominatimAxios
                    .get(`/search?q=${query}&format=json&limit=3&layer=poi,address`)
                    .then((r) => {
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
                <p className="browse-events__header-text">{t('browseEvents.browseEventsIn')}</p>
                <Stack sx={{ position: 'relative' }}>
                    <input
                        value={location.location}
                        onChange={handleLocationChange}
                        type={'text'} placeholder={'City or Zip Code'} className="browse-events__header-input" />
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
                              onClick={() => handleChangeGenre(index)}>
                        {genre.type === 'category' ? t(`event-category.${genre.value}`)
                            : t(genre.labelKey)}
                    </p>
                })}
            </Stack>
            <EventSuggestion {...active} lat={location.lat} lon={location.lon} />
        </div>
    );
}

export default BrowseEvents