export interface POI {
  id: string;
  name: string;
  category: string;
  confidence: number;
  latitude: number;
  longitude: number;
  status: 'ai' | 'verified' | 'rejected'; // 'ai' = yellow, 'verified' = green, 'rejected' = red
}
