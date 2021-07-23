import {TProcess} from './contracts'
import {argvToString} from './parseArgv'
import {asPromise} from './helpers'
import fs from 'fs'
import path from 'path'

// The `ps-tree` module behaves differently on *nix vs. Windows
// by spawning different programs and parsing their output.
//
// Linux:
// 1. " <defunct> " need to be striped
// ```bash
// $ ps -A -o comm,ppid,pid,stat
// COMMAND          PPID   PID STAT
// bbsd             2899 16958 Ss
// watch <defunct>  1914 16964 Z
// ps              20688 16965 R+
// ```
//
// Darwin:
// $ ps -A -o comm,ppid,pid,stat
// COMM              PPID   PID STAT
// /sbin/launchd        0     1 Ss
// /usr/libexec/Use     1    43 Ss

export async function psUnix(): Promise<TProcess[]> {
	const dirs = (await asPromise<string[]>(callback => fs.readdir('/proc', callback)))

	const processes = (await Promise.all(dirs.map(async dir => {
		let cmdline: string
		let status: string
		try {
			const pid = parseInt(dir, 10)
			if (!Number.isFinite(pid)) {
				return null
			}

			[cmdline, status] = await Promise.all([
				asPromise<string>(callback => fs.readFile(path.join('/proc', dir, 'cmdline'), {encoding: 'utf-8'}, callback)),
				asPromise<string>(callback => fs.readFile(path.join('/proc', dir, 'status'), {encoding: 'utf-8'}, callback)),
			])
			const ppid = parseInt(status.match(/(?<=(^|[\n\u0000])[ \t\u0000]*PPid:[ \t\u0000]*)\d+\b/ig)[0], 10)
			if (!Number.isFinite(ppid)) {
				console.error('ppid=' + ppid)
				return null
			}

			const argv = cmdline.replace(/[\s\u0000]+$/g, '').split('\u0000')
			const command = argvToString(argv)
			const proc: TProcess = {
				pid,
				ppid,
				command,
				argv,
			}
			return proc
		} catch (err) {
			console.error(dir, cmdline, err, status)
			return null
		}
	})))
		.filter(o => o)

	return processes
}
