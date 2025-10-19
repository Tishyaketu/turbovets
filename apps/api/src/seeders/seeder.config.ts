import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const SeederDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'task-management.db',
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
});