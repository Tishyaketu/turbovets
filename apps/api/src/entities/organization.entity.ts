import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('organizations')
@Index(['name'], { unique: true })
export class Organization extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  parentId: string;

  // Self-referencing for 2-level hierarchy
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks: Task[];

  @Column({ default: true })
  isActive: boolean;
}
