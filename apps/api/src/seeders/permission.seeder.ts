import { DataSource } from 'typeorm';
import { Permission, PermissionType } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import * as permissionsData from './data/permissions.json';

export class PermissionSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(roles: Role[]): Promise<Permission[]> {
    const permissionRepository = this.dataSource.getRepository(Permission);
    const roleRepository = this.dataSource.getRepository(Role);
    const permissions: Permission[] = [];

    console.log('🌱 Seeding permissions...');

    for (const permData of permissionsData.permissions) {
      // Check if permission already exists
      let permission = await permissionRepository.findOne({
        where: { name: permData.name as PermissionType }
      });

      if (!permission) {
        permission = permissionRepository.create({
          name: permData.name as PermissionType,
          description: permData.description,
          resource: permData.resource,
          action: permData.action
        });
        await permissionRepository.save(permission);
        console.log(`  ✓ Created permission: ${permission.name}`);
      } else {
        console.log(`  - Permission already exists: ${permission.name}`);
      }

      // Assign permission to roles
      for (const roleName of permData.roles) {
        const role = roles.find(r => r.name === roleName);
        if (role) {
          // Load role with permissions
          const roleWithPerms = await roleRepository.findOne({
            where: { id: role.id },
            relations: ['permissions']
          });

          if (roleWithPerms) {
            const hasPermission = roleWithPerms.permissions?.some(p => p.id === permission.id);
            
            if (!hasPermission) {
              if (!roleWithPerms.permissions) {
                roleWithPerms.permissions = [];
              }
              roleWithPerms.permissions.push(permission);
              await roleRepository.save(roleWithPerms);
              console.log(`    → Assigned ${permission.name} to ${roleName}`);
            }
          }
        }
      }

      permissions.push(permission);
    }

    return permissions;
  }
}