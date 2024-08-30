import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_CONECTION_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_CONECTION_USERNAME || 'admin',
      password: process.env.DATABASE_CONECTION_PASS || 'admin',
      database: 'expenses',
      entities: [],
      synchronize: true, // Do not use in production
    }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
