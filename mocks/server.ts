import { Hono } from 'hono';
import { cors } from 'hono/cors';

export type City = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export const allCities: City[] = [
  { id: 1, name: 'Абакан', lat: 53.72, lng: 91.43 },
  { id: 6, name: 'Балаково', lat: 52.03, lng: 47.8 },
  { id: 7, name: 'Балахна', lat: 56.49, lng: 43.6 },
  { id: 8, name: 'Балашиха', lat: 55.81, lng: 37.96 },
  { id: 9, name: 'Балашов', lat: 51.55, lng: 43.17 },
  { id: 2, name: 'Москва', lat: 55.75, lng: 37.62 },
  { id: 3, name: 'Новосибирск', lat: 55.04, lng: 82.93 },
  { id: 4, name: 'Оренбург', lat: 51.77, lng: 55.1 },
  { id: 5, name: 'Орёл', lat: 52.97, lng: 36.08 }
];

const calculateDistance = (x1: number, x2: number, y1: number, y2: number) => {
  return Math.hypot(x2 - x1, y2 - y1);
};

type UserPoint = { lat: number | null; lng: number | null };

const sortCitiesByDistance = (
  cities: City[],
  { lat: userLat, lng: userLng }: UserPoint
): City[] => {
  if (
    typeof userLng !== 'number' ||
    typeof userLat !== 'number' ||
    !Number.isFinite(userLat) ||
    !Number.isFinite(userLng)
  ) {
    return cities;
  }
  return cities
    .map((city) => ({
      city,
      distance: calculateDistance(userLat, city.lat, userLng, city.lng)
    }))
    .toSorted((a, b) => a.distance - b.distance)
    .map(({ city }) => city);
};

const app = new Hono();

const userState = {
  currentCityId: null as number | null
};

app.use('*', cors());

app.get('/api/city', (c) => {
  const prefix = c.req.query('prefix') || null;
  const latParameter = c.req.query('lat');
  const lngParameter = c.req.query('lng');
  const limitParameter = c.req.query('limit');

  const lat = latParameter ? Number(latParameter) : null;
  const lng = lngParameter ? Number(lngParameter) : null;
  const limit = limitParameter ? Number(limitParameter) : 10;

  let result = allCities;

  if (prefix) {
    const lowerPrefix = prefix.toLowerCase();
    result = result.filter(({ name }) => name.toLowerCase().startsWith(lowerPrefix));
  }

  result = sortCitiesByDistance(result, {
    lat: lat !== null && Number.isFinite(lat) ? lat : null,
    lng: lng !== null && Number.isFinite(lng) ? lng : null
  });

  return c.json(result.slice(0, Number.isFinite(limit) ? limit : 10));
});

app.get('/api/city/:id', (c) => {
  const cityId = Number(c.req.param('id'));
  const city = allCities.find(({ id }) => id === cityId);

  if (!city) {
    return c.text('Not Found', 404);
  }

  return c.json(city);
});

app.patch('/api/user/1', async (c) => {
  const body = await c.req.json<{ currentCityId?: number | null }>();
  const newCurrentCityId = body.currentCityId;

  if (
    newCurrentCityId !== undefined &&
    (newCurrentCityId === null || allCities.some(({ id }) => id === newCurrentCityId))
  ) {
    userState.currentCityId = newCurrentCityId;
  }

  return c.json({ id: 1, currentCityId: userState.currentCityId });
});

app.get('/api/user/1', (c) => {
  return c.json({ id: 1, currentCityId: userState.currentCityId });
});

export default {
  port: 3100,
  fetch: app.fetch
};
