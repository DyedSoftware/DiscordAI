const fs = require('fs')
const brain = require('brain.js')
const dotenv = require('dotenv');
const path = require('path')
const { performance } = require('perf_hooks');

const retrainEvent = require('../bot/events/retrainEvent');
const consoleLogger = require('../utils/consoleLogger');
const time = require('../utils/time')

const trainingdataConfig = JSON.parse(fs.readFileSync(__dirname + '/data/trainingdata.json', 'utf-8')); 
const awnsersConfig = JSON.parse(fs.readFileSync(__dirname + '/data/awnsers.json', 'utf-8')); 
const botConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../bot/config.json'), 'utf8'))

const net = new brain.recurrent.LSTM( {activation: 'leaky-relu'} );
dotenv.config()

let intervalID = null;

let training = false;

/**
* Trains the neural network
*
* @param {JSON} data - Trainingdata
* @param {Number} iterations - Number of trainingIterations <Default 1000>
* @param {Number} callbackPeriod - Period of Callback <Default 100>
*/

const trainNet = async(data, iterations = 1000, callbackPeriod = 100) => {
	if(Object.entries(data).length === 0 || data === "") return consoleLogger.warn('No trainingdata') 
	training = true;
    consoleLogger.info('Training start');

	const startingDate = new Date();

	net.train(data, {
		iterations: iterations,
		log: process.env.CONSOLE_MUTE != 'true',
		errorThresh: 0.001,
		logPeriod: 5,
		momentum: 0.1,
		learningRate: 0.001,
		callback: () => calcTime(iterations, callbackPeriod),
		callbackPeriod: callbackPeriod
	})

	await saveNetData();
	retrainEvent.onRetrain()
	training = false;
	consoleLogger.info(`Finished in ${(new Date() - startingDate) / 1000} s`);
}

let lastCallback = undefined;
let iterationsPassed = 0;

const calcTime = (iterations, callbackPeriod) => {
	if(lastCallback == undefined) {
		lastCallback = performance.now()
	}else {
		let passed = performance.now() - lastCallback 
		let iterationsLeft = iterations - iterationsPassed 
		let timeLeft = (iterationsLeft / callbackPeriod) * passed;
		consoleLogger.info(`Estimated time: ${time.millisToMinutesAndSeconds(timeLeft)}m`)
		lastCallback = performance.now()
	}
	iterationsPassed += callbackPeriod;
	return
}

const loadTrainingData = () => {
	try {
		trainNet(JSON.parse(fs.readFileSync(__dirname + '/data/trainingdata.json')), botConfig.iterations)
	}catch(error) {
		consoleLogger.error(error, 'Load Trainingdata')
	}
}

const saveNetData = () => {
	return new Promise((resolve, reject) => {
		fs.writeFile(__dirname + '/data/net.json', JSON.stringify(net.toJSON()), (err) => {
			if(err) {
				consoleLogger.error(err, 'Saving Net') 
				reject()
			}else {
				consoleLogger.info('Saved net successfully!')
				resolve()
			} 
		})
	})
}

const startIntervalTraining = (interval = 30000) => {
    if(botConfig.intervaltraining) {
		intervalID = setInterval(() => {
			console.info(`Retraining! [Interval => ${time.millisToMinutesAndSeconds(interval)}]`)
			loadTrainingData()
		}, interval)
	}
}

const activateIntervalTraining = () => {
	if(!botConfig.intervaltraining) {
		botConfig.intervaltraining = true;
		fs.writeFileSync(path.resolve(__dirname, '../bot/config.json'), JSON.stringify(botConfig))
	}
	startIntervalTraining()
}

const stopIntervalTraining = () => {
    if(intervalID != null) {
        clearInterval(intervalID);
        intervalID = null;
    }
	botConfig.intervaltraining = false;
	fs.writeFileSync(path.resolve(__dirname, '../bot/config.json'), JSON.stringify(botConfig))
}

const saveTrainingData = (input, category, output) => {

	let toSave_training = {input: input, output: category}
	trainingdataConfig.push(toSave_training)
	fs.writeFileSync(__dirname + '/data/trainingdata.json', JSON.stringify(trainingdataConfig));
	consoleLogger.info(`Saved: ${JSON.stringify(toSave_training)}`)

	if(hasEntries(category)) {
		awnsersConfig[category].push(output)
	}else {
		awnsersConfig[category] = [output]
	}
	fs.writeFileSync(__dirname + '/data/awnsers.json', JSON.stringify(awnsersConfig));
}

const hasEntries = (category) => {
	if(awnsersConfig[category] === undefined) {
		return false;
	}
	return true;
}

module.exports = {
	loadTrainingData,
	training,
	startIntervalTraining,
	stopIntervalTraining,
	saveTrainingData,
	botConfig,
	activateIntervalTraining
} 
