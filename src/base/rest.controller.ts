import { NextFunction, Request, Response } from "express";
import { PaginatedDataDTO } from "./base.service";

export class RestController {
    protected _request: Request;
    protected _response: Response;
    protected _next: NextFunction;
    protected _is_error: boolean;
    protected _is_paginate: boolean;

    constructor() {

    }

    /**
     * Sends a response with the specified status code, message, and data.
     * If the `_is_paginate` property is true, the response will include pagination links.
     *
     * @param {number} statusCode - The HTTP status code of the response. Default is 200.
     * @param {string} message - The message to include in the response. Default is 'Success'.
     * @param {object} data - The data to include in the response.
     * @return {Promise<void>} A promise that resolves to the response object.
     */
    async _sendResponse(
        statusCode: number = 200,
        message: string = 'Success',
        data: object,
        headers: object = {}
    ): Promise<void> {
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                this._response.setHeader(key, value)
            })
        }
        if (this._is_paginate) {
            let { records, ...pagination } = data as PaginatedDataDTO;
            if (pagination) this._response.setHeader('pagination', JSON.stringify(pagination))
            this._response.status(statusCode).send({
                statusCode, message, data: records
            })
        }
        else {
            this._response.status(statusCode).send({ statusCode, message, data })
        }
        return this._next?.();
    }

    async _sendException(
        statusCode: number = 200,
        error: string = 'Error',
        message: object,
    ) {
        this._response.status(statusCode).send({ statusCode, message, error })
        return this._next?.();
    }
}