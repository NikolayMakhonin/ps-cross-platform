/* eslint-disable no-shadow */
import assert from 'assert'
import {ps} from './ps'
import {spawn} from 'child_process'

describe('ps', function () {
	this.timeout(15000)

	function delay(milliseconds) {
		return new Promise(o => setTimeout(o, milliseconds))
	}

 	it('base', async function () {
		const proc = spawn(`node -e "setTimeout(function() { console.log('Completed') }, 5000)"`, {
			shell: true,
		})
		await delay(100)
		const result = ps()
		console.log(result)
		proc.kill('SIGTERM')
	})
})
