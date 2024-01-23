import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import apiRouter from './router/api/api.js'
import http from 'http';
import {Server} from 'socket.io'
import cors from 'cors'

import init from './router/websocket'

const app = express();
const expressServer = http.createServer(app);
const io = new Server(expressServer, 
    {
        maxHttpBufferSize: 1e8,    // 100 MB
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        },

})

//middlewares
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());


const corsOptions = {
    origin: true,
    credentials: true
}
app.use(cors(corsOptions))
// app.use('/api/login', cors(corsOptions));
// app.use('/api/signup', cors());
// app.use('/api/signout', cors(corsOptions));
// app.use('/api/reset-password', cors());
// app.use('/api', cors(corsOptions))

app.use('/api', apiRouter)

expressServer.listen(80, () => {
    console.log(`App is listening on localhost:80`);
});



io.on('connect', init)
