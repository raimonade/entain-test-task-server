import Coords from './coords';
import cursorStatus from './cursorStatus';

export default interface ClientCursorData {
	coords: Coords;
	socketId: string;
	status: cursorStatus;
}
