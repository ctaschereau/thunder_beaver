import { urlParse } from './deps.ts';
import { RequestInitWithHeaders } from './types.ts';

const TESLA_SERVER_HOSTNAME: string = 'owner-api.teslamotors.com';

const API_USER_AGENT = 'Mozilla/5.0 (Linux; Android 9.0.0; VS985 4G Build/LRX21Y; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36';
const API_X_Tesla_User_Agent = 'TeslaApp/3.4.4-350/fad4a582e/android/9.0.0';

export abstract class AbstractTeslaApi {

    async _call<T>(path: string, options: RequestInitWithHeaders): Promise<T> {
        const url = this._getURL(path);
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
        let options = this._getCommonHeaders();
        options.method = 'GET';
        return options;
    }

    _getPostOptions(postData?: any): RequestInitWithHeaders {
        let options = this._getCommonHeaders();
        options.method = 'POST';
        options.headers.append('Content-Type', 'application/json');
        if (postData) {
            options.body = JSON.stringify(postData);
            options.headers.append('Content-Length', '' + options.body.length);
        }
        return options;
    }

    private _getURL(path: string): URL {
        return urlParse({
            protocol: 'https',
            hostname: TESLA_SERVER_HOSTNAME,
            pathname: path,
            port: 443,
        });
    }

    private _getCommonHeaders(): RequestInitWithHeaders {
        const headers = new Headers();
        headers.append('User-Agent', API_USER_AGENT);
        headers.append('X-Tesla-User-Agent', API_X_Tesla_User_Agent);
        this._addAuthHeader(headers);
        return {
            headers
        };
    }

    _addAuthHeader(headers: Headers): void {
        // Nothing to do in the abstract class
    }
}
