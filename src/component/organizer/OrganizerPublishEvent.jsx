import {Box, Checkbox, FormControlLabel, Stack, TextField, Typography} from "@mui/material";
import {Link, NavLink} from "react-router-dom";
import ImageIcon from '@mui/icons-material/Image';
import "../../styles/organizer-publish-event-styles.css"
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Radio, RadioGroup} from "@mui/joy";
import {useContext, useEffect, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import PropTypes from "prop-types";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {Categories, EventType} from "../../common/Data.js";
import {useTranslation} from "react-i18next";

const checkboxStyle = {
    sx: {
        color: 'inherit',
        '&.Mui-checked': {
            color: '#0079c5'
        },
    }
}

const CustomCheckbox = ({checked}) => {
    return (
        <Checkbox disabled checked={checked}
                  icon={<CircleOutlinedIcon />}
                  checkedIcon={<RadioButtonCheckedIcon />}
                  {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    checked: PropTypes.bool,
}

initializeApp(firebaseConfig);
const storage = getStorage()

function OrganizerPublishEvent(){
    const {t} = useTranslation()
    const {data, setData} = useContext(EventContext)
    const [eventImg, setEventImg] = useState(null)

    const availableCategories = Object.keys(Categories);

    const availableSubCategories =
        data.category && Categories[data.category]
            ? Categories[data.category]
            : [];

    useEffect(() => {
        if(data.images && data.images[0] && eventImg === null){
            const imageRef = ref(storage, data.images[0])
            getDownloadURL(imageRef)
                .then((url) => {
                    setEventImg(url)
                })
                .catch(err => console.log(err))
        }
    }, []);

    return (
        <div className="event-publish">
            <div>
                <h2 className="event-publish__heading">
                    {t('eventPublish.almostReady')}
                </h2>
                <p className="event-publish__subheading">
                    {t('eventPublish.reviewSettings')}
                </p>

                <div className="event-publish__container">
                    <Stack sx={{ margin: '1rem 0 1rem 1rem' }}>
                        <Box className="event-publish__details-card">
                            {eventImg ?
                                <img src={eventImg} alt="event" className="event-publish__image" />
                                :
                                <div className="event-publish__image">
                                    <ImageIcon className="event-publish__image-icon" sx={{ fontSize: '3rem' }} />
                                </div>
                            }
                            <div className="event-publish__details">
                                <p className="event-publish__title">{data.eventTitle}</p>
                                <p className="event-publish__datetime">
                                    {dayjs(data.eventDate, 'DD/MM/YYYY').format('dddd, DD MMMM')} • {dayjs(data.eventStartTime, "HH:mm").format("HH:mm")} - {dayjs(data.eventEndTime, "HH:mm").format("HH:mm")} GMT+{data.timezone}
                                </p>
                                <p className="event-publish__online">
                                    {data.locationType === 'venue' ? t('eventPublish.offlineEvent') : t('eventPublish.onlineEvent')}
                                </p>
                                <Stack direction={'row'} justifyContent={'space-between'}>
                                    <div className="event-publish__info">
                                        <span><BookOnlineIcon />
                                            {data?.tickets ?
                                                data.tickets[0]?.price > 0 ? formatCurrency(data.tickets[0]?.price, data.tickets[0]?.currency)
                                                    : data.tickets[0]?.ticketType === 'free' ? t('eventPublish.free') : t('eventPublish.donation')
                                                :
                                                '---'
                                            }
                                        </span>
                                        <span><PersonIcon />{data?.capacity || '---'}</span>
                                    </div>
                                    <Link to="/preview" className="event-publish__preview">
                                        {t('eventPublish.preview')} <OpenInNewIcon />
                                    </Link>
                                </Stack>
                            </div>
                        </Box>
                        <Box className="event-publish__form-section">
                            <h3>{t('eventPublish.organizedBy')}</h3>
                            <Select
                                color="neutral"
                                disabled
                                placeholder={getUserData('profileName')}
                                size="md"
                                variant="soft"
                            >
                            </Select>
                            <p className="event-publish__organizer-info">
                                {t('eventPublish.organizerInfo')}
                            </p>
                            <Link to="/organizer/u" target={'_blank'} className="event-publish__organizer-link">
                                {t('eventPublish.viewOrganizerInfo')}
                            </Link>
                        </Box>
                    </Stack>
                    <Stack className="event-publish__form">
                        <Box className="event-publish__form-section">
                            <h3>{t('eventPublish.eventTypeCategory')}</h3>
                            <p>{t('eventPublish.typeCategoryDescription')}</p>
                            <Stack rowGap={'1rem'}>
                                <Select
                                    color="neutral"
                                    disabled={false}
                                    placeholder={t('eventPublish.type')}
                                    size="md"
                                    variant="soft"
                                    value={data.type}
                                    onChange={(_, val) => setData(prev => ({ ...prev, type: val }))}
                                >
                                    <Option value={''}>{t('eventPublish.selectType')}</Option>
                                    {EventType.map((type) => (
                                        <Option key={type} value={type}>
                                            {t(`event-category.${type}`)}
                                        </Option>
                                    ))}
                                </Select>
                                <Stack direction={'row'} columnGap={2}>
                                    <Select sx={{ width: '100%' }}
                                            color="neutral"
                                            placeholder={t('eventPublish.category')}
                                            size="md"
                                            variant="soft"
                                            value={data.category} disabled={!data.type}
                                            onChange={(_, val) => setData(prev => ({ ...prev, category: val }))}
                                    >
                                        <Option value={''}>{t('eventPublish.selectCategory')}</Option>
                                        {availableCategories.map((category) => (
                                            <Option key={category} value={category}>
                                                {t(`event-category.${category}`)}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Select
                                        sx={{ width: '100%' }}
                                        color="neutral"
                                        placeholder={t('eventPublish.subCategory')}
                                        size="md"
                                        variant="soft"
                                        disabled={!data.category || data.category === 'Other'}
                                        value={data.subCategory}
                                        onChange={(_, val) => setData(prev => ({ ...prev, subCategory: val }))}
                                    >
                                        <Option value={''}>{t('eventPublish.selectSubCategory')}</Option>
                                        {availableSubCategories.map((subCategory) => (
                                            <Option key={subCategory} value={subCategory}>
                                                {t(`event-category.${subCategory}`)}
                                            </Option>
                                        ))}
                                    </Select>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box className="event-publish__form-section">
                            <h3>{t('eventPublish.tags')}</h3>
                            <Typography variant={'caption'}>
                                {t('eventPublish.tagsDescription')}
                            </Typography>
                            <TextField spellCheck={"false"}
                                       value={data.tags}
                                       onChange={(e) => setData(prev => ({ ...prev, tags: e.target.value }))}
                                       multiline
                                       rows={4}
                                       placeholder={t('eventPublish.addSearchKeywords')}
                                       variant="outlined"
                                       helperText={`${t('eventPublish.tagsHelperText')}: ${data?.tags ? data.tags.split(',').filter(tag => tag.trim() !== '').length : 0} / 10`}
                            />
                        </Box>
                    </Stack>
                </div>
            </div>
            <div className="publish-settings">
                <h2 className="publish-settings__heading">{t('eventPublish.publishSettings')}</h2>
                <Stack className="publish-settings__container" direction="row" spacing={4}>
                    <Box className="publish-settings__form">
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>{t('eventPublish.publicPrivate')}</h3>
                            <RadioGroup name="eventPrivacy" defaultValue="public" className={'radio-group'}>
                                <Stack>
                                    <FormControlLabel
                                        value="public"
                                        control={<Radio sx={{ marginRight: 1 }}
                                                        checked={data.eventVisibility === 'public'}
                                                        onClick={() => setData(prev => ({ ...prev, eventVisibility: 'public' }))} />}
                                        label={t('eventPublish.public')}
                                    />
                                    <p className="publish-settings__description">
                                        {t('eventPublish.publicDescription')}
                                    </p>
                                </Stack>
                                <Stack>
                                    <FormControlLabel
                                        value="private"
                                        control={<Radio sx={{ marginRight: 1 }}
                                                        onClick={() => setData(prev => ({ ...prev, eventVisibility: 'private' }))}
                                                        checked={data.eventVisibility === 'private'} />}
                                        label={t('eventPublish.private')}
                                    />
                                    <p className="publish-settings__description">
                                        {t('eventPublish.privateDescription')}
                                    </p>
                                </Stack>
                            </RadioGroup>
                        </Stack>
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>{t('eventPublish.refundPolicy')}</h3>
                            <p className="publish-settings__description">
                                {t('eventPublish.refundPolicyDescription')}
                            </p>
                            <RadioGroup name="allowRefund" className={'radio-group'}
                                        value={data.allowRefund}
                                        onChange={() => {
                                            setData(prev => ({ ...prev, allowRefund: !prev.allowRefund, daysForRefund: prev.allowRefund ? null : 1 }))
                                        }}
                            >
                                <FormControlLabel
                                    value={true}
                                    control={<Radio sx={{ marginRight: 1 }} />}
                                    label={t('eventPublish.allowRefunds')}
                                />
                                <FormControlLabel
                                    value={false}
                                    control={<Radio sx={{ marginRight: 1 }} />}
                                    label={t('eventPublish.dontAllowRefunds')}
                                />
                            </RadioGroup>
                            {data.allowRefund &&
                                <Stack rowGap={.5} marginTop={2}>
                                    <TextField
                                        className="publish-settings__input"
                                        type="number"
                                        value={data.daysForRefund}
                                        onChange={(e) => setData(prev => ({ ...prev, daysForRefund: e.target.value }))}
                                        label={t('eventPublish.daysBeforeEvent')}
                                        error={data.daysForRefund < 1 || data.daysForRefund > 30}
                                        helperText={data.daysForRefund < 1 || data.daysForRefund > 30 ? t('eventPublish.daysBeforeEventHelperText') : ''}
                                        slotProps={{
                                            htmlInput: {
                                                min: 1, max: 30
                                            }
                                        }}
                                    />
                                    <p className="publish-settings__description">
                                        {t('eventPublish.daysBeforeEventDescription')}
                                    </p>
                                </Stack>
                            }
                        </Stack>

                        {data.allowRefund &&
                            <Stack className="publish-settings__section" rowGap={1}>
                                <h3>{t('eventPublish.automateRefunds')}</h3>
                                <p className="publish-settings__description">
                                    {t('eventPublish.automateRefundsDescription')}
                                </p>
                                <RadioGroup name="automateRefunds" defaultValue="manual" className={'radio-group'}
                                            value={data.automatedRefund}
                                            onChange={(e) => setData(prev => ({ ...prev, automatedRefund: e.target.value }))}
                                >
                                    <FormControlLabel
                                        value={true}
                                        control={<Radio sx={{ marginRight: 1 }} />}
                                        label={t('eventPublish.yesAutomateRefunds')}
                                    />
                                    <FormControlLabel
                                        value={false}
                                        control={<Radio sx={{ marginRight: 1 }} />}
                                        label={t('eventPublish.noRespondToRequests')}
                                    />
                                </RadioGroup>
                            </Stack>
                        }

                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>{t('eventPublish.publishTiming')}</h3>
                            <RadioGroup name="publishTiming" defaultValue="now" className={'radio-group'}
                                        value={data.publishType}
                                        onChange={(e) => {
                                            setData(prev => ({ ...prev, publishType: e.target.value }))
                                            if (e.target.value === 'now') {
                                                setData(prev => ({ ...prev, publishDate: null, publishTime: null }))
                                            }
                                        }}
                            >
                                <FormControlLabel
                                    value="now"
                                    control={<Radio sx={{ marginRight: 1 }} />}
                                    label={t('eventPublish.publishNow')}
                                />
                                <FormControlLabel
                                    value="schedule"
                                    control={<Radio sx={{ marginRight: 1 }} />}
                                    label={t('eventPublish.scheduleForLater')}
                                />
                            </RadioGroup>
                            {data.publishType === 'schedule' && (
                                <Stack marginTop={2} direction={'row'} columnGap={1}>
                                    <DatePicker format={'DD/MM/YYYY'} disablePast
                                                value={dayjs(data.publishDate, 'DD/MM/YYYY')}
                                                onChange={(date) => setData(prev => ({ ...prev, publishDate: date.format('DD/MM/YYYY') }))}
                                                slotProps={{
                                                    textField: {
                                                        error: data.publishDate === undefined,
                                                        helperText: data.publishDate === undefined ? t('eventPublish.selectDate') : ''
                                                    }
                                                }}
                                    />
                                    <TimePicker format={'HH:mm'} value={dayjs(data.publishTime, 'HH:mm')} ampm={false}
                                                onChange={(time) => setData(prev => ({ ...prev, publishTime: time.format("HH:mm") }))}
                                                slotProps={{
                                                    textField: {
                                                        error: data.publishTime === undefined,
                                                        helperText: data.publishTime === undefined ? t('eventPublish.selectTime') : ''
                                                    }
                                                }}
                                    />
                                </Stack>
                            )}
                        </Stack>
                    </Box>

                    <Box className="publish-settings__tips">
                        <h3>{t('eventPublish.checkOutTips')} 💡</h3>
                        <NavLink to="/create-promo" className="publish-settings__tip-link">
                            {t('eventPublish.createPromoCodes')}
                        </NavLink>
                        <NavLink to="/customize-order-form" className="publish-settings__tip-link">
                            {t('eventPublish.customizeOrderForm')}
                        </NavLink>
                        <NavLink to="/manage-payments" className="publish-settings__tip-link">
                            {t('eventPublish.managePayments')}
                        </NavLink>
                        <NavLink to="/set-refund-policy" className="publish-settings__tip-link">
                            {t('eventPublish.setRefundPolicy')}
                        </NavLink>
                        <NavLink to="/increase-visibility" className="publish-settings__tip-link">
                            {t('eventPublish.increaseVisibility')}
                        </NavLink>
                        <NavLink to="/safety-plan" className="publish-settings__tip-link">
                            {t('eventPublish.developSafetyPlan')}
                        </NavLink>
                    </Box>
                </Stack>
            </div>
        </div>
    );
}

export default OrganizerPublishEvent