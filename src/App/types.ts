export type OptionType = {
  id: number;
  label: string;
};

export type City = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export type FetchCitiesParams = {
  prefix?: string;
  lat?: number | null;
  lng?: number | null;
  limit?: number;
  signal?: AbortSignal;
};

export type FetchCitiesSuccessCallback = (cities: City[]) => void;
export type FetchCitiesErrorCallback = (error: unknown) => void;
