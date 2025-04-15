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
import {checkLoggedIn, extractCity, getCookie, getUserData, getUserLocation} from "../../common/Utilities.js";
import ClearIcon from '@mui/icons-material/Clear';
import {useTranslation} from "react-i18next";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "@/config/firebaseConfig.js";

initializeApp(firebaseConfig);
const storage = getStorage()

function TopNavSearchBar(){
    const location = useLocation()
    const navigate = useNavigate()

    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const [searchValue, setSearchValue] = useState(location.search.split('=')[1] || '');
    const [locationValue, setLocationValue] = useState({
        value: getCookie('user-location')?.city
    });
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [suggestion, setSuggestion] = useState([]);

    const recentSearchesRef = useRef(null);
    const locationOptionRef = useRef(null);
    const searchBarRef = useRef(null);
    const hasDeleted = useRef(false)

    const {t} = useTranslation()

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
        setSuggestion([])
        setSearchValue(new URLSearchParams(location.search).get('q') || '');
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
                        const events = r.data;
                        let suggestions = [];

                        for(let i = 0; i < events.length; i++) {
                            const event = events[i];
                            suggestions.push({
                                text: event.name,
                                type: 'event',
                                eventId: event.event_id,
                                images: event.images,
                                imageUrl: null
                            });

                            if (event?.location?.location &&
                                event.location.location.toLowerCase().includes(query.toLowerCase())) {
                                suggestions.push({
                                    text: event.location.location,
                                    type: 'location'
                                });
                            }

                            if (event?.category &&
                                event.category.toLowerCase().includes(query.toLowerCase())) {
                                suggestions.push({
                                    text: event.category,
                                    type: 'category'
                                });
                            }

                            event?.tags?.forEach((tag) => {
                                if (tag.toLowerCase().includes(query.toLowerCase())) {
                                    suggestions.push({
                                        text: tag,
                                        type: 'tag'
                                    });
                                }
                            });
                        }

                        suggestions = suggestions.filter((suggestion, index, self) =>
                                index === self.findIndex((s) =>
                                    s.text === suggestion.text && s.type === suggestion.type
                                )
                        );

                        const eventSuggestions = suggestions.filter(s => s.type === 'event' && s.images && s.images.length > 0);

                        Promise.all(
                            eventSuggestions.map(suggestion => {
                                const imageRef = ref(storage, suggestion.images[0]);
                                return getDownloadURL(imageRef)
                                    .then(url => {
                                        suggestion.imageUrl = url;
                                        return suggestion;
                                    })
                                    .catch(() => {
                                        suggestion.imageUrl = "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59";
                                        return suggestion;
                                    });
                            })
                        ).then(() => {
                            setSuggestion(suggestions);
                            setShowRecentSearches(true);
                        });
                    })
                    .catch((err) => console.log(err));
            }
        }, 500),
        [locationValue]
    )
    useEffect(() => {
        return () => debounceSuggestion.cancel();
    }, [debounceSuggestion]);

    function handleLocationClick(){
        setLocationValue({value: t(`topNavSearchBar.findingLocation`)})
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(success, error)
        }
        setShowLocationOption(false)
    }

    function success(position) {
        locationIQAxios
            .get(`https://us1.locationiq.com/v1/reverse?key=pk.5429f7b7973cc17a2b1d22ddcb17f2a4&lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
            .then(r => {
                cookie.save('user-location', {lat: r.data.lat, lon: r.data.lon, city: extractCity(r.data.display_name)}, {path: '/', maxAge: 60 * 60 * 24 * 7})
                setLocationValue({value: r.data.display_name, lat: r.data.lat, lon: r.data.lon})
            })
            .catch(err => console.log(err))
    }

    function error() {
        setShowSnackbar(true)
    }

    function handleSearchChange(e) {
        const newValue = e.target.value;
        setSearchValue(newValue);
        setSuggestion([]);

        if(!location.pathname.includes("/events/search")) {
            const searchParams = new URLSearchParams(location.search);
            if (newValue === '') {
                searchParams.delete('q');
            } else {
                searchParams.set('q', newValue);
                debounceSuggestion(newValue);
            }

            navigate(location.pathname + '?' + searchParams.toString());
        } else {
            if (newValue !== '') {
                debounceSuggestion(newValue);
            }
        }
    }

    function handleDeleteSearchHistory(id, index){
        if(!localStorage.getItem('tk')) return;
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
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={showSnackbar} sx={{ marginTop: '3rem' }}
                autoHideDuration={5000} onClose={() => setShowSnackbar(false)}
            >
                <Alert severity={"error"} variant="filled" sx={{ width: '100%' }}>
                    {t('topNavSearchBar.locationServicesError')}
                </Alert>
            </Snackbar>
            {!location.pathname.includes('organizer') &&
                <Stack direction={'row'} className={'top-nav-input-container'} alignItems={'center'}>
                    <div style={{ position: 'relative', width: '50%' }} ref={recentSearchesRef}>
                        <SearchIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder={t('topNavSearchBar.searchEvents')}
                               value={searchValue} onChange={handleSearchChange}
                               onClick={handleSearchInpClick}
                        />
                        {!location.pathname.includes("/events/search") && showRecentSearches &&
                            (suggestion.length > 0 ?
                                    <Stack className={'drop-down-suggestion'}>
                                        {suggestion.map((s, index) => (
                                            <Stack key={index} flexDirection={'row'} className={'search-result-item'}
                                                   onClick={() => {
                                                       if (s.type === 'event' && s.eventId) {
                                                           navigate(`/events/${s.eventId}`);
                                                       } else {
                                                           navigate(`events/search?q=${s.text}&online=${locationValue.value === 'Online'}`);
                                                       }
                                                       setShowRecentSearches(false);
                                                   }}
                                            >
                                                {s.type === 'event' && s.imageUrl && (
                                                    <div className="search-result-item-image-container">
                                                        <img src={s.imageUrl} alt={s.text} className="search-result-item-image" />
                                                    </div>
                                                )}
                                                {s.type === 'event' && !s.imageUrl && <LiveTvIcon fontSize="small" />}
                                                {s.type === 'location' && <LocationOnIcon fontSize="small" />}
                                                {s.type === 'category' && <TurnSharpRightIcon fontSize="small" />}
                                                {s.type === 'tag' && <SearchIcon fontSize="small" />}
                                                <span title={s.text}>{s.text}</span>
                                                {s.type === 'event' && <Typography
                                                    variant="caption"
                                                    sx={{
                                                        ml: 1,
                                                        color: 'primary.main',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {t('topNavSearchBar.viewEvent')}
                                                </Typography>}
                                            </Stack>
                                        ))}
                                    </Stack>
                                    :
                                    (searchValue !== '' ?
                                            <Stack className={'drop-down-suggestion'}>
                                                <Stack flexDirection={'row'}>
                                                    <span>{t('topNavSearchBar.noResultsFound')}</span>
                                                </Stack>
                                            </Stack>
                                            :
                                            <Stack className={'drop-down-suggestion'}>
                                                {searchHistory.length > 0 ?
                                                    <>
                                                        <Stack flexDirection={'row'} className={'recent-search__header'}>
                                                            <Typography variant={'h6'}>{t('topNavSearchBar.recentSearches')}</Typography>
                                                        </Stack>
                                                        <Stack rowGap={1.25} className={'search-history-wrapper'}>
                                                            {searchHistory.map((s, index) => {
                                                                return (
                                                                    <Stack key={index} direction={'row'} justifyContent={'space-between'} alignItems={'center'}
                                                                           style={{ width: '100%' }} className={'search-history-item'}
                                                                           onClick={() => {
                                                                               setSearchValue(s.search_term);
                                                                               debounceSuggestion(s.search_term);
                                                                               const searches = [...searchHistory];
                                                                               searches.splice(index, 1);
                                                                               searches.unshift(s);
                                                                               setSearchHistory(searches);
                                                                           }}
                                                                    >
                                                                        <Stack direction={'row'} columnGap={1.5} alignItems={'center'}>
                                                                            <ScheduleIcon fontSize={'small'} /> <Typography fontSize={'medium'} variant={'caption'}>{s.search_term}</Typography>
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
                                                        {t('topNavSearchBar.noRecentSearches')}
                                                    </Typography>
                                                }
                                            </Stack>
                                    )
                            )
                        }
                    </div>
                    <div style={{ position: 'relative', width: '50%' }} ref={locationOptionRef}>
                        <LocationOnIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder={t('topNavSearchBar.chooseLocation')}
                               value={locationValue?.value} onChange={(e) => setLocationValue({ value: e.target.value })}
                               onClick={handleLocationInpClick}
                        />
                        {showLocationOption &&
                            <Stack className={'drop-down-suggestion'}>
                                <Stack flexDirection={'row'} onClick={handleLocationClick}>
                                    <TurnSharpRightIcon />
                                    <span>{t('topNavSearchBar.useCurrentLocation')}</span>
                                </Stack>
                                <Stack flexDirection={'row'} onClick={() => {
                                    setLocationValue({ value: 'Online' });
                                    setShowLocationOption(false);
                                }}>
                                    <LiveTvIcon />
                                    <span>{t('topNavSearchBar.browseOnlineEvents')}</span>
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
    );
}

export default TopNavSearchBar;
