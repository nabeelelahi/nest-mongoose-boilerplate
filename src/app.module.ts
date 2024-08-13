import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// storage
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
// database
import { MongooseModule } from '@nestjs/mongoose';
import { dbUrl } from 'database/config';
// modules
import { UserModule } from './user/user.module';
// controllers
import { AppController } from './app.controller';
import { RoleController } from './role/role.controller';
import { UserController } from './user/user.controller';
// service
import { AppService } from './app.service';
// middleware
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleWare } from 'middleware/Auth';
import { jwtConstants } from 'config/constants';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d' },
    }),
    MongooseModule.forRoot(dbUrl),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare)
      .exclude(
        { path: 'api/role', method: RequestMethod.GET },
        { path: 'api/user', method: RequestMethod.POST },
        { path: 'api/user/forgot-password', method: RequestMethod.POST },
        { path: 'api/user/verify-code', method: RequestMethod.POST },
        { path: 'api/user/resend-code', method: RequestMethod.POST },
        { path: 'api/user/reset-password', method: RequestMethod.POST },
        { path: 'api/user/login', method: RequestMethod.POST },
      )
      .forRoutes(
        RoleController,
        UserController
      )
  }
}
