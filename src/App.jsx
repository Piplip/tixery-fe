import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AttendeeHome from "./component/attendee/AttendeeHome.jsx";
import LoginSignUp from "./component/shared/LoginSignUp.jsx";
import VerifyAccountSuccess from "./component/shared/VerifyAccountSuccess.jsx";
import VerifyAccountFailed from "./component/shared/VerifyAccountFailed.jsx";
import SelectRole from "./component/shared/SelectRole.jsx";
import UserCollectDataTemplate from "./component/template/UserCollectDataTemplate.jsx";
import AttendeeCollectnfo from "./component/attendee/AttendeeCollectnfo.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import OrganizerCollectInfo from "./component/organizer/OrganizerCollectInfo.jsx";
import OrganizerOverview from "./component/organizer/OrganizerOverview.jsx";
import OrganizerTemplate from "./component/template/OrganizerTemplate.jsx";
import OrganizerHome from "./component/organizer/OrganizerHome.jsx";
import OrganizerSettings from "./component/organizer/OrganizerSettings.jsx";
import OrganizerSettingProfile from "./component/organizer/OrganizerSettingProfile.jsx";
import OrganizerViewTemplate from "./component/template/OrganizerViewTemplate.jsx";
import OrganizerView from "./component/organizer/OrganizerView.jsx";
import {accountAxiosWithToken, eventAxiosWithToken} from "./config/axiosConfig.js";
import {checkLoggedIn, configureDayjs, getUserData} from "./common/Utilities.js";
import LoadingFallback from "./component/shared/LoadingFallback.jsx";
import OrganizerNewProfile from "./component/organizer/OrganizerNewProfile.jsx";
import OrganizerEditProfile from "./component/organizer/OrganizerEditProfile.jsx";
import CreateEvent from "./component/organizer/CreateEvent.jsx";
import OrganizerEvent from "./component/organizer/OrganizerEvent.jsx";
import EventView from "./component/shared/EventView.jsx";
import EventSearch from "./component/shared/EventSearch.jsx";
import RootTemplate from "./component/template/RootTemplate.jsx";
import OnlineEventCreatePanel from "./component/organizer/OnlineEventCreatePanel.jsx";
import AttendeeFavoriteEvents from "./component/attendee/AttendeeFavoriteEvents.jsx";
import AttendeeProfile from "./component/attendee/AttendeeProfile.jsx";
import AttendeeFollowedEvents from "./component/attendee/AttendeeFollowedEvents.jsx";
import AttendeeContactInfo from "./component/attendee/AttendeeContactInfo.jsx";
import AttendeeNotificationSetting from "./component/attendee/AttendeeNotificationSetting.jsx";
import AttendeePassword from "./component/attendee/AttendeePassword.jsx";
import AttendeePersonalInfo from "./component/attendee/AttendeePersonalInfo.jsx";
import AttendeeCreditCard from "./component/attendee/AttendeeCreditCard.jsx";
import AttendeeSetPassword from "./component/attendee/AttendeeSetPassword.jsx";
import PaymentResponse from "./component/shared/PaymentResponse.jsx";
import OrganizerBuildEventPage from "./component/organizer/OrganizerBuildEventPage.jsx";
import OrganizerCreateTicket from "./component/organizer/OrganizerCreateTicket.jsx";
import OrganizerTicketAdmission from "./component/organizer/OrganizerTicketAdmission.jsx";
import OrganizerPublishEvent from "./component/organizer/OrganizerPublishEvent.jsx";
import RecurringEventSchedule from "./component/organizer/RecurringEventSchedule.jsx";
import OnlineEventPage from "./component/attendee/OnlineEventPage.jsx";
import AttendeeInterest from "./component/attendee/AttendeeInterest.jsx";
import OrderManagement from "./component/organizer/OrderManagement.jsx";
import "./config/i18nConfig.js";
import CreateEventWithAI from "./component/organizer/CreateEventWithAI.jsx";
import AIEventPreview from "./component/organizer/AIEventPreview.jsx";
import OrganizerReport from "./component/organizer/OrganizerReport.jsx";
import dayjs from "dayjs";
import AttendeeProfileSettings from "./component/template/AttendeeProfileSettings.jsx";
import AdminTemplate from "./component/template/AdminTemplate.jsx";
import OverviewDashboard from "./component/admin/OverviewDashboard.jsx";
import LogManagement from "./component/admin/LogManagement.jsx";
import ServiceDashboard from "./component/admin/ServiceDashboard.jsx";
import CreateSeatMap from "./component/organizer/CreateSeatMap.jsx";

