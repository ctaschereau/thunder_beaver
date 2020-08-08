import { delay } from 'https://deno.land/std@0.63.0/async/delay.ts';

import { Denomander } from './deps.ts';

import { TeslaAccountApi } from './teslaAccountApi.ts';
import { TeslaCarApi } from './teslaCarApi.ts';

const ACCESS_TOKEN_FILEPATH: string = 'access_token.txt';
const VEHICLE_ID_FILEPATH: string = 'vehicle_id.txt';

const getTokenFromFile = async (): Promise<string> => {
	let _accessToken;
	try {
		_accessToken = await Deno.readTextFile(ACCESS_TOKEN_FILEPATH);
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw new Error('No access token. getAccessToken should be called first.');
		} else {
			throw err;
		}
	}
	return _accessToken;
};

const getVehicleIdFromFile = async (): Promise<string> => {
	let _vehicleID;
	try {
		_vehicleID = await Deno.readTextFile(VEHICLE_ID_FILEPATH);
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw new Error('No vehicle ID. getVehicleList should be called first.');
		} else {
			throw err;
		}
	}
	return _vehicleID;
};

const notifyTemp = async (api: TeslaCarApi): Promise<void> => {
	const maxNotificationTimes = 15;
	const notificationTitle = 'Tesla temp';
	let i = 0;
	setInterval(async () => {
		i++;
		const result = await api.getVehicleData();
		const notificationMessage = `Temperature in the car is now : ${result.response.climate_state.inside_temp}`;
		Deno.run({
			cmd: ['notify-send', notificationTitle, notificationMessage],
		});
		if (i > maxNotificationTimes) {
			Deno.exit(0);
		}
	}, 60 * 1000);
};

const closeWindowsIfNeeded = async (api: TeslaCarApi): Promise<void> => {
	let result = await api.getVehicleData();
	const vs = result.response.vehicle_state;
	const ds = result.response.drive_state;
	if (!vs.fd_window && !vs.fp_window && !vs.rd_window && !vs.rp_window) {
		console.log('All windows are closed!');
	} else {
		const p = (w: number) => w ? 'open' : 'close';
		console.log(`The windows are in this open state : 
Front driver : ${p(vs.fd_window)}	Front passenger : ${p(vs.fp_window)}
Rear driver  : ${p(vs.fd_window)}	Rear passenger  : ${p(vs.fp_window)}`);
		await api.closeWindows(ds.latitude, ds.longitude);

		await delay(2000);
		let result = await api.getVehicleData();
		const vs2 = result.response.vehicle_state;
		if (!vs2.fd_window && !vs2.fp_window && !vs2.rd_window && !vs2.rp_window) {
			console.log('All windows are now closed!');
		} else {
			console.error('Windows did not close correctly even after command ...');
		}
	}
};


const program = new Denomander(
	{
		app_name: "Thunder Beaver",
		app_description: "Simple app to interact with the Tesla API",
		app_version: "0.0.3"
	}
);


program
	.command('getToken [email] [password]')
	.description('Generates an API token that is valid for 45 days.')
	.action(async ({ email, password }: { email: string, password: string }) => {
		let api = new TeslaAccountApi();
		let result = await api.getAccessToken(email, password);
		await Deno.writeTextFile(ACCESS_TOKEN_FILEPATH, result);
		console.log('Token has been written to file');
	});


program
	.command('getVehicleList')
	.description('Gets the list of vehicles associated with the current account.')
	.action(async () => {
		let token = await getTokenFromFile();
		let api = new TeslaAccountApi();
		let result = await api.getVehicleList(token);
		if (result.count === 0) {
			console.log('No vehicle yet.');
			Deno.exit(0);
		}
		if (result.count > 1) {
			console.error('More than one Tesla ; not implemented');
			Deno.exit(1);
		}
		let carData = result.response[0];
		await Deno.writeTextFile(VEHICLE_ID_FILEPATH, carData.id_s);
		console.log('Vehicule id has been written to file.');
	});

program
	.command('wakeUp')
	.description('Wakes up the specified vehicle.')
	.action(async () => {
		const token = await getTokenFromFile();
		const vehicleID = await getVehicleIdFromFile();
		const api = new TeslaCarApi(token, vehicleID);
		let result = await api.wakeUp();
		console.log(result.response.state);
	});

program
	.command('getVehicleData')
	.description('Gets the data for the specified vehicle.')
	.action(async () => {
		const token = await getTokenFromFile();
		const vehicleID = await getVehicleIdFromFile();
		const api = new TeslaCarApi(token, vehicleID);
		let result = await api.getVehicleData();
		console.log(JSON.stringify(result, null, 4));
	});

program
	.command('getVehicleChargeInfo')
	.description('Gets the charge information for the specified vehicle.')
	.action(async () => {
		const token = await getTokenFromFile();
		const vehicleID = await getVehicleIdFromFile();
		const api = new TeslaCarApi(token, vehicleID);
		let result = await api.getVehicleChargeInfo();
		console.log(JSON.stringify(result, null, 4));
	});

program
	.command('climateControlOn')
	.description('Turns on the climate control (either A/C or heat) to reach the preset target temperature.')
	.action(async () => {
		const token = await getTokenFromFile();
		const vehicleID = await getVehicleIdFromFile();
		const api = new TeslaCarApi(token, vehicleID);
		await api.climateControlOn();
		console.log('Climate control has been turned on');
		notifyTemp(api);
	});

program
	.command('climateControlOff')
	.description('Turns off the climate control.')
	.action(async () => {
		const token = await getTokenFromFile();
		const vehicleID = await getVehicleIdFromFile();
		const api = new TeslaCarApi(token, vehicleID);
		await api.climateControlOff();
		console.log('Climate control has been turned off');
	});

program
	.command('monitorWindows')
	.description('Checks at a regular interval to see if the windows are open and the car is parked. If so, closes them.')
	.action(async () => {
		const thirtyMinutesInMs = 30 * 60 * 1000;
		setInterval(async() => {
			const token = await getTokenFromFile();
			const vehicleID = await getVehicleIdFromFile();
			const api = new TeslaCarApi(token, vehicleID);
			closeWindowsIfNeeded(api);
		}, thirtyMinutesInMs);
	});


// program.parse(Deno.args);
program.parse(['getVehicleChargeInfo']);


