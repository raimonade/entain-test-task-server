export const postitColors = {
	default: '#FCF0AD',
	neonYellow: '#E9E74A',
	neonHotPink: '#EE5E9F',
	neonMustard: '#FFDD2A',
	neonPink: '#F59DB9',
	neonOrange: '#F9A55B',
	ultraGreen: '#D0E17D',
	ultraBlue: '#36A9CE',
	ultraPink: '#EF5AA1',
	ultraViolet: '#AE86BC',
	ultraYellow: '#FFDF25',
	tropicalBlue: '#56C4E8',
	tropicalGreen: '#D0E068',
	tropicalViolet: '#CD9EC0',
	tropicalPink: '#ED839D',
	tropicalYellow: '#FFE476',
	sambaYellow: '#CDDD73',
	sambaRed: '#F35F6D',
	sambaOrange: '#FAA457',
	sambaBlue: '#35BEB7',
	sambaViolet: '#D189B9',
};

interface RGB {
	b: number;
	g: number;
	r: number;
}
function rgbToYIQ({ r, g, b }: RGB): number {
	return (r * 299 + g * 587 + b * 114) / 1000;
}
function hexToRgb(hex: string): RGB | undefined {
	if (!hex || hex === undefined || hex === '') {
		return undefined;
	}

	const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: undefined;
}
export function contrast(colorHex: string | undefined, threshold: number = 128): string {
	if (colorHex === undefined) {
		return '#000';
	}

	const rgb: RGB | undefined = hexToRgb(colorHex);

	if (rgb === undefined) {
		return '#000';
	}

	return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}
