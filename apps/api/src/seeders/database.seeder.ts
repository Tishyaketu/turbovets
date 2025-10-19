import { DataSource } from 'typeorm';
import { RoleSeeder } from './role.seeder';
import { PermissionSeeder } from './permission.seeder';
import { OrganizationSeeder } from './organization.seeder';
import { UserSeeder } from './user.seeder';
import { Task, TaskStatus, TaskCategory } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🚀 Starting database seeding...\n');

    try {
      // Seed in order of dependencies
      const roleSeeder = new RoleSeeder(this.dataSource);
      const roles = await roleSeeder.seed();

      const permissionSeeder = new PermissionSeeder(this.dataSource);
      const permissions = await permissionSeeder.seed(roles);

      const orgSeeder = new OrganizationSeeder(this.dataSource);
      const organizations = await orgSeeder.seed();

      const userSeeder = new UserSeeder(this.dataSource);
      const users = await userSeeder.seed(roles, organizations);

      // Optionally seed some sample tasks
      await this.seedSampleTasks(users, organizations);

      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`  - Roles: ${roles.length}`);
      console.log(`  - Permissions: ${permissions.length}`);
      console.log(`  - Organizations: ${organizations.length}`);
      console.log(`  - Users: ${users.length}`);
      
      console.log('\n🔐 Test Credentials:');
      console.log('  Owner:  john.owner@acme.com / Owner123!');
      console.log('  Admin:  jane.admin@acme.com / Admin123!');
      console.log('  Viewer: bob.viewer@acme.com / Viewer123!');
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  private async seedSampleTasks(users: User[], organizations: Organization[]): Promise<void> {
    const taskRepository = this.dataSource.getRepository(Task);
    
    console.log('\n🌱 Seeding sample tasks...');

    const sampleTasks = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation',
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.WORK,
        priority: 2,
        createdBy: users[0], // John Owner
        organization: organizations[0], // Acme Corp
      },
      {
        title: 'Review code changes',
        description: 'Review pull requests for the new feature',
        status: TaskStatus.TODO,
        category: TaskCategory.WORK,
        priority: 1,
        createdBy: users[1], // Jane Admin
        assignedTo: users[2], // Bob Viewer
        organization: organizations[0],
      },
      {
        title: 'Update team meeting notes',
        description: 'Add action items from today\'s standup',
        status: TaskStatus.DONE,
        category: TaskCategory.WORK,
        priority: 0,
        createdBy: users[2], // Bob Viewer
        organization: organizations[0],
        completedAt: new Date(),
      },
      {
        title: 'Prepare quarterly report',
        description: 'Q4 2024 performance metrics',
        status: TaskStatus.TODO,
        category: TaskCategory.WORK,
        priority: 2,
        createdBy: users[3], // Alice Admin (West)
        organization: organizations[1], // Acme West
      },
      {
        title: 'Team building event planning',
        description: 'Organize monthly team activity',
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.PERSONAL,
        priority: 1,
        createdBy: users[5], // David Owner (TechStart)
        assignedTo: users[6], // Eve Admin (TechStart)
        organization: organizations[3], // TechStart
      },
    ];

    for (const [index, taskData] of sampleTasks.entries()) {
      const existingTask = await taskRepository.findOne({
        where: { title: taskData.title }
      });

      if (!existingTask) {
        const task = taskRepository.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          category: taskData.category,
          priority: taskData.priority,
          createdById: taskData.createdBy.id,
          assignedToId: taskData.assignedTo?.id,
          organizationId: taskData.organization.id,
          orderIndex: index,
          completedAt: taskData.completedAt
        });

        await taskRepository.save(task);
        console.log(`  ✓ Created task: ${task.title}`);
      }
    }
  }
}
