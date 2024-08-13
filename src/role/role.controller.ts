import {
    Req,
    Res,
    Controller,
    Post,
    Body,
    Patch,
    Param
} from '@nestjs/common';
import {
    Request,
    Response,
} from 'express';
import { RoleService } from './role.service';
import { RoleDTO } from './role.model';
import { BaseController } from 'src/base/base.controller';

@Controller('api/role')
export class RoleController extends BaseController {

    constructor(override _service: RoleService) {
        super()
    }

    @Post()
    async createValidation(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: RoleDTO,
    ) {
        this._request = _request;
        this._response = _response;
        this._body = _body;
        return await this.create();
    }

    @Patch('/:id')
    async updateValidation(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: RoleDTO,
        @Param('id') _id: string,
    ) {
        this._request = _request;
        this._response = _response;
        this._body = _body;
        return await this.update(_id);
    }

}
