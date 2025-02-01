import {Stack, Typography} from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Link, useNavigate} from "react-router-dom";
import "../../styles/trending-searches-styles.css"
import cookie from "react-cookies";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";

function TrendingSearches(){
    const navigate = useNavigate()

    const [searchTrends, setSearchTrends] = useState([]);

    useEffect(() => {
        eventAxios.get(`/search/trends?lat=${cookie.load('user-location').lat}&lon=${cookie.load('user-location').lon}`)
            .then(r => {
                console.log(r.data)
                setSearchTrends(r.data)
            })
            .catch(err => console.log(err))
    }, []);

    function handleLinkClick(link) {
        const searchParams = new URLSearchParams({
            q: link
        })
        if(checkLoggedIn()){
            searchParams.append('uid', getUserData("profileID"))
        }
        searchParams.append('type', 3)
        searchParams.append('lat', cookie.load('user-location').lat)
        searchParams.append('lon', cookie.load('user-location').lon)
        eventAxios.get(`/search/suggestions?` + searchParams)
            .then((r) => {
                const data = r.data;
                let searchIDs = ''
                for(let i = 0; i < data.length; i++) {
                    searchIDs += data[i].event_id + ','
                }
                sessionStorage.setItem("search-ids", searchIDs);
                navigate(`/events/search?q=${link}`)
            })
            .catch((err) => console.log(err));
    }

    return (
        <Stack style={{paddingBlock: '1rem', width: '100%'}} rowGap={2}>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                    <Typography variant={'h5'}>Trends in {cookie.load('user-location').city}</Typography> <TrendingUpIcon />
                </Stack>
                <Link to={'#'} className={'link'}>
                    <Stack direction={'row'} alignItems={'center'}>
                        Explore more trends <KeyboardArrowRightIcon />
                    </Stack>
                </Link>
            </Stack>
            <Stack>
                <div className={'trending-searches'}>
                    {searchTrends.map((item, index) => {
                        let className = 'trending-searches__item';
                        if (index < 3) {
                            className += ' trending-searches__item-hot';
                        }
                        return (
                            <div key={index} className={className} onClick={() => handleLinkClick(item.search_term)}>
                                {index+1}. {item.search_term}
                            </div>
                        );
                    })}
                </div>
            </Stack>
        </Stack>
    )
}

export default TrendingSearches;