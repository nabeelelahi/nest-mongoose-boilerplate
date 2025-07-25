import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { schema, name } from './dtos/user.model';
import { Request } from 'express';
import { BaseService, PaginatedDataDTO } from 'src/base/base.service';
import { strSlug } from 'utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { bycryptConstants, verificationConstant } from 'config/constants';
import { FileUpload } from 'services/FileUpload';
import { randomUUID } from 'crypto'
import { UserDTO } from './dtos/user.dto';
import { LoginDTO } from './dtos/login.dto';
import { VerifyCodeDTO } from './dtos/verify-code.dto';


@Injectable()
export class UserService extends BaseService {
    constructor(
        @InjectModel(name) override _model: Model<typeof schema>, protected jwtService: JwtService,
    ) {
        super()
    }

    public override _softDelete = () => true;

    public override _fillables = () => [
        "role",
        "name",
        "email",
        "username",
        "image_url",
        "mobile_no",
        "gender",
        "age",
        "address",
        "country",
        "city",
        "state",
        "current_location",
        "latitude",
        "longitude",
        "online_status",
        "payment_active",
        "email_verified",
        "mobile_no_verified",
        "slug",
        "created_at"
    ]

    protected override _beforeCreateHook = async (_request: Request, payload: any) => {
        let { email, ...res } = payload;
        if (_request.file)
            res['image_url'] = await FileUpload.upload(_request.file as Express.Multer.File);
        let username = await this.generateUserName(email?.split('@')[0]);
        let verification_code = '0000';
        verification_code = await bcrypt.hash(verification_code, +bycryptConstants.salt);
        email = email.toLocaleLowerCase();
        return { username, email, verification_code, ...res };
    }

    protected override _beforeUpdateHook = async (_request: Request, payload: any) => {
        if (_request.file) {
            payload['image_url'] = await FileUpload.upload(_request.file as Express.Multer.File);
        }
        if (payload['longitude'] && payload['latitude']) {
            payload['current_location'] = { type: 'Point', coordinates: [payload['longitude'], payload['latitude']] }
        }
        return payload;
    };


    async verifyCredentails(_body: LoginDTO): Promise<any> {
        let user = await this.findOne({ [verificationConstant.mode]: _body[verificationConstant.mode].toLocaleLowerCase(), deleted_at: null });
        if (!user) return false;
        let verifyPassword = bcrypt.compareSync(_body['password'], user['password']);
        if (!verifyPassword) return false;
        return user;
    }

    async verifyCode(_body: VerifyCodeDTO): Promise<boolean | string> {
        let user = await this.findOne({ [verificationConstant.mode]: _body[verificationConstant.mode].toLocaleLowerCase() });
        if (!user) return false;
        let verifyCode: boolean
        try {
            verifyCode = await bcrypt.compare(_body['code'], user['verification_code']);
        }
        catch {
            return false
        }
        if (!verifyCode) return false;
        let reset_password_token = randomUUID();
        console.log('reset_password_token...', reset_password_token)
        let payload: { verification_code: string, email_verified?: boolean, mobile_no_verified?: boolean, reset_password_token: string } = {
            verification_code: null,
            reset_password_token,
            [`${verificationConstant.mode}_verified`]: true
        };
        await this._model.findOneAndUpdate({ [verificationConstant.mode]: _body[verificationConstant.mode].toLocaleLowerCase() }, payload)
        return reset_password_token;
    }

    async resetVerificationCode(_body: { email: string }): Promise<boolean> {
        let verification_code = '0000'
        verification_code = await bcrypt.hash(verification_code, +bycryptConstants.salt);
        await this._model.findOneAndUpdate({ [verificationConstant.mode]: _body[verificationConstant.mode].toLocaleLowerCase() }, { verification_code })
        return true
    }

    async setPassword(_request: Request, _body: { password: string }): Promise<boolean> {
        let password = await bcrypt.hash(_body['password'], +bycryptConstants.salt);
        let user = await this.findOne({ [verificationConstant.mode]: _request['user'][verificationConstant.mode].toLocaleLowerCase() });
        if (!user) return false
        await this._model.findOneAndUpdate({ [verificationConstant.mode]: user[verificationConstant.mode].toLocaleLowerCase() }, { password })
        return true
    }

    async changePassword(_request: Request, _body: { oldPassword: string, newPassword: string }): Promise<{ success: boolean, message: string }> {
        let user = _request['user']
        let verifyPassword = bcrypt.compareSync(_body['oldPassword'], user['password']);
        if (!verifyPassword) return { success: false, message: 'Old Password Is Not Valid' };
        verifyPassword = bcrypt.compareSync(_body['newPassword'], user['password']);
        if (verifyPassword) return { success: false, message: 'New Password Cannot Be The Same As The Old Password' };
        let password = await bcrypt.hash(_body['newPassword'], +bycryptConstants.salt);
        await this._model.findOneAndUpdate({ [verificationConstant.mode]: user[verificationConstant.mode].toLocaleLowerCase() }, { password })
        return { success: true, message: 'Reset Password Successfully' }
    }

    verifyStatuses(user: UserDTO): { success: boolean, message: string } {
        if (!user.email_verified)
            return { success: false, message: 'Email not verified' };
        if (!user.status)
            return { success: false, message: 'Your account is deactivated' };
        return { success: true, message: 'Verified' };
    }

    async generateToken(user: UserDTO): Promise<string> {
        let payload = { username: user.username, id: user._id };
        return await this.jwtService.signAsync(payload)
    }

    /**
     * Generates a unique username based on the given name.
     *
     * @param {string} name - The name to generate the username from.
     * @return {Promise<string>} The generated username.
     */
    async generateUserName(name: string): Promise<string> {
        let username = strSlug(name);
        let usernameExists = await this.verifyUser({ username });
        while (usernameExists) {
            username = `${username}-${Math.floor(Math.random() * 1000)}`
            usernameExists = await this.verifyUser({ username });
        }
        return username;
    }

    /**
     * Async function to verify if a user exists based on a condition.
     *
     * @param {object} condition - The condition to verify the user.
     * @return {Promise<boolean>} A boolean indicating if the user is verified or not.
     */
    async verifyUser(condition: object): Promise<boolean> {
        let record = await this.findOne(condition);
        return record ? true : false;
    }

    /**
     * Asynchronously finds and returns a single document from the collection that matches the specified condition.
     *
     * @param {object} condition - The condition used to filter the documents to be returned.
     * @return {Promise<UserDTO>} A Promise that resolves to the first document that matches the condition, or null if no such document exists.
     */
    async findOne(condition: object, select: Array<string> = []): Promise<object> {
        return await this._model.findOne({ ...condition, deleted_at: null }).select(select).exec();
    }

}