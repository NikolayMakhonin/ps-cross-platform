/* eslint-disable no-shadow */
import assert from 'assert'
import {argvToString, parseArgv} from './parseArgv'

describe('parseArgv', function () {
	this.timeout(1000)

	function test(commandLine: string, checkArgv: string[], checkArgvStr: string) {
		const argv = parseArgv(commandLine)
		assert.deepStrictEqual(argv, checkArgv)
		const argvStr = argvToString(argv)
		assert.strictEqual(argvStr, checkArgvStr)
	}

	it('base', async function () {
		test(
			'echo   q""w""""e """" """"""""   -\t--   " "" "\t \t" "',
			['echo', 'qw"e', '"', '"""', '-', '--', ' " ', ' '],
			'echo qw\\"e \\" \\"\\"\\" - -- " \\" " " "',
		)
		test(
			'" echo\t"   "\t"" " "q""w""e""r" q" "w"" ""e',
			[' echo\t', '\t" ', 'q"w"e"r', 'q w', 'e'],
			'" echo\t" "\t\\" " q\\"w\\"e\\"r "q w" e',
		)
		test(
			'"" "',
			['', ''],
			'"" ""',
		)
		test(
			'q "',
			['q', ''],
			'q ""',
		)
		test(
			'"a" "  ',
			['a', '  '],
			'a "  "',
		)
		test(
			'\\ \\i \\" \\\\',
			['\\', '\\i', '"', '\\'],
			'\\\\ \\\\i \\" \\\\',
		)
	})
})
