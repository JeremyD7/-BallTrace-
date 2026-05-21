-- AlterTable
ALTER TABLE "match_participants" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "source_type" VARCHAR(16) NOT NULL,
    "source_id" INTEGER NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "actor_name" VARCHAR(50) NOT NULL,
    "actor_avatar" TEXT,
    "title" VARCHAR(100) NOT NULL,
    "content" VARCHAR(500),
    "status" VARCHAR(16) NOT NULL DEFAULT 'unread',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_status_created_at_idx" ON "notifications"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "notifications_source_type_source_id_idx" ON "notifications"("source_type", "source_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
