import { promises as fs } from 'fs';
import program from 'commander';

import { ApiCaller } from './apiCaller';

const ACCESS_TOKEN_FILEPATH: string = 'access_token.txt';
const VEHICLE_ID_FILEPATH: string = 'vehicle_id.txt';


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

program.version('0.0.1');

program
    .command('getToken <email> <password>')
    .description('Generates an API token that is valid for 45 days')
    .action(async (email, password) => {
        let apiCaller = new ApiCaller();
        let result = await apiCaller.getAccessToken(email, password);
        await fs.writeFile(ACCESS_TOKEN_FILEPATH, result);
    });

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

async function main() {
    await program.parseAsync(process.argv);
}

main().then(() => {
    console.log('All done');
}).catch(err => {
    console.error(err);
});
