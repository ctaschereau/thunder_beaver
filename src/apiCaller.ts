import * as https from 'https'

const TESLA_SERVER_HOSTNAME: string = 'owner-api.teslamotors.com';
const TESLA_CLIENT_ID: string = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384';
const TESLA_CLIENT_SECRET: string = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3';

// doc : https://www.teslaapi.io/  or  https://tesla-api.timdorr.com/

type vcount = {
	response: [],
	count: number,
};


export class ApiCaller {

    _accessToken: string;

    constructor(token?: string) {
        this._accessToken = token;
    }

    async getAccessToken(email: string, password: string): Promise<string> {
        if (!email || !password) {
            throw new Error('Missing required parameter(s).');
        }
        const path = '/oauth/token';
        let postData = JSON.stringify({
            grant_type: 'password',
            client_id: TESLA_CLIENT_ID,
            client_secret: TESLA_CLIENT_SECRET,
            email,
            password,
        });
        let options = this._getPostOptions(path, postData.length);
        // TODO : Define the return type
        let r = await this._call<any>(options, postData);
        return r.access_token;
    }

    async getVehicleList() {
        const path = '/api/1/vehicles';
        let options = this._getGetOptions(path);
		// TODO : Define the return type
        return await this._call<vcount>(options);
    }

    async _call<T>(options: object, postDataString?: string) {
        return new Promise<T>((resolve, reject) => {
            let payload: string = '';
            let req = https.request(options, (res) => {
                console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);

                res.setEncoding('utf8');
                res.on('data', (d) => {
                    payload += d;
                });

                res.on('end', () => {
                    let jsonPayload = JSON.parse(payload);
                    resolve(jsonPayload);
                })
            });

            req.on('error', (e) => {
                reject(e);
            });

            if (postDataString) {
                req.write(postDataString);
            }
            req.end();
        });
    }

    _getGetOptions(path: string) {
        let options = this._getCommonOptions(path);
        options.method = 'GET';
        return options;
    }

    _getPostOptions(path: string, contentLength: number) {
        let options = this._getCommonOptions(path);
        options.method = 'POST';
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = contentLength;
        return options;
    }

    _getCommonOptions(path: string) {
        // TODO : define an interface RequestOptions
        let options: any = {
            hostname: TESLA_SERVER_HOSTNAME,
            port: 443,
            method: undefined as string,
            path,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 9.0.0; VS985 4G Build/LRX21Y; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36',
                'X-Tesla-User-Agent': 'TeslaApp/3.4.4-350/fad4a582e/android/9.0.0',
            }
        };
        if (this._accessToken) {
            options.headers['Authorization'] = `Bearer ${this._accessToken}`;
        }
        return options;
    }

}
