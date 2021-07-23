export type TProcess = {
	pid: number,
	ppid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
	// argv: string[],
}
