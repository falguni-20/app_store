require("dotenv").config();
const bcrypt = require("bcrypt");
const { prisma } = require("../config/db"); // Ensure you're importing prisma correctly if it's part of an object

async function main() {
  console.log("♻️  Starting seed cleanup...");
  // Delete in specific order to avoid foreign key constraints
  await prisma.webhookLog.deleteMany();
  await prisma.instituteInstalledApp.deleteMany();
  await prisma.userInstitute.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institute.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.app.deleteMany();
  console.log("✅ Seed cleanup complete.");

  const password = await bcrypt.hash("123456", 10); // Standard password for all seed users

  // 1️⃣ Create Organizations
  const org1 = await prisma.organization.create({ data: { name: "Acme Corp" } });
  const org2 = await prisma.organization.create({ data: { name: "Globex Inc" } });
  const org3 = await prisma.organization.create({ data: { name: "Zeta Corp" } }); // New organization

  // 2️⃣ Create Institutes
  const inst1 = await prisma.institute.create({ data: { name: "Main Campus", organizationId: org1.id } });
  const inst2 = await prisma.institute.create({ data: { name: "Branch Campus", organizationId: org1.id } });
  const inst3 = await prisma.institute.create({ data: { name: "Research Lab", organizationId: org2.id } });
  const inst4 = await prisma.institute.create({ data: { name: "Headquarters", organizationId: org3.id } }); // New institute
  const inst5 = await prisma.institute.create({ data: { name: "Satellite Office", organizationId: org3.id } }); // New institute

  // 3️⃣ Create Users
  const userSuperAdmin = await prisma.user.create({
    data: { email: "superadmin@example.com", name: "Super Admin", password },
  });
  const userOrgAdmin = await prisma.user.create({
    data: { email: "orgadmin@example.com", name: "Org Admin", password },
  });
  const userInstAdmin = await prisma.user.create({
    data: { email: "instituteadmin@example.com", name: "Institute Admin", password },
  });
  const userRegular = await prisma.user.create({
    data: { email: "user@example.com", name: "Regular User", password },
  });
  const userOrg2 = await prisma.user.create({
    data: { email: "user2@example.com", name: "User Org2", password },
  });
  const userZeta = await prisma.user.create({ // New user
    data: { email: "userZeta@example.com", name: "Zeta User", password },
  });

  // 4️⃣ Assign User Roles (UserOrganization and UserInstitute)
  // Super Admin - part of org1 as SUPER_ADMIN
  await prisma.userOrganization.create({ data: { userId: userSuperAdmin.id, organizationId: org1.id, role: "SUPER_ADMIN" } });

  // Org Admin - ORG_ADMIN for org1
  await prisma.userOrganization.create({ data: { userId: userOrgAdmin.id, organizationId: org1.id, role: "ORG_ADMIN" } });
  // Org Admin is also a regular user in an institute (optional, but good for testing)
  await prisma.userInstitute.create({ data: { userId: userOrgAdmin.id, instituteId: inst1.id, role: "USER" } });

  // Institute Admin - INSTITUTE_ADMIN for inst1
  await prisma.userOrganization.create({ data: { userId: userInstAdmin.id, organizationId: org1.id, role: "USER" } }); // User in org1
  await prisma.userInstitute.create({ data: { userId: userInstAdmin.id, instituteId: inst1.id, role: "INSTITUTE_ADMIN" } });

  // Regular User - USER for inst1
  await prisma.userOrganization.create({ data: { userId: userRegular.id, organizationId: org1.id, role: "USER" } });
  await prisma.userInstitute.create({ data: { userId: userRegular.id, instituteId: inst1.id, role: "USER" } });

  // User for Org2, Inst3
  await prisma.userOrganization.create({ data: { userId: userOrg2.id, organizationId: org2.id, role: "USER" } });
  await prisma.userInstitute.create({ data: { userId: userOrg2.id, instituteId: inst3.id, role: "USER" } });
  
  // Zeta User - ORG_ADMIN for org3
  await prisma.userOrganization.create({ data: { userId: userZeta.id, organizationId: org3.id, role: "ORG_ADMIN" } });
  // Zeta User is also a regular user in new institutes
  await prisma.userInstitute.create({ data: { userId: userZeta.id, instituteId: inst4.id, role: "USER" } });
  await prisma.userInstitute.create({ data: { userId: userZeta.id, instituteId: inst5.id, role: "USER" } });
  


  // 5️⃣ Create Apps
  const appAttendance = await prisma.app.create({
    data: {
      name: "Attendance Tracker",
      description: "Track student attendance easily",
      category: "Education",
      launchUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dummy-app`,
      webhookUrl: "http://localhost:5000/webhooks/app-installed", // Mock webhook endpoint
      logoUrl: "/uploads/attendance_logo.png",
      requiredPermissions: { canViewStudents: true, canEditAttendance: true },
    },
  });

  const appGrades = await prisma.app.create({
    data: {
      name: "Gradebook",
      description: "Manage student grades and assignments",
      category: "Education",
      launchUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dummy-app`,
      webhookUrl: "http://localhost:5000/webhooks/app-installed",
      logoUrl: "/uploads/gradebook_logo.png",
      requiredPermissions: { canViewGrades: true, canEditGrades: true },
    },
  });

  const appHR = await prisma.app.create({
    data: {
      name: "HR Management",
      description: "Human Resources platform for staff management",
      category: "HR",
      launchUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dummy-app`,
      webhookUrl: "http://localhost:5000/webhooks/app-installed",
      logoUrl: "/uploads/hr_logo.png",
      requiredPermissions: { canViewStaff: true, canManagePayroll: true },
    },
  });

  const appFinance = await prisma.app.create({
    data: {
      name: "Finance Portal",
      description: "Manage institute financial operations",
      category: "Finance",
      launchUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dummy-app`,
      webhookUrl: "http://localhost:5000/webhooks/app-installed",
      logoUrl: "/uploads/finance_logo.png",
      requiredPermissions: { canViewBudgets: true, canApprovePayments: true },
    },
  });


  // 6️⃣ Install Apps for Institutes
  // For inst1 (Org1)
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: inst1.id,
      appId: appAttendance.id,
      installedBy: userInstAdmin.id,
      settings: { theme: "dark", notifications: true },
    },
  });
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: inst1.id,
      appId: appGrades.id,
      installedBy: userInstAdmin.id,
      settings: { gradeScale: "A-F", autoCalculate: true },
    },
  });

  // For inst2 (Org1, different institute)
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: inst2.id,
      appId: appAttendance.id,
      installedBy: userOrgAdmin.id, // Org Admin installs for inst2
      settings: { theme: "light", notifications: false, customSetting: "foo" },
    },
  });

  // For inst3 (Org2)
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: inst3.id,
      appId: appHR.id,
      installedBy: userOrg2.id, // A regular user from Org2 installs
      settings: { department: "IT", accessLevel: "limited" },
    },
  });


  console.log("✅ Seed complete");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
