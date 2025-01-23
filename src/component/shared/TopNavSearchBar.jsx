import {Alert, Snackbar, Stack, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TurnSharpRightIcon from "@mui/icons-material/TurnSharpRight";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";

function TopNavSearchBar(){
    const location = useLocation()

    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);

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

    function handleLocationClick(){
        setLocationValue("Finding your location...")
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(success, error)
        }
        setShowLocationOption(false)
    }

    function success(position) {
        console.log(position)
        // const latitude = position.coords.latitude;
        // const longitude = position.coords.longitude;
        // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    }

    function error() {
        setShowSnackbar(true)
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
                               value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                               onClick={handleSearchInpClick}
                        />
                        {showRecentSearches &&
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