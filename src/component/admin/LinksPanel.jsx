import {Link} from "react-router-dom";
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptIcon from '@mui/icons-material/Receipt';

function LinksPanel(){
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Links
                </Typography>
                <Divider sx={{ marginBottom: '1rem' }} />
                <List>
                    <ListItem button component={Link} to="/service1">
                        <ListItemIcon>
                            <DashboardIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Service 1 Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/service2">
                        <ListItemIcon>
                            <StorageIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Service 2 Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/tracing">
                        <ListItemIcon>
                            <TimelineIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Distributed Tracing (Jaeger/Zipkin)" />
                    </ListItem>
                    <ListItem button component={Link} to="/logging">
                        <ListItemIcon>
                            <ReceiptIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Centralized Logging (Kibana/Loki)" />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
}

export default LinksPanel;