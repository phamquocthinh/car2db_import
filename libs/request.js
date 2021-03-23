const fetch = require('node-fetch')
const fs = require('fs')

const downloadFile = async(url, path) => {
	const res = await fetch(url)
	const fileStream = fs.createWriteStream(path)

	await new Promise((resolve, reject) => {
		res.body.pipe(fileStream)
		res.body.on("error", reject)
		fileStream.on("finish", resolve)
	})
}

const requestApi = (url) => {
	return fetch(url)
		.then((response) => {
			return response.text()
		})
}

module.exports = {
	downloadFile,
	requestApi
}