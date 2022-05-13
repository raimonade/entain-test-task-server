import { v4 as uuidv4 } from 'uuid';
import ClientNoteData from '../models/clientNoteData';
import Colors from '../models/colors';
import Coords from '../models/coords';

export default class NoteController {
	private _notes: Note[] = [];

	constructor() {}

	public reset() {
		this._notes = [];
	}

	public get notes() {
		return this._notes;
	}

	public addNote(data: ClientNoteData): void {
		const { id, text, position, colors, owner } = data;
		console.log('new Note data', data);
		const newNote = new Note(id, text, position, colors, owner);
		this._notes.push(newNote);
	}

	public removeNote(id: string, username: string): void {
		const note = this.getNoteByUsernameAndId(id, username);
		if (note) {
			const index = this._notes.indexOf(note);
			if (index > -1) {
				this._notes.splice(index, 1);
			}
		}
	}

	private getNoteByUsernameAndId(id: string, username: string): Note | null {
		const note = this._notes.find((note) => note.id === id);
		if (note && note?.owner === username) {
			return note;
		}
		return null;
	}

	public updateNote(username: string, data: any) {
		const note = this.getNoteByUsernameAndId(data.id, username);
		console.log('username', username);
		console.log('data', data);
		console.log('data', note);
		if (note) {
			note.update(data);
		}
	}

	public moveNote(username: string, id: string, data: Coords) {
		const note = this.getNoteByUsernameAndId(id, username);
		if (note) {
			note.position = data;
		}
	}
}

//  leaving public bc i don't have time to make a proper interface
export class Note {
	readonly id: string;
	readonly owner: string;
	public text: string;
	public position: Coords;
	public colors: Colors;

	constructor(
		id: string = uuidv4(),
		text: string,
		position: Coords,
		colors: Colors,
		owner: string
	) {
		this.id = id;
		this.text = text;
		this.position = position;
		this.colors = colors;
		this.owner = owner;
	}

	public update(data: any) {
		if (data?.text) {
			this.text = data.text;
		}
		if (data?.position) {
			console.log('position', data?.position);
			this.position = data.position;
		}
		if (data?.colors) {
			this.colors = data.colors;
		}
	}
}
