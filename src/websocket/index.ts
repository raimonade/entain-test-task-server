import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import ClientCursorData from '../models/clientCursorData';
import ClientNoteData from '../models/clientNoteData';
import ClientUser from '../models/clientUser';
import Coords from '../models/coords';
import App from '../modules/App';
import { Note } from '../modules/notes';
const clients = {};

interface ServerToClientEvents {
	onmouseupdate: (d: ClientCursorData) => void;
	onnotemove: (data: Coords, id: string) => void;
	onnoteselect: (socketId: string, id: string, select: boolean) => void;
	onclientdisconnect: (id: string) => void;
	userLogin: (name: string, id: string) => void;
	newUser: (user: ClientUser) => void;
	onnewnote: (note: ClientNoteData) => void;
	users: (users: ClientUser[]) => void;
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

export default function initWS(server: HTTPServer) {
	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(server);

	io.on('connection', (socket) => {
		socket.on('onJoin', (username) => {
			const clientUser: ClientUser = { username, socketId: socket.id };
			// login user to the app
			App.Instance.login(clientUser);

			// Emit new logged in user
			socket.emit('userLogin', username, socket.id);

			// Broadcast when a user connects
			socket.broadcast.emit('newUser', clientUser);

			// Send users to the client
			const clientUsers = App.Instance.getClientUsers();
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

			// // Send users to the client
			// const clientUsers = App.Instance.getClientUsers();
			// io.emit('users', clientUsers);

			// // Send users notes
			// const clientNotes = App.Instance.getClientNotes();
			// io.emit('notes', clientNotes);

			// // Send users cursors
			// const clientCursors = App.Instance.getClientCursors();
			// io.emit('cursors', clientCursors);
		});
	});
}
