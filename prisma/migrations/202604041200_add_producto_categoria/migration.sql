ALTER TABLE "productos"
ADD COLUMN "categoria" VARCHAR(255);

UPDATE "productos"
SET "categoria" = 'General'
WHERE "categoria" IS NULL;

ALTER TABLE "productos"
ALTER COLUMN "categoria" SET NOT NULL;