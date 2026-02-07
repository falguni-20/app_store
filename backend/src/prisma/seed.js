require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../config/db");

async function main() {
    const password = await bcrypt.hash("123456", 10);

    const org = await prisma.organization.create({
        data: {
            name: "Test Org",
        },
    });

    const institute = await prisma.institute.create({
        data: {
            name: "Test Institute",
            organizationId: org.id,
        },
    });

    const user = await prisma.user.create({
        data: {
            email: "seeduser@test.com",
            name: "Seed User",
            password,
        },
    });

    await prisma.userOrganization.create({
        data: {
            userId: user.id,
            organizationId: org.id,
            role: "ORG_ADMIN",
        },
    });

    await prisma.userInstitute.create({
        data: {
            userId: user.id,
            instituteId: institute.id,
            role: "USER",
        },
    });

    console.log("✅ Seed complete");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
