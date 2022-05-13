import Colors from './colors';
import Coords from './coords';

export default interface ClientNoteData {
	id: string;
	text: string;
	position: Coords;
	colors: Colors;
	owner: string;
}
