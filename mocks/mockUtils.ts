import {Request} from "express";

export const getStringQueryParam = (req: Request, paramName: string): string | null => {
    const param = req.query[paramName];
    return typeof param === 'string' ? param : null;
}

export const getNumberQueryParam = (req: Request, paramName: string): number | null => {
    const stringParam = getStringQueryParam(req, paramName) || '';
    const param = stringParam ? parseFloat(stringParam) : null
    return Number.isFinite(param) ? param : null;
}