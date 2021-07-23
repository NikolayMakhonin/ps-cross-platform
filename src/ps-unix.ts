import {spawn} from 'child_process'
import {waitProcessData} from './spawn'
import {TProcess} from './contracts'
import {parseTable} from './parseTable'
import {argvToString, parseArgv} from './parseArgv'
import fs from 'fs'

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
	const proc = spawn('ps', ['-A', '-o', 'ppid=PPID,pid=PID,args=COMMAND'], {})

	const {code, out, err} = await waitProcessData({proc})

	if (code !== 0) {
		throw new Error('ps command exited with code ' + code + '\r\n' + err)
	}

	const table = parseTable(out)

	const processes = await Promise.all(table.map(async row => {
		const pid = parseInt(row.PID, 10)
		const argv = await new Promise<string[]>((resolve, reject) => {
			fs.readFile(`/proc/${pid}/cmdline`, (error, data) => {
				if (error) {
					reject(error)
				} else {
					resolve(data.toString().split('\u0000'))
				}
			})
		})
			.catch(() => {
				return parseArgv(row.COMMAND)
			})

		const command = argvToString(argv)

		const _process: TProcess = {
			pid : parseInt(row.PID, 10),
			ppid: parseInt(row.PPID, 10),
			command,
			argv,
		}
		return _process
	}))

	return processes
}
