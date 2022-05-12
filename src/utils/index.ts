/**
 * @param {string | number} PORT The port to listen on.
 * @return {number} The normalized port number.
 */

export const normalizePort = (PORT: any) => {
	if (isNaN(Number(PORT))) PORT = 8080;

	return PORT;
};

/**
 * @param {string} message The message to parse.
 * @return The parsed JSON object or null.
 */
