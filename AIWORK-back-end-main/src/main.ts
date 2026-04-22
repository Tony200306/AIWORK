import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import config_env from './config';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

declare const module: any;

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration  
  const config = new DocumentBuilder()
    .setTitle('NestJS Template API')
    .setDescription('Simple, clean, and junior-friendly NestJS API with JWT authentication')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('User', 'User management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(config_env.SWAGGER_ENDPOINT, app, document);

  await app.listen(config_env.PORT, '0.0.0.0');

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(
    `Swagger documentation available at: ${await app.getUrl()}/${config_env.SWAGGER_ENDPOINT}`,
  );

  // Hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
