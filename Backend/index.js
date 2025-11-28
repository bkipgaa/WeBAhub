const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const myProfileRoutes = require('./routes/myProfileRoutes');




const ticketRoutes = require('./routes/ticketRoutes');
const rolesRoute = require('./routes/fetchroleRoutes');
const fetchticketRoutes = require('./routes/fetchticketRoutes');
const fetchInstallationTicket = require('./routes/fetchinstallation_ticket');
const fetchAuthstatus = require('./routes/fetchAuthStatus')
const adminpanel = require('./routes/AdminPanel');
const submit = require('./routes/submit_ticket');
const technician_subservice = require('./routes/fetch_technicians_subservice')
const techniciansservices = require('./routes/fetchTechnicianService');
const techlocation = require('./routes/techlocation')



const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
connectDB();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/profile', myProfileRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/roles', rolesRoute);
app.use('/api/fetchtickets', fetchticketRoutes );
app.use('/api/admin', adminpanel );
app.use('/api/dropdown-options', fetchInstallationTicket );
app.use('/Uploads', express.static('Uploads'));
app.use('/api/submitdetails', submit );
app.use('/api/AuthStatus', fetchAuthstatus)
app.use('/api', technician_subservice)
app.use('/api/technicians', techniciansservices);
app.use('/api/techlocation', techlocation);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
