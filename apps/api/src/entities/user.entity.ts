import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { Role, RoleType } from './role.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['organizationId', 'roleId'])
export class User extends BaseEntity {
  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLogin: Date;

  // Organization relationship
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Role relationship - separate entity now
  @Column()
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // Task relationships
  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  // Audit logs
  @OneToMany(() => AuditLog, (audit) => audit.user)
  auditLogs: AuditLog[];

  // JWT refresh token support
  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpiry: Date;

  // Password hashing
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Password validation
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Helper methods for RBAC
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isOwner(): boolean {
    return this.role?.name === RoleType.OWNER;
  }

  isAdmin(): boolean {
    return this.role?.name === RoleType.ADMIN;
  }

  isViewer(): boolean {
    return this.role?.name === RoleType.VIEWER;
  }

  isAdminOrHigher(): boolean {
    return this.role?.priority >= 50; // Admin is 50, Owner is 100
  }

  canManageTasks(): boolean {
    return this.role?.priority >= 50; // Admin and Owner
  }

  canViewAllTasks(): boolean {
    return this.role?.priority >= 50; // Admin and Owner
  }

  hasPermission(permissionType: string): boolean {
    return this.role?.permissions?.some(p => p.name === permissionType) || false;
  }
}
