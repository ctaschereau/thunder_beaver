import { urlParse } from './deps.ts';

const TESLA_SERVER_HOSTNAME: string = 'owner-api.teslamotors.com';
const TESLA_CLIENT_ID: string = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384';
const TESLA_CLIENT_SECRET: string = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3';

const API_USER_AGENT = 'Mozilla/5.0 (Linux; Android 9.0.0; VS985 4G Build/LRX21Y; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36';
const API_X_Tesla_User_Agent = 'TeslaApp/3.4.4-350/fad4a582e/android/9.0.0';

// doc : https://www.teslaapi.io/  or  https://tesla-api.timdorr.com/

type VehicleInfo = {
    id: number;
    vehicle_id: number;
    vin: string;
    display_name: string;
    option_codes: string;
    color: null;
    tokens: string[];
    state: 'online' | 'asleep' | 'offline';
    in_service: boolean;
    id_s: string;
    calendar_enabled: boolean;
    api_version: number;
    backseat_token: any;
    backseat_token_updated_at: any;
};
type BasicVehicleCallResponse = {
    response: VehicleInfo;
};
type VehicleCountResponse = {
    response: VehicleInfo[];
    count: number;
};
type OAuthResponse = {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    refresh_token: string;
    created_at: number;
};

interface RequestInitWithHeaders extends RequestInit {
    headers: Headers;
}

export class ApiCaller {

    _accessToken: string | undefined;

    constructor(token?: string) {
        this._accessToken = token;
    }

    async getAccessToken(email: string, password: string): Promise<string> {
        if (!email || !password) {
            throw new Error('Missing required parameter(s).');
        }
        const path = '/oauth/token';
        let postData = {
            grant_type: 'password',
            client_id: TESLA_CLIENT_ID,
            client_secret: TESLA_CLIENT_SECRET,
            email,
            password,
        };
        const url = this._getURL(path);
        let options = this._getPostOptions(postData);
        let r = await this._call<OAuthResponse>(url, options);
        return r.access_token;
    }

    async getVehicleList() {
        const path = '/api/1/vehicles';
        const url = this._getURL(path);
        let options = this._getGetOptions();
        return await this._call<VehicleCountResponse>(url, options);
    }

    async getVehicleData(id: string) {
        const path = `/api/1/vehicles/${id}/vehicle_data`;
        const url = this._getURL(path);
        let options = this._getGetOptions();
        // TODO : Define the return type
        return await this._call<any>(url, options);
    }

    async wakeUp(id: string) {
        const path = `/api/1/vehicles/${id}/wake_up`;
        const url = this._getURL(path);
        let options = this._getPostOptions();
        return await this._call<BasicVehicleCallResponse>(url, options);
    }

    async climateControlOn(id: string) {
        const path = `/api/1/vehicles/${id}/command/auto_conditioning_start`;
        const url = this._getURL(path);
        let options = this._getPostOptions();
        return await this._call<BasicVehicleCallResponse>(url, options);
    }

    async climateControlOff(id: string) {
        const path = `/api/1/vehicles/${id}/command/auto_conditioning_stop`;
        const url = this._getURL(path);
        let options = this._getPostOptions();
        return await this._call<BasicVehicleCallResponse>(url, options);
    }

    async _call<T>(url: URL, options: RequestInitWithHeaders) {
        const res = await fetch(url.toString(), options);
        if (res.status !== 200) {
            console.error(`Did not get a 200 status code, got a ${res.status} instead. statusText: ${res.statusText}`);
            // console.log('headers:', res.headers);
            console.error(await res.text());
            throw new Error(`Tesla API call failed with HTTP code ${res.status}`);
        }
        return await res.json();
    }

    _getGetOptions(): RequestInitWithHeaders {
        let options = this._getCommonOptions();
        options.method = 'GET';
        return options;
    }

    _getPostOptions(postData?: any): RequestInitWithHeaders {
        let options = this._getCommonOptions();
        options.method = 'POST';
        options.headers.append('Content-Type', 'application/json');
        if (postData) {
            options.body = JSON.stringify(postData);
            options.headers.append('Content-Length', '' + options.body.length);
        }
        return options;
    }

    _getURL(path: string): URL {
        return urlParse({
            protocol: 'https',
            hostname: TESLA_SERVER_HOSTNAME,
            pathname: path,
            port: 443,
        });
    }

    _getCommonOptions(): RequestInitWithHeaders {
        const headers = new Headers();
        headers.append('User-Agent', API_USER_AGENT);
        headers.append('X-Tesla-User-Agent', API_X_Tesla_User_Agent);
        if (this._accessToken) {
            headers.append('Authorization', `Bearer ${this._accessToken}`);
        }
        return {
            headers
        };
    }
}
