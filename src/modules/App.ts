import ClientCursorData from '../models/clientCursorData';
import ClientNoteData from '../models/clientNoteData';
import ClientUser from '../models/clientUser';
import Coords from '../models/coords';
import CursorController from './cursors';
import NoteController, { Note } from './notes';
import UserController from './users';

export default class AppController {
	private static _instance: AppController;
	private _userController: UserController;
	private _noteController: NoteController;
	private _cursorController: CursorController;

	public static get Instance(): AppController {
		if (this._instance == null) {
			this._instance = new AppController();
		}
		return this._instance;
	}

	constructor() {
		this._userController = new UserController();
		this._noteController = new NoteController();
		this._cursorController = new CursorController();
	}

	public login(user: ClientUser) {
		const { username, socketId } = user;
		const existingUser = this._userController.getUserByName(username);

		if (existingUser) {
			existingUser.connect(socketId);
			return existingUser;
		}

		const newUser = this._userController.addUser(user);
		return newUser;
	}

	public logout(socketId: string) {
		const existingUser = this._userController.getUserBySocketId(socketId);

		if (existingUser) {
			existingUser.disconnect(socketId);
		}
	}

	public cleanup(socketId: string): Note[] {
		const existingUser = this._userController.getUserBySocketId(socketId);

		if (existingUser) {
			return this._noteController.unselectNote(existingUser.name);
		}
	}

	public removeAccount(user: ClientUser) {
		const existingUser = this._userController.getUserByName(user.username);

		if (existingUser) {
			this._userController.removeUser(existingUser);
		}
	}

	public selectNote(socketId: string, noteId: string, select: boolean) {
		const user = this._userController.getUserBySocketId(socketId);
		if (user) {
			this._noteController.selectNote(user.name, noteId, select);
		}
	}

	public addNote(data: ClientNoteData) {
		this._noteController.addNote(data);
	}

	public removeNote(socketId: string, id: string) {
		const user = this._userController.getUserBySocketId(socketId);
		if (user) {
			this._noteController.removeNote(id, user.name);
		}
	}

	public addCursor(socketId: string, coords: Coords) {
		this._cursorController.addCursor(socketId, coords);
	}

	public removeCursor(socketId: string) {
		this._cursorController.removeCursor(socketId);
	}

	public getNotes() {
		return this._noteController.notes;
	}

	public getUsers() {
		return this._userController.users;
	}

	public getClientUsers() {
		return this._userController.clientUsers;
	}

	public getClientCursors() {
		return this._cursorController.clientCursors;
	}

	public getClientNotes() {
		return this._noteController.clientNotes;
	}

	public reset() {
		this._userController.reset();
		this._noteController.reset();
		this._cursorController.reset();
	}

	public cursorUpdate(data: ClientCursorData) {
		this._cursorController.updateCursor(data);
	}

	public updateNote(socketId: string, data: ClientNoteData) {
		const user = this._userController.getUserBySocketId(socketId);
		if (user) {
			this._noteController.updateNote(user.name, data);
		}
	}

	public movenote(socketId: string, noteId: string, coords: Coords) {
		const user = this._userController.getUserBySocketId(socketId);
		if (user) {
			this._noteController.moveNote(user.name, noteId, coords);
		}
	}
}
