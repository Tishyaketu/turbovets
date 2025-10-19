import { DataSource } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';
import * as rolesData from '../seeders/data/roles.json';

export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<Role[]> {
    const roleRepository = this.dataSource.getRepository(Role);
    const roles: Role[] = [];

    console.log('🌱 Seeding roles...');

    for (const roleData of rolesData.roles) {
      // Check if role already exists
      let role = await roleRepository.findOne({
        where: { name: roleData.name as RoleType }
      });

      if (!role) {
        role = roleRepository.create({
          name: roleData.name as RoleType,
          description: roleData.description,
          priority: roleData.priority
        });
        await roleRepository.save(role);
        console.log(`  ✓ Created role: ${role.name}`);
      } else {
        console.log(`  - Role already exists: ${role.name}`);
      }
      
      roles.push(role);
    }

    return roles;
  }
}