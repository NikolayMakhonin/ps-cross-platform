import {TProcess} from './contracts'
import {psUnix} from './ps-unix'
import {wmic} from './wmic'

export function ps(): Promise<TProcess[]> {
	return process.platform === 'win32' ? wmic() : psUnix()
}
