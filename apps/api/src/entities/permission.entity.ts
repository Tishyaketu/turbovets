import {
  Entity,
  Column,
  ManyToMany,
  Index
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

export enum PermissionType {
  // Task permissions
  CREATE_TASK = 'create_task',
  READ_TASK = 'read_task',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Organization management
  MANAGE_ORGANIZATION = 'manage_organization',
  
  // Audit log access
  VIEW_AUDIT_LOG = 'view_audit_log',
  
  // Special permissions
  VIEW_ALL_TASKS = 'view_all_tasks',
  MANAGE_ALL_TASKS = 'manage_all_tasks'
}

@Entity('permissions')
@Index(['name'], { unique: true })
export class Permission extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    enum: PermissionType,
    unique: true
  })
  name: PermissionType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  resource: string; // 'task', 'user', 'organization', 'audit'

  @Column({ length: 20, nullable: true })
  action: string; // 'create', 'read', 'update', 'delete', 'manage', 'view'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}