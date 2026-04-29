-- CreateTable
CREATE TABLE "profile_stats" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "label" VARCHAR(32) NOT NULL,
    "value" VARCHAR(16) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_tags" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_posts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cover" VARCHAR(255) NOT NULL,
    "kind" VARCHAR(16) NOT NULL DEFAULT 'post',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_stats_user_id_idx" ON "profile_stats"("user_id");

-- CreateIndex
CREATE INDEX "profile_tags_user_id_idx" ON "profile_tags"("user_id");

-- CreateIndex
CREATE INDEX "profile_posts_user_id_kind_idx" ON "profile_posts"("user_id", "kind");

-- AddForeignKey
ALTER TABLE "profile_stats" ADD CONSTRAINT "profile_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_tags" ADD CONSTRAINT "profile_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_posts" ADD CONSTRAINT "profile_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
