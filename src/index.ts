import express from 'express';
import http from 'http';
import { normalizePort } from './utils/index';
// import initWS from './websocket/index';
import App from './modules/app';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// im gonna host this on different server
app.use(cors());
app.use(bodyParser.json());
// app.enable('trust proxy');
//initialize a simple http server
const server = http.createServer(app);

// import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import ClientCursorData from './models/clientCursorData';
import ClientNoteData from './models/clientNoteData';
import ClientUser from './models/clientUser';
import Coords from './models/coords';
// import App from '../modules/App';
// import { Note } from '../modules/notes';
// const clients = {};

interface ServerToClientEvents {
	onmouseupdate: (d: ClientCursorData) => void;
	onnotemove: (data: Coords, id: string) => void;
	onnoteselect: (socketId: string, id: string, select: boolean) => void;
	onclientdisconnect: (id: string) => void;
	userLogin: (name: string, id: string) => void;
	newUser: (user: ClientUser) => void;
	onnewnote: (note: ClientNoteData) => void;
	users: (users: any) => void;
	notes: (notes: ClientNoteData[]) => void;
	cursors: (cursors: ClientCursorData[]) => void;
	onnoteremove: (id: string) => void;
}

interface ClientToServerEvents {
	hello: () => void;
	onMouseUpdate: (data: ClientCursorData) => void;
	onNoteMove: (position: Coords, id: string) => void;
	onNoteSelected: (id: string, select: boolean) => void;
	onJoin: (username: string) => void;
	newNote: (data: any) => void;
	noteRemove: (id: string) => void;
}

interface InterServerEvents {
	ping: () => void;
}

console.log('init IO');
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', (socket) => {
	socket.on('onJoin', (username) => {
		console.log('user joined:' + username, 'socket id:', socket.id);
		const clientUser: ClientUser = { username, socketId: socket.id };
		// login user to the app
		App.Instance.login(clientUser);
		console.log('LOGIN:');

		// Emit new logged in user
		socket.emit('userLogin', username, socket.id);

		// Broadcast when a user connects
		socket.broadcast.emit('newUser', clientUser);

		// Send users to the client
		const clientUsers = App.Instance.getUsers();
		console.log(clientUsers);

		console.log('BROADCAST NEW USERS:');
		// @ts-ignore
		io.emit('users', clientUsers);

		// Send users notes
		const clientNotes = App.Instance.getClientNotes();
		io.emit('notes', clientNotes);

		// Send users cursors
		const clientCursors = App.Instance.getClientCursors();
		io.emit('cursors', clientCursors);
	});

	// Listen for new Notes
	socket.on('newNote', (data: ClientNoteData) => {
		App.Instance.addNote(data);
		io.emit('onnewnote', data);
	});

	// Listen for new Notes
	socket.on('noteRemove', (id: string) => {
		App.Instance.removeNote(socket.id, id);
		io.emit('onnoteremove', id);
	});

	// Listen for mouse Update
	socket.on('onMouseUpdate', (data: ClientCursorData) => {
		App.Instance.cursorUpdate(data);
		socket.broadcast.emit('onmouseupdate', data);
	});
	// Listen for Moving Note
	socket.on('onNoteMove', (data: Coords, id: string) => {
		App.Instance.movenote(socket.id, id, data);
		socket.broadcast.emit('onnotemove', data, id);
	});
	// Listen for Note Selection
	socket.on('onNoteSelected', (id: string, select: boolean) => {
		App.Instance.selectNote(socket.id, id, select);
		socket.broadcast.emit('onnoteselect', socket.id, id, select);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		// log user out
		// probs overkill, just want to make sure everything gets unselected on logout
		const leftover = App.Instance.cleanup(socket.id);
		if (leftover) {
			leftover.forEach((note) => {
				io.emit('onnoteselect', socket.id, note.id, false);
			});
		}

		App.Instance.logout(socket.id);
		// remove the cursor
		App.Instance.removeCursor(socket.id);

		// emit event for client to remove the cursor and user from list
		socket.broadcast.emit('onclientdisconnect', socket.id);

		const clientUsers = App.Instance.getUsers();
		io.emit('users', clientUsers);

		// Send users notes
		const clientNotes = App.Instance.getClientNotes();
		io.emit('notes', clientNotes);

		// Send users cursors
		const clientCursors = App.Instance.getClientCursors();
		io.emit('cursors', clientCursors);
	});
});

app.get('/reset', (_, res) => {
	App.Instance.reset();
	res.send({ status: 'App succesfully reset' });
});
app.get('/users', (_, res) => {
	const users = App.Instance.getUsers();
	res.send({ users: users });
});
app.post('/register', (req, res) => {
	console.log('register:', req.body);
	const { data: username } = req.body;
	if (username && username !== 'null') {
		App.Instance.addAccount(username);
		console.log('User Registered');
		res.send({ code: 200, status: 'User Registered' });
	} else {
		throw new Error('No username provided');
	}
});

//initialize the WebSocket server instance

//start our server

server.listen(normalizePort(process.env.PORT || 8080), () => {
	const address = server.address();
	const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address?.port}`;
	console.log(`Server started ${bind}`);
});
