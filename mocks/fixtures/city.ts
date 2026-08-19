export type City = {
    id: number;
    name: string;
    lat: number;
    lng: number;
};
export const allCities: Array<City> = [
    {
        id: 1,
        name: 'Абакан',
        lat: 53.72,
        lng: 91.43,
    },
    {name: 'Балаково', id: 6, lat: 52.03, lng: 47.8,},
    {name: 'Балахна', id: 7, lat: 56.49, lng: 43.6,},
    {name: 'Балашиха', id: 8, lat: 55.81, lng: 37.96,},
    {name: 'Балашов', id: 9, lat: 51.55, lng: 43.17,},
    {
        id: 2,
        name: 'Москва',
        lat: 55.75,
        lng: 37.62,
    },
    {
        id: 3,
        name: 'Новосибирск',
        lat: 55.04,
        lng: 82.93,
    },
    {
        id: 4,
        name: 'Оренбург',
        lat: 51.77,
        lng: 55.1,
    },
    {
        id: 5,
        name: 'Орёл',
        lat: 52.97,
        lng: 36.08,
    },
];