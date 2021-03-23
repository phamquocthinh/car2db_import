/* eslint-disable no-undef */
'use strict'

const interfaces = require('os').networkInterfaces()
const _ = require('lodash')

const path = require('path')
const dotenv = require('dotenv')
dotenv.config(path.resolve(__dirname, '../.env'))

let ipAddress

_.each(interfaces, ports => {
	_.each(ports, port => {
		if (!ipAddress && !port.internal && port.family === 'IPv4') {
			ipAddress = port.address
		}
	})
})

const Util = {
	getEnv: (key, defaultValue) => {
		if (!key) {
			throw new Error('Key is required')
		}

		let value = process.env[key] || ''

		if (!value && defaultValue) {
			value = defaultValue
		}

		return value
	},

	getIpAddress: () => {
		return ipAddress
	},

	sleep: (ms) => {
		return new Promise(resolve => { 
			setTimeout(resolve, ms)
		})
	},

	camelToSnakeCase: (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

module.exports = Util