import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { RoleType } from './role.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal'
}

@Entity('tasks')
@Index(['organizationId', 'status'])
@Index(['createdById'])
@Index(['assignedToId'])
export class Task extends BaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({
    type: 'varchar',
    length: 20,
    enum: TaskCategory,
    default: TaskCategory.WORK
  })
  category: TaskCategory;

  @Column({ type: 'int', default: 1 })
  priority: number; // 0 = low, 1 = medium, 2 = high

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  orderIndex: number; // For drag-and-drop

  // Organization relationship
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.tasks)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Creator relationship
  @Column()
  createdById: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  // Assignee relationship
  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  // Helper methods for access control
  canBeAccessedBy(user: User): boolean {
    // Owner and Admin can see all tasks in their org
    if (user.role?.name === RoleType.OWNER || user.role?.name === RoleType.ADMIN) {
      return user.organizationId === this.organizationId;
    }
    
    // Viewer can only see tasks they created or are assigned to
    return this.createdById === user.id || this.assignedToId === user.id;
  }

  canBeModifiedBy(user: User): boolean {
    // Owner and Admin can modify all tasks in their org
    if (user.role?.name === RoleType.OWNER || user.role?.name === RoleType.ADMIN) {
      return user.organizationId === this.organizationId;
    }
    
    // Viewer can only modify tasks they created
    return this.createdById === user.id;
  }

  canBeDeletedBy(user: User): boolean {
    // Only Owner and Admin can delete tasks in their org
    if (user.role?.name === RoleType.OWNER || user.role?.name === RoleType.ADMIN) {
      return user.organizationId === this.organizationId;
    }
    
    return false;
  }
}