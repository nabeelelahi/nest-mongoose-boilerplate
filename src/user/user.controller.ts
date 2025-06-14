import {
    Controller,
    Post,
    Patch,
    Req,
    Res,
    Body,
    Param,
    UseInterceptors,
    Next,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    Request,
    Response,
    NextFunction
} from 'express';
import { UserService } from './user.service';
import { BaseController } from 'src/base/base.controller';
import { storageConstants, verificationConstant } from 'config/constants';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserDTO } from './dtos/user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { VerifyCodeDTO } from './dtos/verify-code.dto';
import { ForgotDTO } from './dtos/forgot.dto';
import { SetPaswordDTO } from './dtos/set-password.dto';
import { ChangePaswordDTO } from './dtos/change-password.dto';

@ApiTags('User Management')
@Controller('api/user')
export class UserController extends BaseController {

    constructor(override _service: UserService) {
        super()
    }

    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', { storage: storageConstants.multer.storage }))
    async createValidation(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: UserDTO,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        this._body = _body;
        return await this.create();
    }

    @Patch('/:id')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', { storage: storageConstants.multer.storage }))
    async updateValidation(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: UpdateUserDTO,
        @Param('id') _id: string,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        this._body = _body;
        return await this.update(_id);
    }

    override beforeCreate = async () => {
        let emailExists = await this._service.verifyUser({ [verificationConstant.mode]: this._body[verificationConstant.mode].toLocaleLowerCase() });
        if (emailExists)
            return this._sendException(400, 'Validation Error', ['Email already exists']);
        let phoneExists = await this._service.verifyUser({ mobile_no: this._body['mobile_no'] });
        if (phoneExists)
            return this._sendException(400, 'Validation Error', ['Mobile no. already exists']);
    };

    override afterCreate = async (record: UserDTO) => {
        let access_token = await this._service.generateToken(record);
        this._response.setHeader('access_token', access_token);
    };
    @Post('/login')
    async login(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: LoginDTO,
        @Next() _next: NextFunction
    ): Promise<any> {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        let user = await this._service.verifyCredentails(_body);
        if (!user)
            return this._sendException(400, 'Validation Error', ['Invalid Credentials']);
        let { success, message } = this._service.verifyStatuses(user as UserDTO);
        if (!success)
            return this._sendException(401, 'Validation Error', [message]);
        let access_token = await this._service.generateToken(user);
        user = await this._service.findOne({ [verificationConstant.mode]: user[verificationConstant.mode] }, this._service._fillables());
        console.log('user....', user)
        this._is_paginate = false;
        return await this._sendResponse(200, 'Login Successful', user, { access_token });
    }

    @ApiBearerAuth('Authorization')
    @Post('/verify-code')
    async verifyCode(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: VerifyCodeDTO,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        let verified = await this._service.verifyCode(_body);
        if (verified && typeof verified === 'string') return this._sendResponse(200, 'Verification Successful', {}, { reset_password_token: verified });
        else return this._sendException(400, 'Validation Error', ['Invalid Code']);
    }

    @ApiBearerAuth('Authorization')
    @Post('/resend-code')
    async resendCode(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: ForgotDTO,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        await this._service.resetVerificationCode(_body)
        return this._sendResponse(200, 'Code Sent Successfully', {});
    }

    @ApiBearerAuth('Authorization')
    @Post('/set-password')
    async setPassword(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: SetPaswordDTO,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        let success = await this._service.setPassword(_request, _body);
        if (success)
            return this._sendResponse(200, 'Reset Password Successfully', {});
        else
            return this._sendException(400, 'Validation Error', ['Invalid Token']);
    }

    @ApiBearerAuth('Authorization')
    @Post('/change-password')
    async changePassword(
        @Req() _request: Request,
        @Res() _response: Response,
        @Body() _body: ChangePaswordDTO,
        @Next() _next: NextFunction
    ) {
        this._request = _request;
        this._response = _response;
        this._next = _next;
        let { success, message } = await this._service.changePassword(_request, _body);
        if (success)
            return this._sendResponse(200, message, {});
        else
            return this._sendException(400, 'Validation Error', [message]);
    }

}
