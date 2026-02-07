require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../config/db");

async function main() {

    const password = await bcrypt.hash("123456", 10);

  // 2️⃣ Create organization
  const org = await prisma.organization.create({
    data: { name: "Test Org" },
  });

  // 3️⃣ Create institute
  const institute = await prisma.institute.create({
    data: { name: "Test Institute", organizationId: org.id },
  });

  // 4️⃣ Create user
  const user = await prisma.user.create({
    data: { email: "seeduser@test.com", name: "Seed User", password },
  });

  // 5️⃣ Assign user to org
  await prisma.userOrganization.create({
    data: { userId: user.id, organizationId: org.id, role: "ORG_ADMIN" },
  });

  // 6️⃣ Assign user to institute
  await prisma.userInstitute.create({
    data: { userId: user.id, instituteId: institute.id, role: "USER" },
  });

  // 7️⃣ Create apps individually
  const attendanceApp = await prisma.app.create({
    data: {
      name: "Attendance Tracker",
      description: "Track student attendance easily",
      category: "student",
      launchUrl: "https://app.attendance.com/launch",
      webhookUrl: "https://app.attendance.com/webhook",
      logoUrl: "https://via.placeholder.com/100",
      requiredPermissions: { read_students: true, write_attendance: true },
    },
  });

  const financeApp = await prisma.app.create({
    data: {
      name: "Finance Manager",
      description: "Manage institute finances",
      category: "finance",
      launchUrl: "https://app.finance.com/launch",
      webhookUrl: "https://app.finance.com/webhook",
      logoUrl: "https://via.placeholder.com/100",
      requiredPermissions: { read_finance: true, write_finance: true },
    },
  });

  // 8️⃣ Install apps for institute
  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: institute.id,
      appId: attendanceApp.id,
      installedBy: user.id,
      settings: { themeColor: "#00FFAA", apiKey: "abc123" },
    },
  });

  await prisma.instituteInstalledApp.create({
    data: {
      instituteId: institute.id,
      appId: financeApp.id,
      installedBy: user.id,
      settings: { themeColor: "#FFAA00", apiKey: "def456" },
    },
  });
    console.log("✅ Seed complete");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
