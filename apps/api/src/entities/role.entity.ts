import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Permission } from './permission.entity';

export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
    enum: RoleType,
    unique: true
  })
  name: RoleType;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Priority for role hierarchy: Owner(100) > Admin(50) > Viewer(10)
  @Column({ type: 'int' })
  priority: number;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  // Helper method to check if role has permission
  hasPermission(permissionName: string): boolean {
    return this.permissions?.some(p => p.name === permissionName) || false;
  }
}
