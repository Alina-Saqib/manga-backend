import User from './model/userSchema';
import express from 'express';
import bodyParser from 'body-parser';
import RegisterController from 'controller/RegisterController';
import sequelize from './config/connectDB'; 
import auth from './routes/auth';
import manga from './routes/manga';


const PORT = process.env.PORT;


const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

// Parse JSON requests
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));



async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');
        await sequelize.sync();
        console.log('Database synchronized');
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    }
}

initializeDatabase();

sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });

app.get('/',(req,res)=>{
    res.send('Api is running');
})


// Define the authentication routes
app.use('/auth', auth);
app.use('/manga', manga);





