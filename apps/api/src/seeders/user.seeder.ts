import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';
import * as usersData from './data/users.json';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(roles: Role[], organizations: Organization[]): Promise<User[]> {
    const userRepository = this.dataSource.getRepository(User);
    const users: User[] = [];

    console.log('🌱 Seeding users...');

    for (const userData of usersData.users) {
      // Check if user already exists
      let user = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (!user) {
        // Find role and organization
        const role = roles.find(r => r.name === userData.role);
        const organization = organizations.find(o => o.name === userData.organization);

        if (role && organization) {
          user = userRepository.create({
            email: userData.email,
            password: userData.password, // Will be hashed by @BeforeInsert
            firstName: userData.firstName,
            lastName: userData.lastName,
            roleId: role.id,
            organizationId: organization.id,
            isActive: true
          });
          
          await userRepository.save(user);
          console.log(`  ✓ Created user: ${user.email} (${role.name} at ${organization.name})`);
        } else {
          console.error(`  ✗ Could not create user ${userData.email}: Role or Organization not found`);
        }
      } else {
        console.log(`  - User already exists: ${user.email}`);
      }

      if (user) {
        users.push(user);
      }
    }

    return users;
  }
}