configureDayjs()

dayjs().tz(Intl.DateTimeFormat().resolvedOptions().timeZone)

function App() {
    const routers = createBrowserRouter([
        {path: '/login', element: <LoginSignUp />},
        {path: '/sign-up', element: <LoginSignUp />},
        {path: '/accounts/verify/success', element: <VerifyAccountSuccess />},
        {path: '/accounts/verify/failed', element: <VerifyAccountFailed />},
        {
            path: '/',
            element: <RootTemplate />,
            hydrateFallbackElement: <LoadingFallback />,
            children: [
                {index: true, element: <AttendeeHome />},
                {path: 'payment/:type', element: <PaymentResponse />},
                {path: 'events/search', element: <EventSearch />,},
                {path: 'favorites', element: <AttendeeFavoriteEvents />,},
                {
                    path: 'events/:id', element: <EventView />,
                    hydrateFallbackElement: <LoadingFallback />,
                    loader: async ({ params }) => {
                        const searchParams = new URLSearchParams({
                            eid: params.id,
                            is_organizer: false
                        })
                        if(checkLoggedIn()){
                            searchParams.append('pid', getUserData('profileID'))
                            searchParams.append("tz", new Date().getTimezoneOffset() / -60)
                        }
                        const response = await eventAxiosWithToken.get(`/get/specific?${searchParams}`);
                        return response.data;
                    }
                },
                {
                    path: 'interests',
                    element: <AttendeeInterest />
                },
                {
                    path: 'online/:id',
                    hydrateFallbackElement: <LoadingFallback />,
                    element: <OnlineEventPage preview={false}/>,
                    loader: async ({ params }) => {
                        const response = await eventAxiosWithToken.get(`/get/online?eid=${params.id}`);
                        return response.data;
                    }
                },
                {
                    path: 'account',
                    element: <AttendeeProfileSettings />,
                    children: [
                        {index: true, element: <AttendeeContactInfo />},
                        {path: 'password/set', element: <AttendeeSetPassword />},
                        {path: 'password', element: <AttendeePassword />},
                        {path: 'credit-card', element: <AttendeeCreditCard />},
                        {path: 'email-preferences', element: <AttendeeNotificationSetting />},
                        {path: 'personal-info', element: <AttendeePersonalInfo />},
                    ]
                },
                {
                    path: 'u/:id',
                    element: <AttendeeProfile />
                },
                {
                    path: 'u/:id/following',
                    element: <AttendeeFollowedEvents />
                },
            ]
        },
        {
            path: 'online/:id/preview',
            hydrateFallbackElement: <LoadingFallback />,
            element: <OnlineEventPage preview={true}/>,
            loader: async ({ params }) => {
                const response = await eventAxiosWithToken.get(`/get/online?eid=${params.id}`);
                return response.data;
            }
        },
        {
            path: '/u/interests',
            element: <UserCollectDataTemplate />,
            children: [
                {index: true, element: <SelectRole />},
                {path: 'info', element: <AttendeeCollectnfo />},
                {path: 'organizer/info', element: <OrganizerCollectInfo />},
            ]
        },
        {
            path: '/organizer/overview',
            children: [
                {index: true, element: <OrganizerOverview />}
            ]
        },
        {
            path: 'event/create/auto',
            element: <CreateEventWithAI />
        },
        {
            path: 'create/auto/:id/preview',
            element: <AIEventPreview />,
            hydrateFallbackElement: <LoadingFallback />,
            loader: async ({ params }) => {
                const searchParams = new URLSearchParams({
                    eid: params.id,
                    is_organizer: true
                })
                if(checkLoggedIn()){
                    searchParams.append('pid', getUserData('profileID'))
                }
                const response = await eventAxiosWithToken.get(`/get/specific?${searchParams}`);
                return response.data;
            }
        },
        {path: 'create/seat-map', element: <CreateSeatMap />},
        {
            path: '/organizer',
            element: <OrganizerTemplate />,
            hydrateFallbackElement: <LoadingFallback />,
            children: [
                {
                    index: true,
                    element: <OrganizerHome />,
                    loader: () => accountAxiosWithToken.get(`/organizer/profile?u=${getUserData('sub')}`)
                },
                {
                    path: 'u',
                    element: <OrganizerSettings />,
                    children: [
                        {index: true, element: <OrganizerSettingProfile />,
                            loader: () => accountAxiosWithToken.get('/organizer/profile?u=' + getUserData("sub"))
                        }
                    ]
                },
                {path: 'profile/info', element: <OrganizerNewProfile />},
                {path: 'order-management', element: <OrderManagement />},
                {
                    path: 'profile/info/:id', element: <OrganizerEditProfile />,
                    loader: async ({ params }) => {
                        const profileId = params.id;

                        const response = await accountAxiosWithToken.get(
                            `/organizer/profile/get?pid=${profileId}`
                        );

                        return response.data;
                    },
                },
                {
                    path: 'events', element: <OrganizerEvent />,
                    loader: () => eventAxiosWithToken.get(`/get?uid=${getUserData("userID")}&tz=${(Math.round(new Date().getTimezoneOffset()) / -60)}`)
                },
                {
                    path: 'report', element: <OrganizerReport />,
                    loader: async () => {
                        const params = new URLSearchParams({
                            uid: getUserData("userID"),
                            start: dayjs().subtract(1, 'week').format("YYYY-MM-DDTHH:mm:ssZ"),
                            end: dayjs().format("YYYY-MM-DDTHH:mm:ssZ")
                        })
                        const data = await eventAxiosWithToken.get(`/organizer/report?${params.toString()}`)
                        return data.data.data
                    }
                },
                {
                    path: 'events/:id',
                    element: <CreateEvent />,
                    children: [
                        {index: true, element: <OrganizerBuildEventPage />},
                        {path: 'online', element: <OnlineEventCreatePanel />},
                        {path: 'recurring', element: <RecurringEventSchedule />},
                        {
                            path: 'tickets', element: <OrganizerCreateTicket />,
                            children: [
                                {index: true, element: <OrganizerTicketAdmission />}
                            ]
                        },
                        {path: 'publish', element: <OrganizerPublishEvent />}
                    ]
                },
                {
                    path: 'events/edit/:id',
                    element: <CreateEvent />,
                    loader: ({params}) => eventAxiosWithToken.get(`/get/specific?eid=${params.id}&is_organizer=true`),
                    children: [
                        {index: true, element: <OrganizerBuildEventPage />},
                        {path: 'online', element: <OnlineEventCreatePanel />},
                        {path: 'recurring', element: <RecurringEventSchedule />},
                        {
                            path: 'tickets',
                            element: <OrganizerCreateTicket />,
                            children: [
                                {
                                    index: true,
                                    element: <OrganizerTicketAdmission />
                                }
                            ]
                        },
                        {path: 'publish', element: <OrganizerPublishEvent />}
                    ]
                }
            ]
        },
        {
            path: '/o',
            element: <OrganizerViewTemplate />,
            hydrateFallbackElement: <LoadingFallback />,
            children: [
                {
                    path: ':name', element: <OrganizerView />,
                    loader: async ({ params }) => {
                        const organizerName = params.name;

                        const response = await accountAxiosWithToken.get(
                            `/organizer/profile/get?pid=${organizerName}`
                        )

                        return response.data;
                    },
                }
            ]
        },
        {
            path: 'admin',
            element: <AdminTemplate />,
            children: [
                {index: true, element: <OverviewDashboard />},
                {path: 'logs', element: <LogManagement />},
                {path: ':name/dashboard', element: <ServiceDashboard />}
            ]
        }
    ])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={routers} />
        </LocalizationProvider>
    )
}

export default App
