-- DropForeignKey
ALTER TABLE "WebhookLog" DROP CONSTRAINT "WebhookLog_instituteId_appId_fkey";

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_instituteId_appId_fkey" FOREIGN KEY ("instituteId", "appId") REFERENCES "InstituteInstalledApp"("instituteId", "appId") ON DELETE CASCADE ON UPDATE CASCADE;
