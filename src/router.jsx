import {createBrowserRouter} from "react-router-dom";
import {lazy} from "react";
import ErrorFallback from "./component/shared/ErrorFallback.jsx";
import LoadingFallback from "./component/shared/LoadingFallback.jsx";
import {checkLoggedIn, getUserData} from "./common/Utilities.js";
import {accountAxiosWithToken, eventAxiosWithToken} from "./config/axiosConfig.js";
import dayjs from "dayjs";

const AttendeeHome = lazy(() => import("./component/attendee/AttendeeHome.jsx"));
const LoginSignUp = lazy(() => import("./component/shared/LoginSignUp.jsx"));
const VerifyAccountSuccess = lazy(() => import("./component/shared/VerifyAccountSuccess.jsx"));
const VerifyAccountFailed = lazy(() => import("./component/shared/VerifyAccountFailed.jsx"));
const SelectRole = lazy(() => import("./component/shared/SelectRole.jsx"));
const UserCollectDataTemplate = lazy(() => import("./component/template/UserCollectDataTemplate.jsx"));
const AttendeeCollectnfo = lazy(() => import("./component/attendee/AttendeeCollectnfo.jsx"));
const OrganizerCollectInfo = lazy(() => import("./component/organizer/OrganizerCollectInfo.jsx"));
const OrganizerOverview = lazy(() => import("./component/organizer/OrganizerOverview.jsx"));
const OrganizerTemplate = lazy(() => import("./component/template/OrganizerTemplate.jsx"));
const OrganizerHome = lazy(() => import("./component/organizer/OrganizerHome.jsx"));
const OrganizerSettings = lazy(() => import("./component/organizer/OrganizerSettings.jsx"));
const OrganizerSettingProfile = lazy(() => import("./component/organizer/OrganizerSettingProfile.jsx"));
const OrganizerViewTemplate = lazy(() => import("./component/template/OrganizerViewTemplate.jsx"));
const OrganizerView = lazy(() => import("./component/organizer/OrganizerView.jsx"));
const OrganizerNewProfile = lazy(() => import("./component/organizer/OrganizerNewProfile.jsx"));
const OrganizerEditProfile = lazy(() => import("./component/organizer/OrganizerEditProfile.jsx"));
const CreateEvent = lazy(() => import("./component/organizer/CreateEvent.jsx"));
const OrganizerEvent = lazy(() => import("./component/organizer/OrganizerEvent.jsx"));
const EventView = lazy(() => import("./component/shared/EventView.jsx"));
const EventSearch = lazy(() => import("./component/shared/EventSearch.jsx"));
const RootTemplate = lazy(() => import("./component/template/RootTemplate.jsx"));
const OnlineEventCreatePanel = lazy(() => import("./component/organizer/OnlineEventCreatePanel.jsx"));
const AttendeeFavoriteEvents = lazy(() => import("./component/attendee/AttendeeFavoriteEvents.jsx"));
const AttendeeProfile = lazy(() => import("./component/attendee/AttendeeProfile.jsx"));
const AttendeeFollowedEvents = lazy(() => import("./component/attendee/AttendeeFollowedEvents.jsx"));
const AttendeeContactInfo = lazy(() => import("./component/attendee/AttendeeContactInfo.jsx"));
const AttendeeNotificationSetting = lazy(() => import("./component/attendee/AttendeeNotificationSetting.jsx"));
const AttendeePassword = lazy(() => import("./component/attendee/AttendeePassword.jsx"));
const AttendeePersonalInfo = lazy(() => import("./component/attendee/AttendeePersonalInfo.jsx"));
const AttendeeCreditCard = lazy(() => import("./component/attendee/AttendeeCreditCard.jsx"));
const AttendeeSetPassword = lazy(() => import("./component/attendee/AttendeeSetPassword.jsx"));
const PaymentResponse = lazy(() => import("./component/shared/PaymentResponse.jsx"));
const OrganizerBuildEventPage = lazy(() => import("./component/organizer/OrganizerBuildEventPage.jsx"));
const OrganizerCreateTicket = lazy(() => import("./component/organizer/OrganizerCreateTicket.jsx"));
const OrganizerTicketAdmission = lazy(() => import("./component/organizer/OrganizerTicketAdmission.jsx"));
const OrganizerPublishEvent = lazy(() => import("./component/organizer/OrganizerPublishEvent.jsx"));
const RecurringEventSchedule = lazy(() => import("./component/organizer/RecurringEventSchedule.jsx"));
const OnlineEventPage = lazy(() => import("./component/attendee/OnlineEventPage.jsx"));
const AttendeeInterest = lazy(() => import("./component/attendee/AttendeeInterest.jsx"));
const OrderManagement = lazy(() => import("./component/organizer/OrderManagement.jsx"));
const CreateEventWithAI = lazy(() => import("./component/organizer/CreateEventWithAI.jsx"));
const AIEventPreview = lazy(() => import("./component/organizer/AIEventPreview.jsx"));
const OrganizerReport = lazy(() => import("./component/organizer/OrganizerReport.jsx"));
const AttendeeProfileSettings = lazy(() => import("./component/template/AttendeeProfileSettings.jsx"));
const CreateSeatMap = lazy(() => import("./component/organizer/CreateSeatMap.jsx"));
const Organizer404Page = lazy(() => import("./component/organizer/Organizer404Page.jsx"));
const Attendee404Page = lazy(() => import("./component/attendee/Attendee404Page.jsx"));
const Dashboard = lazy(() => import("./component/dashboard/Dashboard.tsx"));
const MainGrid = lazy(() => import("./component/dashboard/components/MainGrid.js"));
const UserManagement = lazy(() => import("./component/dashboard/components/users/UserManagement.tsx"));
const EventReport = lazy(() => import("./component/dashboard/components/event/EventReport.tsx"));
const EventManagement = lazy(() => import("./component/dashboard/components/event/EventManagement.tsx"));

