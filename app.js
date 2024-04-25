require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./Routes/user');
const authRoutes = require('./Routes/auth');
const googleRoutes = require('./Routes/googleAuth');
const oAuthRoutes = require('./Routes/oAuth')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const {logger} = require('./Middlewares/logger')
const {contains} = require("validator");
const connectDB = require('./Config/db');
const dashboardRoute = require('./Routes/dashboard')
const passport = require('passport')
const statisticsRoute = require('./Routes/statistiques')
const jobRoute = require('./Routes/job')
const intershipRoute = require('./Routes/intership')
const applicationRoute = require('./Routes/application')
const notificationRoute = require('./Routes/notification')

const CRMRoutes = require('./Routes/CRM')
const ScrapingRoutes = require('./Routes/Scraping')
const gptchatbotRoute = require('./Routes/gptchatbot')
const Conversation = require('./Routes/Conversation')
const Message = require('./Routes/Message')
const Ably = require('ably');
const axios = require('axios');


const app = express();


app.use(cookieParser());

app.use(logger);
connectDB();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(helmet());

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/dashboard', dashboardRoute);
app.use('/google', googleRoutes);
app.use('/oAuth', oAuthRoutes);
app.use('/stats', statisticsRoute);
app.use('/job', jobRoute);
app.use('/intership', intershipRoute);
app.use('/application', applicationRoute);
app.use('/notifications', notificationRoute);

app.use('/CRM', CRMRoutes);
app.use('/Scraping', ScrapingRoutes);app.use('/gptchatbot' , gptchatbotRoute);

const CALENDARIFIC_API_KEY = 'yOmWJv9HZVrQP1BFnqMHLgTWNoVOjLwT';

app.get('/api/holidays', async (req, res) => {
  const country = 'TN'; 
  const year = new Date().getFullYear(); 
  try {
    const response = await axios.get('https://calendarific.com/api/v2/holidays', {
      params: {
        api_key: CALENDARIFIC_API_KEY,
        country,
        year
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
