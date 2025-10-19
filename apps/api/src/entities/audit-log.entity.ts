import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  
  // Task actions
  TASK_CREATE = 'task_create',
  TASK_READ = 'task_read',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  
  // User actions
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  
  // Permission denied
  PERMISSION_DENIED = 'permission_denied'
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  // User who performed the action
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Action performed
  @Column({
    type: 'varchar',
    length: 50
  })
  action: AuditAction;

  // Resource information
  @Column({ length: 50 })
  resourceType: string; // 'task', 'user', 'organization', 'auth'

  @Column({ nullable: true })
  resourceId: string;

  @Column({ length: 255, nullable: true })
  resourceName: string;

  // Request information
  @Column({ length: 45 })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 10 })
  httpMethod: string;

  @Column({ length: 255 })
  endpoint: string;

  // Result
  @Column({ type: 'int', default: 1 })
  success: number; // SQLite: 0 = false, 1 = true

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  // Metadata
  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  // Organization context
  @Column({ nullable: true })
  organizationId: string;
}
