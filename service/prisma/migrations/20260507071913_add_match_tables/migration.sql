-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "area" VARCHAR(50) NOT NULL,
    "court_name" VARCHAR(100) NOT NULL,
    "match_date" VARCHAR(20) NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "match_type" VARCHAR(16) NOT NULL,
    "level" VARCHAR(16) NOT NULL,
    "gender_limit" VARCHAR(16) NOT NULL DEFAULT '不限男女',
    "total" INTEGER NOT NULL DEFAULT 4,
    "price" VARCHAR(20) NOT NULL,
    "fee_rule" VARCHAR(100) NOT NULL,
    "slogan" VARCHAR(120) NOT NULL,
    "note" VARCHAR(160),
    "status" VARCHAR(16) NOT NULL DEFAULT 'recruiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" VARCHAR(16) NOT NULL DEFAULT 'participant',
    "status" VARCHAR(16) NOT NULL DEFAULT 'joined',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_status_created_at_idx" ON "matches"("status", "created_at");

-- CreateIndex
CREATE INDEX "matches_user_id_created_at_idx" ON "matches"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "matches_area_created_at_idx" ON "matches"("area", "created_at");

-- CreateIndex
CREATE INDEX "match_participants_match_id_idx" ON "match_participants"("match_id");

-- CreateIndex
CREATE INDEX "match_participants_user_id_idx" ON "match_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_match_id_user_id_key" ON "match_participants"("match_id", "user_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
