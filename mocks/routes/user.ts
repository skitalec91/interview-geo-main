import type {Request, Response} from 'express';
import {allCities} from "../fixtures/city";

let currentCityId: number | null = 1;

export default [
    {
        "id": "patch-user",
        "url": "/api/user/1",
        "method": "PATCH",
        "variants": [
            {
                id: "success",
                type: "middleware",
                options: {
                    middleware: (req: Request, res: Response) => {
                        res.status(200);
                        const {currentCityId: newCurrentCityId} = req.body;

                        if (newCurrentCityId && allCities.find(({id}) => id === newCurrentCityId)) {
                            currentCityId = newCurrentCityId;
                        }

                        if (newCurrentCityId === null) {
                            currentCityId = null;
                        }

                        res.send({
                            id: 1,
                            currentCityId,
                        });
                    },
                },
            },
        ]
    },
    {
        "id": "get-user",
        "url": "/api/user/1",
        "method": "GET",
        "variants": [
            {
                id: "success",
                type: "middleware",
                options: {
                    middleware: (req: Request, res: Response) => {
                        res.status(200);
                        res.send({
                            id: 1,
                            currentCityId,
                        });
                    },
                },
            },
        ]
    }
];