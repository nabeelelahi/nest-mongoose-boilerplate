import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import connect from 'database/config';
import { PORT } from 'config/constants'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  // mongoose connection
  await connect()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  // swagger set up
  const config = new DocumentBuilder()
    .setTitle('Nest JS API')
    .setDescription('This is the api documentation of Nest JS')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Authorization'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    'docs',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    }
  );
  SwaggerModule.setup('docs', app, document);
  // cors set up
  app.enableCors({
    origin: '*',
    exposedHeaders: ['access_token', 'Authorization']
  });
  // view engine
  app.setBaseViewsDir(join(__dirname, '../public', 'views'));
  app.setViewEngine('ejs');
  // validation piplines
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // app listen
  await app.listen(PORT || 3001);
}
bootstrap();
