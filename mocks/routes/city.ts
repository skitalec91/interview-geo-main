import {allCities, City} from "../fixtures/city";
import {Request, Response} from "express";
import {getNumberQueryParam, getStringQueryParam} from "../mockUtils";

const filterCitiesByPrefix = (cities: Array<City>, prefix: string | null) => {
  const stringPrefix = (prefix || '').toLowerCase();
  return prefix ? cities.filter(({name}) => name.toLowerCase().startsWith(stringPrefix)) : cities;
};

const calculateDistance = (x1: number, x2: number, y1: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

type UserPoint = {lat: number | null, lng: number | null};
const sortCitiesByDistance = (cities: Array<City>, {lat: userLat, lng: userLng}: UserPoint): Array<City> => {
  if (typeof userLng !== 'number' || typeof userLat !== 'number') {
    return cities;
  }
  return cities
      .map((city) => {
        const {lat, lng} = city;
        const distance = calculateDistance(userLat, lat, userLng, lng);
        return {city, distance};
      })
      .sort(({distance: distance1}, {distance: distance2}) => {
        return distance1 - distance2;
      })
      .map(({city}) => city);
};

export default [
  {
    "id": "get-cities",
    "url": "/api/city",
    "method": "GET",
    "variants": [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req: Request, res: Response) => {
            const prefix = getStringQueryParam(req, 'prefix');
            const citiesFilteredByPrefix = filterCitiesByPrefix(allCities, prefix);

            const lat = getNumberQueryParam(req, 'lat');
            const lng = getNumberQueryParam(req, 'lng');
            const citiesSortedByDistance = sortCitiesByDistance(citiesFilteredByPrefix, {lat, lng});

            const limit = getNumberQueryParam(req, 'limit') || 10;
            const limitedResponse = citiesSortedByDistance.slice(0, limit);

            res.status(200);
            res.send(limitedResponse);
          },
        },
      },
    ]
  },
  {
    "id": "get-city",
    "url": "/api/city/:id",
    "method": "GET",
    "variants": [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req: Request, res: Response) => {
            const cityId = parseInt(req.params.id, 10);

            const city = allCities.find(({id}) => id === cityId);

            if (!city) {
              res.sendStatus(404);
              return;
            }

            res.status(200);
            res.send(city);
          },
        },
      },
    ]
  },
];