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

	public getUserBySocketId(socketId: string): User {
		return this._users.find((user) => {
			if (user.socketId instanceof Array) {
				return user.socketId.includes(socketId);
			} else {
				return user.socketId === socketId;
			}
		});
	}

	public get clientUsers(): ClientUser[] {
		return this._users.map((user) => {
			return {
				username: user.name,
				socketId: user.socketId,
			} as ClientUser;
		});
	}

	public addUser(user: ClientUser): void {
		const newUser = new User(user.username, user.socketId);
		this._users.push(newUser);
	}

	public removeUser(user: User): void {
		const index = this._users.indexOf(user);
		if (index > -1) {
			this._users.splice(index, 1);
		}
	}

	public getUserByName(name: string): User {
		return this._users.find((user) => user.name === name);
	}
}

class User {
	private _name: string;
	private _socketId: string | string[];

	constructor(name: string, socketId: string) {
		this._name = name;
		this._socketId = socketId;
	}

	public connect(socketId: string) {
		if (this._socketId !== null) {
			this._socketId = [...this._socketId, socketId];
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
		} else {
			this._socketId = null;
		}
	}

	get socketId(): string | string[] {
		return this._socketId;
	}

	get name(): string {
		return this._name;
	}

	set name(name: string) {
		this._name = name;
	}
}
