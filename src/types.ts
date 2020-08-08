export type VehicleCountResponse = {
    response: VehicleInfo[];
    count: number;
};

export type OAuthResponse = {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    refresh_token: string;
    created_at: number;
};

export type ResultReasonResponse = {
    response: {
        result: boolean,
        reason: string,
    }
};

export type VehicleInfo = {
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

export type BasicVehicleCallResponse = {
    response: VehicleInfo;
};

export type ChargeInfo = {
    charging_state: string,
    fast_charger_type: string,
    fast_charger_brand: string,
    charge_limit_soc: number,
    charge_limit_soc_std: number,
    charge_limit_soc_min: number,
    charge_limit_soc_max: number,
    charge_to_max_range: boolean,
    max_range_charge_counter: number,
    fast_charger_present: boolean,
    battery_range: number,
    est_battery_range: number,
    ideal_battery_range: number,
    battery_level: number,
    usable_battery_level: number,
    charge_energy_added: number,
    charge_miles_added_rated: number,
    charge_miles_added_ideal: number,
    charger_voltage: number,
    charger_pilot_current: number,
    charger_actual_current: number,
    charger_power: number,
    time_to_full_charge: number,
    trip_charging: boolean,
    charge_rate: number,
    charge_port_door_open: boolean,
    conn_charge_cable: string,
    scheduled_charging_start_time: any,
    scheduled_charging_pending: boolean,
    user_charge_enable_request: any,
    charge_enable_request: boolean,
    charger_phases: any,
    charge_port_latch: string,
    charge_current_request: number,
    charge_current_request_max: number,
    managed_charging_active: boolean,
    managed_charging_user_canceled: boolean,
    managed_charging_start_time: any,
    battery_heater_on: boolean,
    not_enough_power_to_heat: boolean,
    timestamp: Date, // number?
};

export type ChargeInfoCallResponse = {
    response: ChargeInfo;
};

export interface RequestInitWithHeaders extends RequestInit {
    headers: Headers;
}