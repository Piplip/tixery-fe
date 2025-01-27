import {Stack, Typography} from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Link} from "react-router-dom";
import "../../styles/trending-searches-styles.css"
import cookie from "react-cookies";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";

function TrendingSearches(){
    const [searchTrends, setSearchTrends] = useState([]);

    useEffect(() => {
        eventAxios.get(`/search/trends?lat=${cookie.load('user-location').lat}&lon=${cookie.load('user-location').lon}`)
            .then(r => {
                console.log(r.data)
                setSearchTrends(r.data)
            })
            .catch(err => console.log(err))
    }, []);

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
                            <Link to={'#'} key={index} className={className}>
                                {index+1}. {item.search_term}
                            </Link>
                        );
                    })}
                </div>
            </Stack>
        </Stack>
    )
}

export default TrendingSearches;