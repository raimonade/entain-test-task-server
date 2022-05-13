import ClientCursorData from '../models/clientCursorData';
import Coords from '../models/coords';
import cursorStatus from '../models/cursorStatus';

export default class CursorController {
	private _cursors: Cursor[] = [];

	constructor() {}

	public reset() {
		this._cursors = [];
	}

	public get cursors(): Cursor[] {
		return this._cursors;
	}

	public get clientCursors(): ClientCursorData[] {
		return this._cursors.map((cursor) => {
			return {
				coords: cursor.coords,
				socketId: cursor.socketId,
			} as ClientCursorData;
		});
	}

	public addCursor(socketId: string, coords: Coords): void {
		const newCursor = new Cursor(coords, socketId);
		this._cursors.push(newCursor);
	}

	public removeCursor(socketId: string): void {
		const cursor = this.getCursorBySocketId(socketId);
		if (cursor) {
			const index = this._cursors.indexOf(cursor);
			if (index > -1) {
				this._cursors.splice(index, 1);
			}
		}
	}

	private getCursorBySocketId(socketId: string) {
		const cursor = this._cursors.find((cursor) => cursor.socketId === socketId);
		if (!cursor) {
			const newCursor = new Cursor({ x: 0, y: 0 }, socketId);
			this._cursors.push(newCursor);
			return newCursor;
		}
		return cursor;
	}

	public updateCursor(data: ClientCursorData): void {
		if (!data.socketId) {
			return;
		}
		const cursor = this.getCursorBySocketId(data.socketId);
		if (cursor) {
			cursor.coords = data.coords;
		}
	}
}

class Cursor {
	private _coords: Coords;
	readonly socketId: string;
	private _status: cursorStatus;

	constructor(coords: Coords, socketId: string) {
		this._coords = coords;
		this.socketId = socketId;
	}

	public get coords(): Coords {
		return this._coords;
	}

	public get status(): cursorStatus {
		return this._status;
	}

	public set coords(coords: Coords) {
		this._coords = coords;
	}

	public set status(status: cursorStatus) {
		this._status = status;
	}
}
