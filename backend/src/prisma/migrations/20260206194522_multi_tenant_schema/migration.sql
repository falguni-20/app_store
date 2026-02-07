-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "InstituteRole" AS ENUM ('INSTITUTE_ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Institute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" "OrgRole" NOT NULL,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInstitute" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "instituteId" INTEGER NOT NULL,
    "role" "InstituteRole" NOT NULL,

    CONSTRAINT "UserInstitute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "launchUrl" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "requiredPermissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstituteInstalledApp" (
    "id" SERIAL NOT NULL,
    "instituteId" INTEGER NOT NULL,
    "appId" INTEGER NOT NULL,
    "settings" JSONB NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installedBy" INTEGER NOT NULL,

    CONSTRAINT "InstituteInstalledApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" SERIAL NOT NULL,
    "instituteId" INTEGER NOT NULL,
    "appId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institute_organizationId_idx" ON "Institute"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganization_userId_organizationId_key" ON "UserOrganization"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInstitute_userId_instituteId_key" ON "UserInstitute"("userId", "instituteId");

-- CreateIndex
CREATE UNIQUE INDEX "InstituteInstalledApp_appId_key" ON "InstituteInstalledApp"("appId");

-- CreateIndex
CREATE INDEX "InstituteInstalledApp_instituteId_idx" ON "InstituteInstalledApp"("instituteId");

-- CreateIndex
CREATE INDEX "InstituteInstalledApp_appId_idx" ON "InstituteInstalledApp"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "InstituteInstalledApp_instituteId_appId_key" ON "InstituteInstalledApp"("instituteId", "appId");

-- CreateIndex
CREATE INDEX "WebhookLog_instituteId_idx" ON "WebhookLog"("instituteId");

-- CreateIndex
CREATE INDEX "WebhookLog_appId_idx" ON "WebhookLog"("appId");

-- AddForeignKey
ALTER TABLE "Institute" ADD CONSTRAINT "Institute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitute" ADD CONSTRAINT "UserInstitute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitute" ADD CONSTRAINT "UserInstitute_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstituteInstalledApp" ADD CONSTRAINT "InstituteInstalledApp_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstituteInstalledApp" ADD CONSTRAINT "InstituteInstalledApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "InstituteInstalledApp"("appId") ON DELETE RESTRICT ON UPDATE CASCADE;
