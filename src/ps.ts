import {TProcess, TProcessNode, TProcessTree} from './contracts'
import {psUnix} from './ps-unix-old'
import {wmic} from './wmic'

export function ps(): Promise<TProcess[]> {
	return process.platform === 'win32' ? wmic() : psUnix()
}

export async function psTree(prevProcesses?: TProcess[]): Promise<TProcessTree> {
	const processes = await ps()
	return getProcessTree(processes, prevProcesses)
}

function getProcessTree(processes: TProcess[], prevProcesses?: TProcess[]): TProcessTree {
	const processesTree: TProcessTree = processes.reduce((a, o) => {
		a[o.pid] = {
			pid        : o.pid,
			ppid       : o.ppid || 0,
			command    : o.command || '',
			closed     : false,
			parentIds  : null,
			childIds   : [],
			allChildIds: [],
		}
		return a
	}, {} as TProcessTree)

	// fill prev
	if (prevProcesses) {
		for (let i = 0, len = prevProcesses.length; i < len; i++) {
			const proc = prevProcesses[i]
			if (!processesTree[proc.pid]) {
				processesTree[proc.pid] = {
					pid        : proc.pid,
					ppid       : proc.ppid || 0,
					command    : proc.command || '',
					closed     : true,
					parentIds  : null,
					childIds   : [],
					allChildIds: [],
				}
			}
		}
	}

	const _processes = Object.values(processesTree)

	// fill closed
	for (let i = 0, len = _processes.length; i < len; i++) {
		const proc = _processes[i]
		if (!processesTree[proc.ppid]) {
			const closedProc: TProcessNode = {
				pid        : proc.ppid,
				ppid       : 0,
				command    : '',
				closed     : true,
				parentIds  : null,
				childIds   : [],
				allChildIds: [],
			}
			processesTree[proc.ppid] = closedProc
			_processes.push(closedProc)
		}
	}

	function fillParents(proc: TProcessNode): number[] {
		if (!proc.parentIds) {
			if (proc.pid === 0) {
				proc.parentIds = []
			} else {
				const parent = processesTree[proc.ppid]
				if (!parent) {
					throw new Error('Unexpected behavior')
				}
				proc.parentIds = []
				proc.parentIds = [proc.ppid, ...fillParents(parent)]
			}
		}
		return proc.parentIds
	}

	// fill parents
	_processes.map(fillParents)

	// fill childs
	for (let i = 0, len = _processes.length; i < len; i++) {
		const proc = _processes[i]
		const pid = proc.pid
		const parentIds = proc.parentIds
		for (let j = 0, len2 = parentIds.length; j < len2; j++) {
			const parent = processesTree[parentIds[j]]
			if (parent) {
				if (j === 0) {
					parent.childIds.push(pid)
				}
				parent.allChildIds.push(pid)
			}
		}
	}

	return processesTree
}
