import {
    Get,
    Delete,
    Req,
    Res,
    Param,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
    Request,
    Response,
} from 'express';
import mongoose from 'mongoose';
import * as _ from 'radash';

interface PaginatedDataDTO {
    count: number
    pageCount: number
    perPage: number
    currentPage: number
    records: Array<any>
}

@ApiBearerAuth('Authorization')
export class BaseController {
    protected _service: any;
    protected _request: Request;
    protected _response: Response;
    protected _body: any;
    protected beforeIndex: Function;
    protected afterIndex: Function;
    protected beforeShow: Function;
    protected afterShow: Function;
    protected beforeCreate: Function;
    protected afterCreate: Function;
    protected beforeUpdate: Function;
    protected afterUpdate: Function;
    protected beforeDelete: Function;
    protected afterDelete: Function;
    protected _is_error: boolean;
    protected _is_paginate: boolean;

    constructor() {
    }

    @Get()
    /**
     * Retrieves records from the database based on the provided query parameters.
     *
     * @param {Request} _request - The request object.
     * @param {Response} _response - The response object.
     * @param {object} _query - The query parameters.
     * @return {Promise<any>} - A promise that resolves to the retrieved records.
     */
    async get(
        @Req() _request: Request,
        @Res() _response: Response,
        @Query() _query: object
    ) {
        this._request = _request;
        this._response = _response;
        // before list
        _.isFunction(this.beforeIndex) && await this.beforeIndex();
        let records = await this._service.get(_request as Request, _query as Object);
        _.isFunction(this.afterIndex) && await this.afterIndex(records);
        this._is_paginate = true;
        return this._sendResponse(200, 'Records retrieved', records);
    }

    @Get('/:id')
    /**
     * Retrieves a record from the database by its ID.
     *
     * @param {Request} _request - The request object.
     * @param {Response} _response - The response object.
     * @param {string} id - The ID of the record to retrieve.
     * @return {Promise<any>} - A promise that resolves to the retrieved record.
     */
    async getById(
        @Req() _request: Request,
        @Res() _response: Response,
        @Param('id') id: string
    ) {
        this._request = _request;
        this._response = _response;
        // before list
        _.isFunction(this.beforeShow) && await this.beforeShow(id);
        let records = await this._service.getById(_request as Request, id);
        _.isFunction(this.afterShow) && await this.afterShow(records, id);
        this._is_paginate = false;
        return this._sendResponse(200, 'Record retrieved', records);
    }

    /**
     * Asynchronously creates a new record in the database.
     *
     * @return {Promise<any>} - The created record.
     * @throws {mongoose.Error.ValidationError} - If there are validation errors.
     */
    async create(): Promise<any> {
        try {
            // before create
            _.isFunction(this.beforeCreate) && await this.beforeCreate()
            let record = await this._service.create(this._request as Request, this._body)
            // after create
            _.isFunction(this.afterCreate) && await this.afterCreate(record);
            this._is_paginate = false;
            return this._sendResponse(200, 'Record created', record);
        }
        catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                let errors = Object.values(err.errors).map(i => i.message)
                return this._sendException(400, 'Validation Error', errors)
            }
        }
    }

    /**
     * Updates a record in the database.
     *
     * @param {string} _id - The ID of the record to update.
     * @return {Promise<any>} - The updated record.
     *  @throws {mongoose.Error.ValidationError} - If there are validation errors.
     */
    async update(_id: string): Promise<any> {
        try {
            // before update
            _.isFunction(this.beforeUpdate) && await this.beforeUpdate(_id)
            let record = await this._service.update(this._request as Request, _id, this._body)
            // after update
            _.isFunction(this.afterUpdate) && await this.afterUpdate(record, _id);
            this._is_paginate = false;
            return this._sendResponse(200, 'Record updated', record);
        }
        catch (err) {
            console.log('err...', err)
            if (err instanceof mongoose.Error.ValidationError) {
                let errors = Object.values(err.errors).map(i => i.message)
                return this._sendException(400, 'Validation Error', errors)
            }
            else if (err instanceof mongoose.Error.CastError) {
                return this._sendException(400, 'Validation Error', ['Invalid Id'])
            }
        }
    }

    @Delete('/:id')
    /**
     * Removes a record from the database based on the provided ID.
     *
     * @param {Request} _request - The request object.
     * @param {Response} _response - The response object.
     * @param {string} id - The ID of the record to remove.
     * @return {Promise<any>} - A promise that resolves to the deleted record.
     */
    async remove(
        @Req() _request: Request,
        @Res() _response: Response,
        @Param('id') id: string
    ) {
        try {
            this._request = _request;
            this._response = _response;
            // before delete
            _.isFunction(this.beforeDelete) && await this.beforeDelete(id as string)
            let record = await this._service.delete(this._request as Request, id as string)
            // after delete
            _.isFunction(this.afterDelete) && await this.afterDelete(record, id as string);
            this._is_paginate = false;
            return this._sendResponse(200, 'Record deleted', record);
        }
        catch (err) {
            console.log('errrr', err)
            if (err instanceof mongoose.Error.CastError) {
                return this._sendException(400, 'Validation Error', ['Invalid Id'])
            }
        }
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
    }

    async _sendException(
        statusCode: number = 200,
        error: string = 'Error',
        message: object,
    ) {
        return this._response.status(statusCode).send({ statusCode, message, error })
    }

}
