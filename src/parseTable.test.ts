/* eslint-disable no-shadow */
import assert from 'assert'
import {parseTable} from './parseTable'

describe('parseTable', function () {
	this.timeout(1000)

	it('base', async function () {
		const result = parseTable(
			' \tField1  field2\t \tFIELD_3\n'
			+ 'Value1\tvalue1 VALUE_1 \t\n\r'
			+ '\t Value2\tvalue2 \rVALUE_2\r\n'
			+ ' Value3 \t value3\r VALUE_3\r\n\n'
			+ ' Value4 \t value4\r VALUE_4\n\r\n'
			+ ' Value5 \t value5\r VALUE_5\r\n\r\n'
		)

		assert.deepStrictEqual(result, [
			{Field1: 'Value1', field2: 'value1', FIELD_3: 'VALUE_1', },
			{Field1: 'Value2', field2: 'value2', FIELD_3: 'VALUE_2', },
			{Field1: 'Value3', field2: 'value3', FIELD_3: 'VALUE_3', },
			{Field1: 'Value4', field2: 'value4', FIELD_3: 'VALUE_4', },
			{Field1: 'Value5', field2: 'value5', FIELD_3: 'VALUE_5', },
		])
	})
})
