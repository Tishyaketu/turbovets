import { DataSource } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import * as orgsData from './data/organizations.json';

export class OrganizationSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<Organization[]> {
    const orgRepository = this.dataSource.getRepository(Organization);
    const organizations: Organization[] = [];

    console.log('🌱 Seeding organizations...');

    for (const orgData of orgsData.organizations) {
      // Create parent organization
      let parentOrg = await orgRepository.findOne({
        where: { name: orgData.name }
      });

      if (!parentOrg) {
        parentOrg = orgRepository.create({
          name: orgData.name,
          description: orgData.description,
          isActive: true
        });
        await orgRepository.save(parentOrg);
        console.log(`  ✓ Created organization: ${parentOrg.name}`);
      } else {
        console.log(`  - Organization already exists: ${parentOrg.name}`);
      }

      organizations.push(parentOrg);

      // Create child organizations
      if (orgData.children && orgData.children.length > 0) {
        for (const childData of orgData.children) {
          let childOrg = await orgRepository.findOne({
            where: { name: childData.name }
          });

          if (!childOrg) {
            childOrg = orgRepository.create({
              name: childData.name,
              description: childData.description,
              parentId: parentOrg.id,
              isActive: true
            });
            await orgRepository.save(childOrg);
            console.log(`    ✓ Created child organization: ${childOrg.name}`);
          } else {
            console.log(`    - Child organization already exists: ${childOrg.name}`);
          }

          organizations.push(childOrg);
        }
      }
    }

    return organizations;
  }
}