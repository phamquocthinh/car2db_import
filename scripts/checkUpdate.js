const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const { sleep, camelToSnakeCase } = require('../libs/utils')
const { downloadFile, requestApi } = require('../libs/request')
const { db, importToTable } = require('../libs/postgres')

const DEFAULT_VALUE = require('../config/defaultValues')

const getLastUpdated = () => {
	const lastUpdatedPath = path.join(__dirname, './lastUpdate.json')
	const lastUpdatedData = fs.readFileSync(lastUpdatedPath)
	let lastUpdated = {}

	try {
		lastUpdated = JSON.parse(lastUpdatedData)
	} catch (e) {
		console.log(e)
	}

	return lastUpdated
}

const setLastUpdated = (lastUpdated) => {
	fs.writeFileSync(path.join(__dirname, 'lastUpdate.json'), JSON.stringify(lastUpdated))
}

const saveFile = (entity, filePath) => {
	let apiUrl = `https://api.car2db.com/api/auto/v1/${entity}.getAll.csv.en?api_key=${DEFAULT_VALUE['apiKey']}`

	if (entity !== 'type') {
		apiUrl += '&id_type=1'
	}

	return downloadFile(apiUrl, filePath)
}

const checkUpdate = async(entity, lastUpdated) => {
	let apiUrl = `https://api.car2db.com/api/auto/v1/${entity}.getDateUpdate.timestamp.en?api_key=${DEFAULT_VALUE['apiKey']}`

	if (entity !== 'type') {
		apiUrl += '&id_type=1'
	}

	const lastTime = await requestApi(apiUrl)

	if (lastTime && lastTime > _.get(lastUpdated, entity, 0)) {
		return {
			needUpdate: true,
			lastTime
		}
	}

	return {
		needUpdate: false
	}
}

const execute = async() => {
	const lastUpdated = getLastUpdated()

	const entities = DEFAULT_VALUE['car2dbEntities']

	for (const entity of entities) {
		console.log(`Execute table ${entity}`)
		const { needUpdate, lastTime } = await checkUpdate(entity, lastUpdated)

		const tableName = `car_${camelToSnakeCase(entity)}`
		const filePath = path.join(__dirname, 'data', `${tableName}.csv`)

		if (needUpdate) {
			console.log(`Found new update version ${entity} at ${new Date(parseInt(lastTime) * 1000).toLocaleString()}`)
			await saveFile(entity, filePath)

			await sleep(5000)
			
			await importToTable(db, tableName, filePath)

			lastUpdated[entity] = lastTime
		}
	}

	setLastUpdated(lastUpdated)
}

execute()