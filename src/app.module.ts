import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeasuresModule } from './measures/measures.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measure } from './measures/entities/measure.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_CONECTION_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_CONECTION_USERNAME || 'admin',
      password: process.env.DATABASE_CONECTION_PASS || 'admin',
      database: 'expenses',
      entities: [Measure],
      synchronize: true, // Do not use in production
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MeasuresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
