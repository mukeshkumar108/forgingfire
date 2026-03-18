-- Normalize existing usernames to starter canonical format.
UPDATE "public"."User"
SET "username" = CASE
  WHEN trim("username") = '' THEN NULL
  ELSE lower(trim("username"))
END
WHERE "username" IS NOT NULL;
