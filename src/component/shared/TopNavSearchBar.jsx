import {Alert, Snackbar, Stack, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TurnSharpRightIcon from "@mui/icons-material/TurnSharpRight";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {useCallback, useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import debounce from "lodash.debounce";
import {eventAxios, locationIQAxios} from "../../config/axiosConfig.js";

function TopNavSearchBar(){
    const location = useLocation()

    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [suggestion, setSuggestion] = useState([]);

    const recentSearchesRef = useRef(null);
    const locationOptionRef = useRef(null);
    const searchBarRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                !recentSearchesRef.current?.contains(event.target) &&
                !locationOptionRef.current?.contains(event.target) &&
                !searchBarRef.current?.contains(event.target)
            ) {
                setShowRecentSearches(false);
                setShowLocationOption(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleSearchInpClick = () => {
        setShowRecentSearches(true);
        setShowLocationOption(false);
    };

    const handleLocationInpClick = () => {
        setShowLocationOption(true);
        setShowRecentSearches(false);
    };

    const debounceSuggestion = useCallback(
        debounce((query) => {
            if(query !== ''){
                eventAxios
                    .get(`/search/suggestions?q=${query}`)
                    .then((r) => {
                        console.log(r.data)
                        const data = r.data;
                        let arr = [];
                        for(let i = 0; i < data.length; i++) {
                            const item = data[i]
                            if (item?.location?.location.toLowerCase().includes(query.toLowerCase())) {
                                arr.push(item.location.name);
                            }
                            if (item?.category?.toLowerCase().includes(query.toLowerCase())) {
                                arr.push(item.category);
                            }
                            if (item?.name?.toLowerCase().includes(query.toLowerCase())) {
                                arr.push(item.name);
                            }
                            item?.tags?.forEach((tag) => {
                                if (tag.toLowerCase().includes(query.toLowerCase())) {
                                    arr.push(tag);
                                }
                            });
                        }
                        setSuggestion(arr);
                        setShowRecentSearches(true);
                    })
                    .catch((err) => console.log(err));
            }
        }, 500),
        []
    )

    useEffect(() => {
        return () => debounceSuggestion.cancel();
    }, [debounceSuggestion]);

    function handleLocationClick(){
        setLocationValue("Finding your location...")
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(success, error)
        }
        setShowLocationOption(false)
    }

    function success(position) {
        console.log(position)
        locationIQAxios
            .get(`https://us1.locationiq.com/v1/reverse?key=pk.5429f7b7973cc17a2b1d22ddcb17f2a4&lat=${position.coords.latitude}&lon=-${position.coords.longitude}&format=json&`)
    }

    function error() {
        setShowSnackbar(true)
    }

    function handleSearchChange(e){
        setSuggestion([])
        setSearchValue(e.target.value)
        debounceSuggestion(e.target.value)
    }

    return (
        <>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={showSnackbar} sx={{marginTop: '3rem'}}
                autoHideDuration={5000} onClose={() => setShowSnackbar(false)}
            >
                <Alert severity={"error"} variant="filled" sx={{ width: '100%'}}>
                    Unable to get your location. Please enable location services in your browser.
                </Alert>
            </Snackbar>
            {!location.pathname.includes('organizer') &&
                <Stack direction={'row'} className={'top-nav-input-container'} alignItems={'center'}>
                    <div style={{position: 'relative'}} ref={recentSearchesRef}>
                        <SearchIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder="Search events"
                               value={searchValue} onChange={handleSearchChange}
                               onClick={handleSearchInpClick}
                        />
                        {showRecentSearches &&
                            (suggestion.length > 0 ?
                                <Stack className={'drop-down-suggestion'}>
                                    {suggestion.map((s, index) => (
                                        <Stack key={index} flexDirection={'row'}>
                                            <span>{s}</span>
                                        </Stack>
                                    ))}
                                </Stack>
                                    :
                                (searchValue !== '' ?
                                    <Stack className={'drop-down-suggestion'}>
                                        <Stack flexDirection={'row'}>
                                            <span>No results found</span>
                                        </Stack>
                                    </Stack>
                                        :
                                    <Stack className={'drop-down-suggestion'}>
                                        <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                            <Typography variant={'h6'}>Recent searches</Typography>
                                            <div style={{color: 'blue'}}>Clear</div>
                                        </Stack>
                                        <Stack>
                                            <Stack direction={'row'} columnGap={1} alignItems={'center'} style={{width: '100%'}}>
                                                <ScheduleIcon /> <Typography variant={'caption'}>Foo</Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                )
                            )
                        }
                    </div>
                    <div style={{position: 'relative'}} ref={locationOptionRef}>
                        <LocationOnIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder="Choose a location"
                               value={locationValue} onChange={(e) => setLocationValue(e.target.value)}
                               onClick={handleLocationInpClick}
                        />
                        {showLocationOption &&
                            <Stack className={'drop-down-suggestion'}>
                                <Stack flexDirection={'row'} onClick={handleLocationClick}>
                                    <TurnSharpRightIcon />
                                    <span>Use my current location</span>
                                </Stack>
                                <Stack flexDirection={'row'} onClick={() => {
                                    setLocationValue('Online')
                                    setShowLocationOption(false)
                                }}>
                                    <LiveTvIcon />
                                    <span>Browse online events</span>
                                </Stack>
                            </Stack>
                        }
                    </div>
                    <div className={'top-nav__search-btn'}>
                        <SearchIcon />
                    </div>
                </Stack>
            }
        </>
    )
}

export default TopNavSearchBar;