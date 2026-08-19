import {
  FetchCitiesParams as FetchCitiesParameters,
  FetchCitiesSuccessCallback,
  FetchCitiesErrorCallback,
  City
} from '../types';

export const fetchCities = (
  parameters: FetchCitiesParameters,
  onSuccess: FetchCitiesSuccessCallback,
  onError?: FetchCitiesErrorCallback
): void => {
  const searchParameters = new URLSearchParams();

  if (parameters.prefix) searchParameters.append('prefix', parameters.prefix);
  if (parameters.lat !== undefined && parameters.lat !== null)
    searchParameters.append('lat', parameters.lat.toString());
  if (parameters.lng !== undefined && parameters.lng !== null)
    searchParameters.append('lng', parameters.lng.toString());
  if (parameters.limit !== undefined) searchParameters.append('limit', parameters.limit.toString());

  fetch(`/api/city?${searchParameters.toString()}`, {
    signal: parameters.signal
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json() as Promise<City[]>;
    })
    .then((cities) => {
      onSuccess(cities);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      if (onError) {
        onError(error);
      } else {
        console.error('Ошибка при загрузке городов:', error);
      }
    });
};
