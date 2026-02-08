const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

// Initialize Prisma Client with PostgreSQL adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create platform super admin who will create apps
  const platformSuperAdmin = await prisma.user.create({
    data: {
      name: 'Platform Super Admin',
      email: 'platform.superadmin@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Create multiple organization admins
  const orgAdmin1 = await prisma.user.create({
    data: {
      name: 'Org Admin 1',
      email: 'org.admin1@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const orgAdmin2 = await prisma.user.create({
    data: {
      name: 'Org Admin 2',
      email: 'org.admin2@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const orgAdmin3 = await prisma.user.create({
    data: {
      name: 'Org Admin 3',
      email: 'org.admin3@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Create institute admins for the organizations
  const instAdmin1 = await prisma.user.create({
    data: {
      name: 'Institute Admin 1',
      email: 'inst.admin1@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const instAdmin2 = await prisma.user.create({
    data: {
      name: 'Institute Admin 2',
      email: 'inst.admin2@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const instAdmin3 = await prisma.user.create({
    data: {
      name: 'Institute Admin 3',
      email: 'inst.admin3@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const instAdmin4 = await prisma.user.create({
    data: {
      name: 'Institute Admin 4',
      email: 'inst.admin4@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const user6 = await prisma.user.create({
    data: {
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Technology Solutions Inc.',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Healthcare Systems Ltd.',
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: 'Finance & Co.',
    },
  });

  // Assign roles to users in organizations
  // Platform Super Admin has SUPER_ADMIN role (can create apps)
  await prisma.userOrganization.create({
    data: {
      userId: platformSuperAdmin.id,
      organizationId: org1.id,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: platformSuperAdmin.id,
      organizationId: org2.id,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: platformSuperAdmin.id,
      organizationId: org3.id,
      role: 'SUPER_ADMIN',
    },
  });

  // Org Admin 1 manages Technology Solutions Inc.
  await prisma.userOrganization.create({
    data: {
      userId: orgAdmin1.id,
      organizationId: org1.id,
      role: 'ORG_ADMIN',
    },
  });

  // Org Admin 2 manages Healthcare Systems Ltd.
  await prisma.userOrganization.create({
    data: {
      userId: orgAdmin2.id,
      organizationId: org2.id,
      role: 'ORG_ADMIN',
    },
  });

  // Org Admin 3 manages Finance & Co.
  await prisma.userOrganization.create({
    data: {
      userId: orgAdmin3.id,
      organizationId: org3.id,
      role: 'ORG_ADMIN',
    },
  });

  // Institute admins and regular users in organizations
  // For Technology Solutions Inc.
  await prisma.userOrganization.create({
    data: {
      userId: instAdmin1.id,
      organizationId: org1.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: instAdmin2.id,
      organizationId: org1.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user1.id,
      organizationId: org1.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user2.id,
      organizationId: org1.id,
      role: 'USER',
    },
  });

  // For Healthcare Systems Ltd.
  await prisma.userOrganization.create({
    data: {
      userId: instAdmin3.id,
      organizationId: org2.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user3.id,
      organizationId: org2.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user4.id,
      organizationId: org2.id,
      role: 'USER',
    },
  });

  // For Finance & Co.
  await prisma.userOrganization.create({
    data: {
      userId: instAdmin4.id,
      organizationId: org3.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user5.id,
      organizationId: org3.id,
      role: 'USER',
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user6.id,
      organizationId: org3.id,
      role: 'USER',
    },
  });

  // Create institutes for Technology Solutions Inc.
  const techEngInstitute = await prisma.institute.create({
    data: {
      name: 'Engineering Institute',
      organizationId: org1.id,
    },
  });

  const techMktInstitute = await prisma.institute.create({
    data: {
      name: 'Marketing Institute',
      organizationId: org1.id,
    },
  });

  const techSalesInstitute = await prisma.institute.create({
    data: {
      name: 'Sales Institute',
      organizationId: org1.id,
    },
  });

  // Create institutes for Healthcare Systems Ltd.
  const healthClinicInstitute = await prisma.institute.create({
    data: {
      name: 'Clinic Institute',
      organizationId: org2.id,
    },
  });

  const healthHospInstitute = await prisma.institute.create({
    data: {
      name: 'Hospital Institute',
      organizationId: org2.id,
    },
  });

  // Create institutes for Finance & Co.
  const finBankingInstitute = await prisma.institute.create({
    data: {
      name: 'Banking Institute',
      organizationId: org3.id,
    },
  });

  const finInsuranceInstitute = await prisma.institute.create({
    data: {
      name: 'Insurance Institute',
      organizationId: org3.id,
    },
  });

  // Assign users to institutes with appropriate roles for Technology Solutions Inc.
  await prisma.userInstitute.create({
    data: {
      userId: instAdmin1.id,
      instituteId: techEngInstitute.id,
      role: 'INSTITUTE_ADMIN',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: instAdmin2.id,
      instituteId: techMktInstitute.id,
      role: 'INSTITUTE_ADMIN',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user1.id,
      instituteId: techEngInstitute.id,
      role: 'USER',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user2.id,
      instituteId: techMktInstitute.id,
      role: 'USER',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user1.id,
      instituteId: techSalesInstitute.id,
      role: 'USER',
    },
  });

  // Assign users to institutes with appropriate roles for Healthcare Systems Ltd.
  await prisma.userInstitute.create({
    data: {
      userId: instAdmin3.id,
      instituteId: healthClinicInstitute.id,
      role: 'INSTITUTE_ADMIN',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user3.id,
      instituteId: healthClinicInstitute.id,
      role: 'USER',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user4.id,
      instituteId: healthHospInstitute.id,
      role: 'USER',
    },
  });

  // Assign users to institutes with appropriate roles for Finance & Co.
  await prisma.userInstitute.create({
    data: {
      userId: instAdmin4.id,
      instituteId: finBankingInstitute.id,
      role: 'INSTITUTE_ADMIN',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user5.id,
      instituteId: finBankingInstitute.id,
      role: 'USER',
    },
  });

  await prisma.userInstitute.create({
    data: {
      userId: user6.id,
      instituteId: finInsuranceInstitute.id,
      role: 'USER',
    },
  });

  // Create sample apps for the platform (created by platform super admin)
  const crmApp = await prisma.app.create({
    data: {
      name: 'CRM System',
      description: 'Customer relationship management system',
      category: 'Business',
      launchUrl: 'https://crm-demo.example.com/launch',
      webhookUrl: 'https://crm-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_customers', 'write_customers', 'manage_sales'],
      },
    },
  });

  const projectApp = await prisma.app.create({
    data: {
      name: 'Project Management',
      description: 'Team collaboration and project tracking tool',
      category: 'Productivity',
      launchUrl: 'https://project-demo.example.com/launch',
      webhookUrl: 'https://project-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_projects', 'write_tasks', 'manage_teams'],
      },
    },
  });

  const hrApp = await prisma.app.create({
    data: {
      name: 'HR Portal',
      description: 'Human resources management portal',
      category: 'HR',
      launchUrl: 'https://hr-demo.example.com/launch',
      webhookUrl: 'https://hr-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_employees', 'write_employees', 'manage_payroll'],
      },
    },
  });

  const analyticsApp = await prisma.app.create({
    data: {
      name: 'Business Analytics',
      description: 'Data visualization and business intelligence platform',
      category: 'Analytics',
      launchUrl: 'https://analytics-demo.example.com/launch',
      webhookUrl: 'https://analytics-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_data', 'write_reports', 'manage_dashboards'],
      },
    },
  });

  const emrApp = await prisma.app.create({
    data: {
      name: 'Electronic Medical Records',
      description: 'Digital patient record management system',
      category: 'Healthcare',
      launchUrl: 'https://emr-demo.example.com/launch',
      webhookUrl: 'https://emr-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_patients', 'write_medical_records', 'manage_appointments'],
      },
    },
  });

  const bankingApp = await prisma.app.create({
    data: {
      name: 'Online Banking Portal',
      description: 'Digital banking and financial services platform',
      category: 'Finance',
      launchUrl: 'https://banking-demo.example.com/launch',
      webhookUrl: 'https://banking-demo.example.com/webhook',
      logoUrl: '/placeholder-logo.svg', // Using a placeholder logo
      requiredPermissions: {
        permissions: ['read_accounts', 'write_transactions', 'manage_customers'],
      },
    },
  });

  // Install apps in institutes with appropriate configurations for Technology Solutions Inc.
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: techEngInstitute.id,
      appId: crmApp.id,
      installedBy: instAdmin1.id, // Institute Admin 1
      settings: {
        themeColor: '#007acc',
        apiKey: 'tech-eng-crm-key-123',
        permissions: ['read_customers', 'write_customers'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: techEngInstitute.id,
      appId: projectApp.id,
      installedBy: instAdmin1.id, // Institute Admin 1
      settings: {
        themeColor: '#8e44ad',
        apiKey: 'tech-eng-project-key-456',
        permissions: ['read_projects', 'write_tasks'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: techMktInstitute.id,
      appId: projectApp.id,
      installedBy: instAdmin2.id, // Institute Admin 2
      settings: {
        themeColor: '#8e44ad',
        apiKey: 'tech-mkt-project-key-789',
        permissions: ['read_projects', 'write_tasks', 'manage_teams'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: techMktInstitute.id,
      appId: analyticsApp.id,
      installedBy: instAdmin2.id, // Institute Admin 2
      settings: {
        themeColor: '#9b59b6',
        apiKey: 'tech-mkt-analytics-key-012',
        permissions: ['read_data', 'write_reports'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: techSalesInstitute.id,
      appId: crmApp.id,
      installedBy: orgAdmin1.id, // Organization Admin 1
      settings: {
        themeColor: '#007acc',
        apiKey: 'tech-sales-crm-key-345',
        permissions: ['read_customers', 'write_customers', 'manage_sales'],
      },
    },
  });

  // Install apps in institutes with appropriate configurations for Healthcare Systems Ltd.
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: healthClinicInstitute.id,
      appId: emrApp.id,
      installedBy: instAdmin3.id, // Institute Admin 3
      settings: {
        themeColor: '#27ae60',
        apiKey: 'health-clinic-emr-key-678',
        permissions: ['read_patients', 'write_medical_records'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: healthHospInstitute.id,
      appId: emrApp.id,
      installedBy: orgAdmin2.id, // Organization Admin 2
      settings: {
        themeColor: '#27ae60',
        apiKey: 'health-hosp-emr-key-901',
        permissions: ['read_patients', 'write_medical_records', 'manage_appointments'],
      },
    },
  });

  // Install apps in institutes with appropriate configurations for Finance & Co.
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: finBankingInstitute.id,
      appId: bankingApp.id,
      installedBy: instAdmin4.id, // Institute Admin 4
      settings: {
        themeColor: '#2c3e50',
        apiKey: 'fin-banking-app-key-234',
        permissions: ['read_accounts', 'write_transactions'],
      },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: finInsuranceInstitute.id,
      appId: hrApp.id,
      installedBy: orgAdmin3.id, // Organization Admin 3
      settings: {
        themeColor: '#d35400',
        apiKey: 'fin-insurance-hr-key-567',
        permissions: ['read_employees', 'write_employees', 'manage_payroll'],
      },
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created users:');
  console.log(`- Platform Super Admin: platform.superadmin@example.com (password: password123)`);
  console.log(`- Org Admin 1: org.admin1@example.com (password: password123)`);
  console.log(`- Org Admin 2: org.admin2@example.com (password: password123)`);
  console.log(`- Org Admin 3: org.admin3@example.com (password: password123)`);
  console.log(`- Institute Admin 1: inst.admin1@example.com (password: password123)`);
  console.log(`- Institute Admin 2: inst.admin2@example.com (password: password123)`);
  console.log(`- Institute Admin 3: inst.admin3@example.com (password: password123)`);
  console.log(`- Institute Admin 4: inst.admin4@example.com (password: password123)`);
  console.log(`- John Doe: john.doe@example.com (password: password123)`);
  console.log(`- Jane Smith: jane.smith@example.com (password: password123)`);
  console.log(`- Bob Johnson: bob.johnson@example.com (password: password123)`);
  console.log(`- Alice Williams: alice.williams@example.com (password: password123)`);
  console.log(`- Charlie Brown: charlie.brown@example.com (password: password123)`);
  console.log(`- Diana Prince: diana.prince@example.com (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });