export interface Geocoded {
  Address: string;
  address: string;
  address_bn: string;
  address_short: string;
  area: string;
  city: string;
  district: string;
  holding_number: string;
  latitude: string;
  longitude: string;
  pType: string;
  postCode: number;
  road_name_number: string;
  sub_area: string;
  super_sub_area: string | null;
  thana: string;
  uCode: string;
  unions: string | null;
}

export interface Rupantor {
  address: string;
  address_bn: string;
  confidence_score_percentage: number;
  geocoded: Geocoded;
  hostname: string;
  input_address: string;
  parsed_address: {
    area: string;
    parsed_area: string;
    parsed_block: string | null;
    parsed_building_name: string | null;
    parsed_district: string | null;
    parsed_house: string;
    parsed_road: string;
    parsed_score: number;
    parsed_sub_district: string | null;
    parsed_subarea: string | null;
    parsed_super_subarea: string | null;
    parsed_union: string | null;
    pattern: string[];
  };
  status: string;
}

export interface POI {
  id?: string; // Generated internally
  poi_name: string | null;
  street_road_name_number: string;
  address: string;
  isEditEnabled?: boolean; // New field to track edit permissions per POI
  rupantor: Rupantor;
  location: {
    lat: number;
    lng: number;
  };
  status?: "ai" | "verified" | "edited" | "rejected";
  info?: {
    predict_doc: {
      poi_name: string | null;
      street_road_name_number: string | null;
      address: string | null;
      rupantor: Rupantor;
    };
    info: {
      exist: boolean;
      latitude: number;
      longitude: number;
    };
  };
}

export interface MarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  contactNo?: string;
  details?: string;
  serviceType?: string;
}

export interface CSVMarkerData {
  event_contact_no: string;
  event_details: string;
  latitude: string;
  longitude: string;
  service_type: string;
}
