interface ReverseGeoResponse {
  place: {
    address: string;
    area: string;
    city: string;
    country: string;
    district: string;
    division: string;
    sub_district: string;
    union: string;
    pauroshova: string;
    postCode: string;
    location_type: string;
    thana: string;
    bangla: {
      address: string;
      area: string;
      city: string;
      country: string;
      district: string;
      division: string;
    };
    uCode: string;
    latitude: string;
    longitude: string;
    pType: string;
    address_components: {
      area: string;
      city: string;
      district: string;
      division: string;
      postCode: string;
      location: string;
      house: string;
      road: string;
      thana: string;
      union: string;
      sub_district: string;
      country: string;
    };
  };
  status: number;
}

export async function getReverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeoResponse> {
  const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;
  const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${apiKey}&latitude=${lat}&longitude=${lon}&country=true&district=true&post_code=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true&thana=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch reverse geocode data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reverse geocode:", error);
    throw error;
  }
}
