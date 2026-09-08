-- Foreign-key columns are not indexed automatically by Postgres. Question and
-- Option are joined on every assessment load, so these two were forcing a
-- sequential scan per assessment render.
CREATE INDEX IF NOT EXISTS "Question_assessmentId_idx" ON "Question"("assessmentId");
CREATE INDEX IF NOT EXISTS "Option_questionId_idx" ON "Option"("questionId");
CREATE INDEX IF NOT EXISTS "Announcement_authorId_idx" ON "Announcement"("authorId");

-- Both token tables are pruned by `expires` on every token creation and deleted
-- by `email` on every successful reset/verification; neither column was indexed.
CREATE INDEX IF NOT EXISTS "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_expires_idx" ON "EmailVerificationToken"("expires");
