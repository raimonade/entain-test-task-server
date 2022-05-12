import Colors from 'src/models/colors';
import { contrast, postitColors } from '../utils/colors';
import ClientUser from '../models/clientUser';

export default class UserController {
	private _users: User[] = [];

	constructor() {}

	public reset() {
		this._users = [];
	}

	public get users(): User[] {
		return this._users;
	}

	public getUserBySocketId(socketId: string): User | undefined {
		return this._users.find((user) => {
			if (user.socketId instanceof Array) {
				return user.socketId.includes(socketId);
			} else {
				return user.socketId === socketId;
			}
		});
	}

	public getClientUsers(): ClientUser[] {
		console.log('this._users', this._users);
		return this._users.map((user) => {
			return {
				username: user.name,
				socketId: user.socketId,
			} as ClientUser;
		});
	}

	public addUser(username: string): void {
		const newUser = new User(username);
		this._users.push(newUser);
	}

	public removeUser(user: User): void {
		const index = this._users.indexOf(user);
		if (index > -1) {
			this._users.splice(index, 1);
		}
	}

	public getUserByName(name: string): User | null {
		const user = this._users.find((user) => user.name === name);
		return user ? user : null;
	}
}

class User {
	private _name: string;
	private _socketId: string | string[] | null;
	readonly colors: Colors;

	constructor(name: string) {
		this._name = name;
		this._socketId = null;
		const bgColor =
			Object.values(postitColors)[
				Math.floor(Math.random() * Object.values(postitColors).length)
			];
		const fgColor = contrast(bgColor);
		this.colors = { fgColor, bgColor };
	}

	public connect(socketId: string) {
		if (this._socketId !== null) {
			if (this._socketId instanceof Array) {
				this._socketId = [...this._socketId, socketId];
				return;
			}
			this._socketId = [this._socketId, socketId];
			return;
		}
		this._socketId = socketId;
	}

	public disconnect(socketId: string) {
		if (this._socketId instanceof Array) {
			const index = this._socketId.indexOf(socketId);
			if (index > -1) {
				this._socketId.splice(index, 1);
			}
			if (this._socketId.length === 0) {
				this._socketId = null;
			}
		} else {
			this._socketId = null;
		}
	}

	get socketId(): string | string[] | null {
		return this._socketId;
	}

	get name(): string {
		return this._name;
	}

	set name(name: string) {
		this._name = name;
	}
}
