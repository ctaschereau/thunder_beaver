import Denomander from "https://deno.land/x/denomander/mod.ts";

import { ApiCaller } from './apiCaller.ts';

const ACCESS_TOKEN_FILEPATH: string = 'access_token.txt';
const VEHICLE_ID_FILEPATH: string = 'vehicle_id.txt';

/*
let getTokenFromFile = async (): Promise<string> => {
    let _accessToken;
    try {
        _accessToken = await fs.readFile(ACCESS_TOKEN_FILEPATH, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No access token. getAccessToken should be called first.');
        } else {
            throw err;
        }
    }
    return _accessToken;
};

let getVehicleIdFromFile = async (): Promise<string> => {
    let _vehicleID;
    try {
        _vehicleID = await fs.readFile(VEHICLE_ID_FILEPATH, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No vehicle ID. getVehicleList should be called first.');
        } else {
            throw err;
        }
    }
    return _vehicleID;
};
*/

const program = new Denomander(
    {
        app_name: "Thunder Beaver",
        app_description: "Simple app to interact with the Tesla API",
        app_version: "0.0.2"
    }
);


program
    .command('getToken [email] [password]')
    .description('Generates an API token that is valid for 45 days')
    .action(async ({email, password}: {email: string, password: string}) => {
        let apiCaller = new ApiCaller();
        let result = await apiCaller.getAccessToken(email, password);
        await Deno.writeTextFile(ACCESS_TOKEN_FILEPATH, result);
    });

/*
program
    .command('getVehicleList')
    .description('Gets the list of vehicles associated with the current account')
    .action(async () => {
        let token = await getTokenFromFile();
        let apiCaller = new ApiCaller(token);
        let result = await apiCaller.getVehicleList();
        if (result.count === 0) {
            console.log('No vehicle yet.');
            process.exit(0);
        }
        if (result.count > 1) {
            console.error('More than one Tesla ; not implemented');
            process.exit(1);
        }
        let carData = result.response[0];
        await fs.writeFile(VEHICLE_ID_FILEPATH, carData.id_s);
    });

program
    .command('wakeUp')
    .description('Wakes up the specified vehicle')
    .action(async () => {
        let token = await getTokenFromFile();
        let apiCaller = new ApiCaller(token);
        let vehicleID = await getVehicleIdFromFile();
        let result = await apiCaller.wakeUp(vehicleID);
        console.log(result.response.state);
    });

program
    .command('getVehicleData')
    .description('Gets the data for the specified vehicle')
    .action(async () => {
        let token = await getTokenFromFile();
        let vehicleID = await getVehicleIdFromFile();
        let apiCaller = new ApiCaller(token);
        let result = await apiCaller.getVehicleData(vehicleID);
        console.log(JSON.stringify(result, null, 4));
    });

program
    .command('climateControlOn')
    .description('Turns on the climate control (either A/C or heat) to reach the preset target temperature')
    .action(async () => {
        let token = await getTokenFromFile();
        let vehicleID = await getVehicleIdFromFile();
        let apiCaller = new ApiCaller(token);
        let result = await apiCaller.climateControlOn(vehicleID);
        console.log(result);

        let i = 0;
        setInterval(async () => {
            i++;
            let result = await apiCaller.getVehicleData(vehicleID);
            execSync(`notify-send "Tesla temp" "Temperature in the car is now : ${result.response.climate_state.inside_temp}"`);
            if (i > 10) {
                process.exit(0);
            }
        }, 1 * 60 * 1000);
    });
*/

// program.parse(Deno.args);
program.parse(['getToken', 'asdasd', 'asdasdasd']);
