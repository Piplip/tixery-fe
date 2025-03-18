import SystemHealthStatus from "./SystemHealthStatus.jsx";
import KPIPanel from "./KPIPanel.jsx";
import ResourceUtilization from "./ResourceUtilization.jsx";
import AlertSummary from "./AlertSummary.jsx";
import LinksPanel from "./LinksPanel.jsx";
import ServiceStatus from "./ServiceStatus.jsx";
import {MonitoringContext} from "../../context.js";
import {useEffect, useState} from "react";
import accountAxios, {
    configAxios,
    eventAxios,
    gatewayAxios,
    registryAxios
} from "../../config/axiosConfig.js";

function OverviewDashboard(){
    const [data, setData] = useState({
        health: [],
        metrics: []
    });

    function getMetricsData(){
        Promise.all([
            configAxios.get('/actuator/metrics'),
            registryAxios.get('/actuator/metrics'),
            gatewayAxios.get('/actuator/metrics'),
            accountAxios.get('/actuator/metrics'),
            eventAxios.get('/actuator/metrics')
        ])
            .then((responses) => {
                console.log(responses)
                const metrics = responses.map((response) => response.data);
                setData((prevData) => ({...prevData, metrics}));
            })
            .catch(err => console.log(err));
    }

    // useEffect(() => {
    //     getMetricsData();
    //
    //     const interval = setInterval(() => {
    //         getMetricsData();
    //     }, 30000)
    //
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(250px, 1fr))',
                    gap: '1rem'
                }}
            >
                <MonitoringContext.Provider value={{data}}>
                    <SystemHealthStatus />
                    <KPIPanel />
                    <ResourceUtilization />
                    <ServiceStatus />
                    <AlertSummary />
                    <LinksPanel />
                </MonitoringContext.Provider>
            </div>
        </div>
    );
}

export default OverviewDashboard;