import { v4 as uuid } from 'uuid';
import ClientNoteData from '../models/clientNoteData';
import Colors from '../models/colors';
import Coords from '../models/coords';

export default class NoteController {
	private _notes: Note[] = [];

	constructor() {}

	public reset() {
		this._notes = [];
	}

	public get notes(): Note[] {
		return this._notes;
	}

	public get clientNotes(): ClientNoteData[] {
		return this._notes.map((note) => {
			return {
				text: note.text,
				position: note.position,
				colors: note.colors,
				owner: note.owner,
				id: note.id,
			} as ClientNoteData;
		});
	}

	public unselectNote(username: string): Note[] {
		const notes = this._notes.filter((note) => note.owner === username);
		notes.forEach((note) => {
			note.selected = false;
		});
		return notes;
	}

	public addNote(data: ClientNoteData): void {
		const { text, position, colors, owner } = data;
		const newNote = new Note(text, position, colors, owner);
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

	public selectNote(username: string, id: string, select: boolean) {
		const note = this.getNoteByUsernameAndId(id, username);
		if (note) {
			note.selected = select;
		}
	}

	private getNoteByUsernameAndId(id: string, username: string): Note {
		const note = this._notes.find((note) => note.id === id);
		if (note.owner === username) {
			return note;
		}
	}

	public updateNote(username, data) {
		const note = this.getNoteByUsernameAndId(data.id, username);
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

export class Note {
	readonly id: string;
	readonly owner: string;
	private _text: string;
	private _position: Coords;
	private _colors: Colors;
	private _selected: boolean;

	constructor(text: string, position: Coords, colors: Colors, owner: string) {
		this.id = uuid();
		this._text = text;
		this._position = position;
		this._colors = colors;
		this.owner = owner;
		this._selected = true;
	}

	public update(...data: any) {
		if (data?.text) {
			this._text = data.text;
		}
		if (data?.position) {
			this._position = data.position;
		}
		if (data?.colors) {
			this._colors = data.colors;
		}
	}

	set selected(selected: boolean) {
		this._selected = selected;
	}

	get selected(): boolean {
		return this._selected;
	}

	set text(text: string) {
		this._text = text;
	}

	set position(Coords: Coords) {
		this._position = Coords;
	}

	set colors(colors: Colors) {
		this._colors = colors;
	}

	get text(): string {
		return this._text;
	}
	get position(): Coords {
		return this._position;
	}

	get colors(): Colors {
		return this._colors;
	}
}
