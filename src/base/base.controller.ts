import {
    Get,
    Delete,
    Req,
    Res,
    Param,
    Query,
    Next,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
    Request,
    Response,
    NextFunction
} from 'express';
import mongoose from 'mongoose';
import * as _ from 'radash';
import { RestController } from './rest.controller';

interface PaginatedDataDTO {
    count: number
    pageCount: number
    perPage: number
    currentPage: number
    records: Array<any>
}

@ApiBearerAuth('Authorization')
export class BaseController extends RestController {
    protected _service: any;
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

    constructor() {
        super()
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
        @Next() _next: NextFunction,
        @Query() _query: object
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
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
        @Next() _next: NextFunction,
        @Param('id') id: string
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
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
        @Param('id') id: string,
        @Next() _next: NextFunction,
    ) {
        try {
            this._request = _request;
            this._response = _response;
            this._next = _next;
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


}
