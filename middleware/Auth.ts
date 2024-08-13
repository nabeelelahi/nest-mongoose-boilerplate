import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'config/constants';
import { User } from 'src/user/dtos/user.model';
import { decrypt } from 'utils/helpers';

@Injectable()
export class AuthMiddleWare implements NestMiddleware {

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async use(_request: Request, _response: Response, next: NextFunction) {
        let token = this.extractTokenFromHeader(_request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            if (!_request.headers?.referer?.includes?.('docs'))
                token = decrypt(token)
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );
            let user = await User.findById(payload['id'])
            if (user) {
                _request['user'] = user;
            }
            else {
                throw new UnauthorizedException();
            }
        } catch (err) {
            console.log('err', err)
            throw new UnauthorizedException();
        }
        next();
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

}