const routers = createBrowserRouter([
    {path: '/login', element: <LoginSignUp />, errorElement: <ErrorFallback />},
    {path: '/sign-up', element: <LoginSignUp />, errorElement: <ErrorFallback />},
    {path: '/accounts/verify/success', element: <VerifyAccountSuccess />, errorElement: <ErrorFallback />},
    {path: '/accounts/verify/failed', element: <VerifyAccountFailed />, errorElement: <ErrorFallback />},
    {
        path: '/',
        element: <RootTemplate />,
        hydrateFallbackElement: <LoadingFallback />,
        children: [
            {index: true, element: <AttendeeHome />},
            { path: 'error', element: <ErrorFallback /> },
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
            {path: '*', element: <Attendee404Page />}
        ]
    },
    {
        path: 'online/:id/preview',
        hydrateFallbackElement: <LoadingFallback />,
        element: <OnlineEventPage preview={true}/>,
        errorElement: <ErrorFallback />,
        loader: async ({ params }) => {
            const response = await eventAxiosWithToken.get(`/get/online?eid=${params.id}`);
            return response.data;
        }
    },
    {
        path: '/u/interests',
        element: <UserCollectDataTemplate />,
        hydrateFallbackElement: <LoadingFallback />,
        errorElement: <ErrorFallback />,
        children: [
            {index: true, element: <SelectRole />},
            {path: 'info', element: <AttendeeCollectnfo />},
            {path: 'organizer/info', element: <OrganizerCollectInfo />},
        ]
    },
    {
        path: '/organizer/overview',
        errorElement: <ErrorFallback />,
        children: [
            {index: true, element: <OrganizerOverview />},
            {path: '*', element: <Organizer404Page />},
        ]
    },
    {
        path: 'event/create/auto',
        element: <CreateEventWithAI />,
        errorElement: <ErrorFallback />,
    },
    {
        path: 'create/auto/:id/preview',
        element: <AIEventPreview />,
        hydrateFallbackElement: <LoadingFallback />,
        errorElement: <ErrorFallback />,
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
    {path: 'create/seat-map', element: <CreateSeatMap />, errorElement: <ErrorFallback />},
    {
        path: '/organizer',
        element: <OrganizerTemplate />,
        hydrateFallbackElement: <LoadingFallback />,
        errorElement: <ErrorFallback />,
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
                    {path: 'publish', element: <OrganizerPublishEvent />},
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
                    {path: 'publish', element: <OrganizerPublishEvent />},
                ]
            },
            {path: '*', element: <Organizer404Page />},
        ]
    },
    {
        path: '/o',
        element: <OrganizerViewTemplate />,
        hydrateFallbackElement: <LoadingFallback />,
        errorElement: <ErrorFallback />,
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
            },
            {path: '*', element: <Organizer404Page />},
        ]
    },
    {
        path: '/admin',
        element: <Dashboard />,
        hydrateFallbackElement: <LoadingFallback />,
        errorElement: <ErrorFallback />,
        children: [
            {
                index: true, element: <MainGrid />,
                loader: async () => {
                    const [overviewResponse, metricsResponse, analyticsResponse] = await Promise.all([
                        accountAxiosWithToken.get('/admin/overview'),
                        eventAxiosWithToken.get('/admin/metrics'),
                        accountAxiosWithToken.get('/admin/analytics')
                    ]);

                    return {
                        overview: overviewResponse.data,
                        metrics: metricsResponse.data,
                        analytics: analyticsResponse.data
                    };
                }
            },
            {
                path: 'users',
                element: <UserManagement />,
                loader: async ({ request }) => {
                    const url = new URL(request.url);
                    const page = url.searchParams.get('page') || '1';
                    const size = url.searchParams.get('size') || '10';

                    const response = await accountAxiosWithToken.get(`/admin/users?page=${page}&size=${size}`);
                    return response.data;
                }
            },
            {
                path: 'events',
                element: <EventManagement />,
                loader: async ({ request }) => {
                    const url = new URL(request.url);
                    const page = url.searchParams.get('page') || '1';
                    const size = url.searchParams.get('size') || '10';
                    const startDate = url.searchParams.get('start_date') || dayjs().subtract(30, 'day').format('YYYY-MM-DD');
                    const endDate = url.searchParams.get('end_date') || dayjs().format('YYYY-MM-DD');

                    const [statsResponse, eventsResponse] = await Promise.all([
                        eventAxiosWithToken.get(`/admin/event-stats?start_date=${startDate}&end_date=${endDate}`),
                        eventAxiosWithToken.get(`/admin/events?start_date=${startDate}&end_date=${endDate}&page=${page}&size=${size}`)
                    ]);

                    return {
                        stats: statsResponse.data,
                        events: eventsResponse.data
                    };
                }
            },
            {
                path: 'reports',
                element: <EventReport />,
                loader: async ({ request }) => {
                    const url = new URL(request.url);
                    const page = url.searchParams.get('page') || '1';
                    const size = url.searchParams.get('size') || '10';

                    const response = await eventAxiosWithToken.get(`/admin/reports?page=${page}&size=${size}`);
                    return response.data;
                }
            }
        ]
    },
    {path: '*', element: <Attendee404Page />, errorElement: <ErrorFallback />},
]);

export default routers; 