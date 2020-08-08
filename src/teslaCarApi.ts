import { AbstractTeslaApi } from './abstractTeslaApi.ts';
import { BasicVehicleCallResponse, ChargeInfoCallResponse, ResultReasonResponse } from './types.ts';


export class TeslaCarApi extends AbstractTeslaApi {

    _accessToken: string;
    _vehicleID: string;

    constructor(token: string, vehicleID: string) {
        super();
        this._accessToken = token;
        this._vehicleID = vehicleID;
    }

    async getVehicleData() {
        const path = `/api/1/vehicles/${this._vehicleID}/vehicle_data`;
        // GET /api/1/vehicles/{id}/data_request/charge_state
        // GET /api/1/vehicles/{id}/data_request/climate_state
        // GET /api/1/vehicles/{id}/data_request/drive_state
        // GET /api/1/vehicles/{id}/data_request/gui_settings
        // GET /api/1/vehicles/{id}/data_request/vehicle_state
        // GET /api/1/vehicles/{id}/data_request/vehicle_config
        let options = this._getGetOptions();
        // TODO : Define the return type
        return await this._call<any>(path, options);
    }

    async getVehicleChargeInfo(): Promise<ChargeInfoCallResponse> {
        const path = `/api/1/vehicles/${this._vehicleID}/data_request/charge_state`;
        let options = this._getGetOptions();
        return await this._call<ChargeInfoCallResponse>(path, options);
    }

    async wakeUp() {
        const path = `/api/1/vehicles/${this._vehicleID}/wake_up`;
        let options = this._getPostOptions();
        return await this._call<BasicVehicleCallResponse>(path, options);
    }

    async climateControlOn() {
        const path = `/api/1/vehicles/${this._vehicleID}/command/auto_conditioning_start`;
        let options = this._getPostOptions();
        return await this._call<ResultReasonResponse>(path, options);
    }

    async climateControlOff() {
        const path = `/api/1/vehicles/${this._vehicleID}/command/auto_conditioning_stop`;
        let options = this._getPostOptions();
        return await this._call<ResultReasonResponse>(path, options);
    }

    async closeWindows(lat: number, long: number) {
        const path = `/api/1/vehicles/${this._vehicleID}/command/window_control`;
        let postData = {
            command: 'close',
            lat,
            long,
        };
        let options = this._getPostOptions(postData);
        return await this._call<ResultReasonResponse>(path, options);
    }

    _addAuthHeader(headers: Headers): void {
        headers.append('Authorization', `Bearer ${this._accessToken}`);
    }
}
