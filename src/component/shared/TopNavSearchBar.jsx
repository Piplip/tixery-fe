import {Alert, Snackbar, Stack, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TurnSharpRightIcon from "@mui/icons-material/TurnSharpRight";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {useCallback, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import debounce from "lodash.debounce";
import {eventAxios, eventAxiosWithToken, locationIQAxios} from "../../config/axiosConfig.js";
import cookie from 'react-cookies'
import {checkLoggedIn, getUserData, getUserLocation} from "../../common/Utilities.js";
import ClearIcon from '@mui/icons-material/Clear';

function TopNavSearchBar(){
    const location = useLocation()
    const navigate = useNavigate()

    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const [searchValue, setSearchValue] = useState(location.search.split('=')[1] || '');
    const [locationValue, setLocationValue] = useState({
        value: '',
    });
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [suggestion, setSuggestion] = useState([]);

    const recentSearchesRef = useRef(null);
    const locationOptionRef = useRef(null);
    const searchBarRef = useRef(null);
    const hasDeleted = useRef(false)

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

    useEffect(() => {
        getUserLocation()
    }, []);

    useEffect(() => {
        setSearchValue(location.search.split('=')[1] || '');
    }, [location]);

    const handleSearchInpClick = () => {
        if(checkLoggedIn() && searchHistory.length === 0 || hasDeleted.current){
            getSearchHistory().then(r => {
                setSearchHistory(r.data)
                hasDeleted.current = false
            })
                .catch(err => console.log(err))
        }
        setShowRecentSearches(true)
        setShowLocationOption(false)
    };

    async function getSearchHistory(){
        return eventAxiosWithToken.get(`/search/history?uid=${getUserData("profileID")}`)
    }

    const handleLocationInpClick = () => {
        setShowLocationOption(true);
        setShowRecentSearches(false);
    };

    const debounceSuggestion = useCallback(
        debounce((query) => {
            if(query !== ''){
                const searchParams = new URLSearchParams({
                    q: query
                })
                if(checkLoggedIn()){
                    searchParams.append('uid', getUserData("profileID"))
                }
                if(locationValue.value === 'Online'){
                    searchParams.append('online', 1)
                    searchParams.append('lat', cookie.load('user-location').lat)
                    searchParams.append('lon', cookie.load('user-location').lon)
                }
                else if(!!locationValue.lat && !!locationValue.lon){
                    searchParams.append('type', 2)
                    searchParams.append('lat', locationValue.lat)
                    searchParams.append('lon', locationValue.lon)
                }
                else{
                    searchParams.append('type', 3)
                    searchParams.append('lat', cookie.load('user-location').lat)
                    searchParams.append('lon', cookie.load('user-location').lon)
                }
                eventAxios.get(`/search/suggestions?` + searchParams)
                    .then((r) => {
                        const data = r.data;
                        let arr = [];
                        let searchIDs = ''
                        for(let i = 0; i < data.length; i++) {
                            const item = data[i]
                            arr.push(item.name);
                            if (item?.location?.location.toLowerCase().includes(query.toLowerCase())) {
                                arr.push(item.location.name);
                            }
                            if (item?.category?.toLowerCase().includes(query.toLowerCase())) {
                                arr.push(item.category);
                            }
                            item?.tags?.forEach((tag) => {
                                if (tag.toLowerCase().includes(query.toLowerCase())) {
                                    arr.push(tag);
                                }
                            });
                            searchIDs += item.event_id + ','
                        }
                        arr = [...new Set(arr)];
                        setSuggestion(arr);
                        setShowRecentSearches(true);
                        sessionStorage.setItem("search-ids", searchIDs);
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
        setLocationValue({value: "Finding your location..."})
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(success, error)
        }
        setShowLocationOption(false)
    }

    function success(position) {
        locationIQAxios
            .get(`https://us1.locationiq.com/v1/reverse?key=pk.5429f7b7973cc17a2b1d22ddcb17f2a4&lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
            .then(r => {
                console.log(r.data)
                cookie.save('user-location', {lat: r.data.lat, lon: r.data.lon}, {path: '/', maxAge: 60 * 60 * 24 * 7})
                setLocationValue({value: r.data.display_name, lat: r.data.lat, lon: r.data.lon})
            })
            .catch(err => console.log(err))
    }

    function error() {
        setShowSnackbar(true)
    }

    function handleSearchChange(e){
        if(e.target.value === ''){
            setLocationValue({value: ''})
        }
        setSuggestion([])
        setSearchValue(e.target.value)
        debounceSuggestion(e.target.value)
    }

    function handleDeleteSearchHistory(id, index){
        const searches = [...searchHistory]
        searches.splice(index, 1)
        setSearchHistory(searches)
        hasDeleted.current = true
        eventAxiosWithToken.post(`/search/history/delete?search-id=${id}`)
            .catch(err => console.log(err))
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
                                        <Stack key={index} flexDirection={'row'} className={'search-result-item'}
                                            onClick={() => {
                                                navigate(`events/search?q=${searchValue}`)
                                                setShowRecentSearches(false)
                                            }}
                                        >
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
                                        {searchHistory.length > 0 ?
                                            <>
                                                <Stack flexDirection={'row'} className={'recent-search__header'}>
                                                    <Typography variant={'h6'}>Recent searches</Typography>
                                                </Stack>
                                                <Stack rowGap={1.25} className={'search-history-wrapper'}>
                                                    {searchHistory.map((s, index) => {
                                                        return (
                                                            <Stack key={index} direction={'row'} justifyContent={'space-between'} alignItems={'center'}
                                                                   style={{width: '100%'}} className={'search-history-item'}
                                                                   onClick={() => {
                                                                       setSearchValue(s.search_term)
                                                                       debounceSuggestion(s.search_term)
                                                                       const searches = [...searchHistory]
                                                                       searches.splice(index, 1)
                                                                       searches.unshift(s)
                                                                       setSearchHistory(searches)
                                                                   }}
                                                            >
                                                                <Stack direction={'row'} columnGap={1.5} alignItems={'center'}>
                                                                    <ScheduleIcon fontSize={'small'}/> <Typography fontSize={'medium'} variant={'caption'}>{s.search_term}</Typography>
                                                                </Stack>
                                                                <ClearIcon fontSize={'small'}
                                                                           onClick={() => handleDeleteSearchHistory(s.search_id, index)}
                                                                />
                                                            </Stack>
                                                        )
                                                    })}
                                                </Stack>
                                            </>
                                            :
                                            <Typography>
                                                No recent searches
                                            </Typography>
                                        }
                                    </Stack>
                                )
                            )
                        }
                    </div>
                    <div style={{position: 'relative'}} ref={locationOptionRef}>
                        <LocationOnIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder="Choose a location"
                               value={locationValue?.value} onChange={(e) => setLocationValue({value: e.target.value})}
                               onClick={handleLocationInpClick}
                        />
                        {showLocationOption &&
                            <Stack className={'drop-down-suggestion'}>
                                <Stack flexDirection={'row'} onClick={handleLocationClick}>
                                    <TurnSharpRightIcon />
                                    <span>Use my current location</span>
                                </Stack>
                                <Stack flexDirection={'row'} onClick={() => {
                                    setLocationValue({value: 'Online'})
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