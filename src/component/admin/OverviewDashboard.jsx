import SystemHealthStatus from "./SystemHealthStatus.jsx";
import KPIPanel from "./KPIPanel.jsx";
import ResourceUtilization from "./ResourceUtilization.jsx";
import AlertSummary from "./AlertSummary.jsx";
import LinksPanel from "./LinksPanel.jsx";
import ServiceStatus from "./ServiceStatus.jsx";

function OverviewDashboard(){
    return (
        <div style={{ padding: '1rem' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(250px, 1fr))',
                    gap: '1rem'
                }}
            >
                <SystemHealthStatus />
                <KPIPanel />
                <ResourceUtilization />
                <ServiceStatus />
                <AlertSummary />
                <LinksPanel />
            </div>
        </div>
    );
}

export default OverviewDashboard;