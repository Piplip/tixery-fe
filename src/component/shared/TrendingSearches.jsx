import {Stack, Typography} from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Link, useLocation, useNavigate} from "react-router-dom";
import "../../styles/trending-searches-styles.css"
import cookie from "react-cookies";
import {useEffect, useRef, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";

function TrendingSearches(){
    const navigate = useNavigate()
    const location = useLocation()

    const [searchTrends, setSearchTrends] = useState([]);
    const hasFetch = useRef(false)

    useEffect(() => {
        if(!hasFetch.current){
            hasFetch.current = true
            eventAxios.get(`/search/trends?lat=${cookie.load('user-location').lat}&lon=${cookie.load('user-location').lon}`)
                .then(r => {
                    setSearchTrends(r.data)
                })
                .catch(err => console.log(err))
        }
    }, [hasFetch]);

    function handleLinkClick(link) {
        const searchParams = new URLSearchParams(location.search)
        searchParams.set('q', link)
        navigate(`/events/search?${searchParams.toString()}`)
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