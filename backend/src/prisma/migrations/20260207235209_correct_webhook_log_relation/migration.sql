-- DropForeignKey
ALTER TABLE "WebhookLog" DROP CONSTRAINT "WebhookLog_appId_fkey";

-- DropIndex
DROP INDEX "InstituteInstalledApp_appId_key";

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_instituteId_appId_fkey" FOREIGN KEY ("instituteId", "appId") REFERENCES "InstituteInstalledApp"("instituteId", "appId") ON DELETE RESTRICT ON UPDATE CASCADE;
