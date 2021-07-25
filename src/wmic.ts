import {spawn} from 'child_process'
import {waitProcessData} from './spawn'
import {TProcess} from './contracts'
import {parseTable} from './parseTable'
// import {parseArgv} from './parseArgv'

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
//
// Win32:
// 1. wmic PROCESS WHERE ParentProcessId=4604 GET Name,ParentProcessId,ProcessId,Status)
// 2. The order of head columns is fixed
// ```shell
// > wmic PROCESS GET Name,ProcessId,ParentProcessId,Status
// Name                          ParentProcessId  ProcessId   Status
// System Idle Process           0                0
// System                        0                4
// smss.exe                      4                228
// ```

export async function wmic(): Promise<TProcess[]> {
	const proc = spawn('wmic.exe', ['PROCESS', 'GET', 'ProcessId,ParentProcessId,CommandLine,ExecutablePath,Name'], {
		windowsHide: true,
	})

	const {code, out, err} = await waitProcessData({proc})

	if (code !== 0 || err.trim()) {
		throw new Error('wmic command exited with code ' + code + '\r\n' + err)
	}

	const table = parseTable(out)

	const processes = table.map(row => {
		const _process: TProcess = {
			pid    : parseInt(row.ProcessId, 10),
			ppid   : parseInt(row.ParentProcessId, 10),
			command: row.CommandLine,
			// argv   : parseArgv(row.CommandLine),
		}
		return _process
	})

	return processes
}
