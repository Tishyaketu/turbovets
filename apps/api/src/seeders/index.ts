import 'reflect-metadata';
import { SeederDataSource } from './seeder.config';
import { DatabaseSeeder } from './database.seeder';

async function runSeeder() {
  try {
    console.log('📡 Connecting to database...\n');
    
    // Initialize the data source
    await SeederDataSource.initialize();
    
    // Run the main seeder
    const seeder = new DatabaseSeeder(SeederDataSource);
    await seeder.seed();
    
    // Close connection
    await SeederDataSource.destroy();
    
    console.log('\n👋 Seeding complete, connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeder();
}