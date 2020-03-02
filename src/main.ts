import { promises as fs } from 'fs';
import program from 'commander';

import { ApiCaller } from './apiCaller';

const ACCESS_TOKEN_FILEPATH: string = 'access_token.txt';


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
        console.log(result);
    });

async function main() {
    await program.parseAsync(process.argv);
}

main().then(() => {
    console.log('All done');
}).catch(err => {
    console.error(err);
});
