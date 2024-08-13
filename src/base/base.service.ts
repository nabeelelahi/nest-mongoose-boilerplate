import { Model } from 'mongoose';
import { Request } from 'express';
import * as _ from 'radash'

export interface PaginatedDataDTO {
    count: number
    pageCount: number
    perPage: number
    currentPage: number
    records: Array<any>
}

export class BaseService {
    protected _model: any;
    protected _softDelete: Function;
    protected _exceptUpdateFields: Function;
    protected _fillables: Function;
    protected _beforeGetHook: Function;
    protected _beforeShowHook: Function;
    protected _beforeCreateHook: Function;
    protected _afterCreateHook: Function;
    protected _beforeUpdateHook: Function;
    protected _afterUpdateHook: Function;
    protected _beforeDeleteHook: Function;
    protected _afterDeleteHook: Function;

    constructor() { }

    /**
     * Retrieves records from the database based on the provided query parameters.
     *
     * @param {Request} _request - The request object.
     * @param {any} _query - The query parameters.
     * @return {Promise<PaginatedDataDTO>} - The retrieved records, count, page count, per page limit, and current page number.
     */
    async get(_request: Request, _query: any): Promise<PaginatedDataDTO> {
        let query = this._model.find();
        let { page, limit, ...condition } = _query;
        if (_.isFunction(this._beforeGetHook))
            await this._beforeGetHook(_request as Request, query as any, condition as any);
        limit = parseInt(limit) || 10
        page = parseInt(page) - 1 || 0
        let records = await query.where({ deleted_at: null }).select(this._fillables?.() || []).skip(page * limit).limit(limit).exec();
        let count = await this._model.countDocuments(condition);
        return { records, count, pageCount: Math.ceil(count / limit), perPage: limit, currentPage: page + 1 }
    }

    /**
     * Retrieves a document from the database by its ID.
     *
     * @param {Request} _request - The request object.
     * @param {string} _id - The ID of the document to retrieve.
     * @return {Promise<any>} - A promise that resolves to the retrieved document.
     */
    async getById(_request: Request, _id: string): Promise<any> {
        let query = this._model.findById(_id);
        if (_.isFunction(this._beforeShowHook))
            await this._beforeShowHook(_request as Request, query as any);
        return await query.where({ deleted_at: null }).select(this._fillables?.() || []).exec();
    }

    /**
     * Creates a new record in the database.
     *
     * @param {Request} _request - The request object.
     * @param {any} body - The data for the new record.
     * @return {Promise<any>} - The created record.
     */
    async create(_request: Request, body: any): Promise<any> {
        let payload = { ...body };
        if (_.isFunction(this._beforeCreateHook)) {
            let returnedValue = await this._beforeCreateHook(_request as Request, payload as object);
            if (typeof returnedValue !== 'undefined') payload = returnedValue;
        }
        let record = await this._model.create(payload);
        if (_.isFunction(this._afterCreateHook)) {
            await this._afterCreateHook(_request as Request, payload as object, record as object)
        }
        record = await this.getById(_request as Request, record._id as string)
        return record;
    }

    /**
     * Updates a record in the database.
     *
     * @param {Request} _request - The request object.
     * @param {string} _id - The ID of the record to update.
     * @param {any} body - The updated data for the record.
     * @return {Promise<any>} - The updated record.
     */
    async update(_request: Request, _id: string, body: any): Promise<any> {
        let payload = { ...body };
        if (_.isFunction(this._beforeUpdateHook)) {
            let returnedValue = await this._beforeUpdateHook(_request as Request, payload as object, _id as string);
            if (typeof returnedValue !== 'undefined') payload = returnedValue;
        }
        await this._model.findByIdAndUpdate(_id, payload)
        let record = await this.getById(_request as Request, _id as string);
        if (_.isFunction(this._afterUpdateHook)) {
            let returnedValue = await this._afterUpdateHook(_request as Request, payload as object, _id as string, record as object);
            if (returnedValue !== 'undefined') payload = returnedValue;
        }
        return record;
    }

    /**
     * Deletes a record from the database.
     *
     * @param {Request} _request - The request object.
     * @param {string} _id - The ID of the record to delete.
     * @return {Promise<{_id?: string}>} - The deleted record's ID.
     */
    async delete(_request: Request, _id: string): Promise<{ _id?: string }> {
        let softDelete = true;
        let record = await this.getById(_request as Request, _id as string);
        console.log('record', record, _id)
        if (_.isFunction(this._beforeDeleteHook)) {
            await this._beforeDeleteHook(_request as Request, _id as string);
        }
        if (_.isFunction(this._softDelete))
            softDelete = this._softDelete();
        if (softDelete === false) {
            await this._model.findByIdAndDelete(_id)
        }
        else {
            await this._model.findByIdAndUpdate(_id, { deleted_at: new Date() })
        }
        if (_.isFunction(this._afterDeleteHook)) {
            await this._afterDeleteHook(_request as Request, _id as string);
        }
        return { _id: record?._id };
    }

}