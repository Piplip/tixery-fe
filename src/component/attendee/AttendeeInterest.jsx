import {useEffect, useState} from 'react';
import {Button, Stack, Typography, Snackbar, Alert} from "@mui/material";
import { Categories } from "../../common/Data.js";
import "../../styles/attendee-interest-styles.css";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

function AttendeeInterest() {
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate()
    const {t} = useTranslation()

    useEffect(() => {
        if(checkLoggedIn()){
            setLoading(true);
            accountAxiosWithToken.get(`/attendee/interest?udid=${getUserData('userDataID')}`)
                .then(r => {
                    setLoading(false);
                    if(r.data)
                        setSelectedSubCategories(r.data.split(','));
                })
                .catch(e => {
                    console.log(e);
                    setLoading(false);
                });
        }
    }, []);

    const handleSubCategoryClick = (category, subCategory) => {
        const categorySubCategory = `${category}-${subCategory}`;
        setSelectedSubCategories(prevSelected =>
            prevSelected.includes(categorySubCategory)
                ? prevSelected.filter(item => item !== categorySubCategory)
                : [...prevSelected, categorySubCategory]
        );
    };

    function handleSaveInterests(){
        setLoading(true);
        accountAxiosWithToken.post(`/attendee/interest?udid=${getUserData('userDataID')}`, selectedSubCategories.join(','))
            .then(r => {
                console.log(r.data);
                setSuccessMessage(t('attendeeInterest.preferencesUpdated'));
                setLoading(false);
                navigate('/')
            })
            .catch(e => {
                console.log(e);
                setLoading(false);
            });
    }

    return (
        <Stack direction={'row'} className="attendee-interest">
            <Stack justifyContent={'space-between'} className="attendee-interest__header">
                <Stack flexGrow={1} justifyContent={'center'} rowGap={3}>
                    <Typography fontFamily={'Raleway'} lineHeight={1.1} fontSize={60} fontWeight={'bold'} className="attendee-interest__title">{t('attendeeInterest.tellUsWhatYouLove')}</Typography>
                    <Typography variant={'body1'} className="attendee-interest__subtitle">{t('attendeeInterest.customizeRecommendations')}</Typography>
                </Stack>
                <Button variant={'contained'} onClick={handleSaveInterests} disabled={loading}>
                    {loading ? t('attendeeInterest.saving') : t('attendeeInterest.savePreferences')}
                </Button>
            </Stack>
            <Stack rowGap={7.5} className="attendee-interest__categories">
                {Object.keys(Categories).map((category, index) => {
                    if (category === "Other") return null;
                    return (
                        <Stack key={index} className="attendee-interest__category" rowGap={2}>
                            <Typography fontFamily={'Roboto Slab'} fontWeight={'bold'} fontSize={30} className="attendee-interest__category-title">
                                {t(`event-category.${category}`)}
                            </Typography>
                            <Stack direction={'row'} rowGap={2} className="attendee-interest__subcategories" flexWrap={'wrap'}>
                                {Categories[category].map((subCategory, index) => {
                                    const categorySubCategory = `${category}-${subCategory}`;
                                    const isSelected = selectedSubCategories.includes(categorySubCategory);
                                    return (
                                        <p
                                            key={index}
                                            className={`attendee-interest__subcategory ${isSelected ? 'attendee-interest__subcategory__selected' : ''}`}
                                            onClick={() => handleSubCategoryClick(category, subCategory)}
                                        >
                                            {t(`event-category.${subCategory}`)}
                                        </p>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    );
                })}
            </Stack>
            <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Stack>
    );
}

export default AttendeeInterest;