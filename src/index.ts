import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql';
import https from 'http';
import bodyParser from 'body-parser';
import { connectDB } from './config/connectDB';
import provider from './routes/providerRoutes';
import game from './routes/gameRoutes';



dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL!;




app.use(bodyParser.json({ limit: "10mb" }));

const server = https.createServer(app);



server.listen(PORT, () => {
    console.log("Server listening on port 5000");
});

connectDB(MONGO_URL);



app.get('/',(req,res)=>{
    res.send('Api is running');
})

app.use('/game-providers', provider);
app.use('/games', game);
