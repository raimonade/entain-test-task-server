import express from 'express';
import http from 'http';
import { normalizePort } from './utils/index';
import initWS from './websocket/index';
import App from './modules/app';
import cors from 'cors';

const app = express();

// im gonna host this on different server
app.use(cors());

//initialize a simple http server
const server = http.createServer(app);

initWS(server);

app.get('/reset', (req, res) => {
	const users = App.Instance.reset();
	res.send({ status: 'App succesfully reset' });
});

//initialize the WebSocket server instance

//start our server

server.listen(normalizePort(process.env.PORT || 8080), () => {
	const address = server.address();
	const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address?.port}`;
	console.log(`Server started ${bind}`);
});
