import { AbstractTeslaApi } from './abstractTeslaApi.ts';
import { OAuthResponse, VehicleCountResponse } from './types.ts';

const TESLA_CLIENT_ID: string = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384';
const TESLA_CLIENT_SECRET: string = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3';

export class TeslaAccountApi extends AbstractTeslaApi {

    private _accessToken: string|undefined;

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
        let options = this._getPostOptions(postData);
        let r = await this._call<OAuthResponse>(path, options);
        return r.access_token;
    }

    async getVehicleList(accessToken: string) {
        this._accessToken = accessToken;
        const path = '/api/1/vehicles';
        let options = this._getGetOptions();
        return await this._call<VehicleCountResponse>(path, options);
    }

    _addAuthHeader(headers: Headers): void {
        if (this._accessToken) {
            headers.append('Authorization', `Bearer ${this._accessToken}`);
        }
    }
}
