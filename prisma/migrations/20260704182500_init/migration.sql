-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterResume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Master Resume',
    "templateId" TEXT NOT NULL DEFAULT 'swiss-1col',
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "accentColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "uploadedFileUrl" TEXT,
    "uploadedFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailoredResume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'swiss-1col',
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "accentColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "status" TEXT NOT NULL DEFAULT 'ready',
    "sourceJobDescriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TailoredResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSection" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT,
    "tailoredResumeId" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ResumeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceEntry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "bullets" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExperienceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationEntry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "gpa" TEXT,
    "bullets" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EducationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEntry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "bullets" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomEntry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "bullets" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsedKeywords" TEXT[],
    "linkedResumeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackerCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobDescriptionId" TEXT,
    "resumeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Saved',
    "notes" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachMessage" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "type" TEXT NOT NULL DEFAULT 'linkedin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "llmProvider" TEXT NOT NULL DEFAULT 'openai',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o',
    "apiBaseUrl" TEXT,
    "apiKeyEncrypted" TEXT,
    "reasoningEffort" TEXT NOT NULL DEFAULT 'auto',
    "uiLanguage" TEXT NOT NULL DEFAULT 'en',
    "contentLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultImprovementStyle" TEXT NOT NULL DEFAULT 'nudge',
    "coverLetterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "outreachEnabled" BOOLEAN NOT NULL DEFAULT true,
    "customPrompts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrichmentSession" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "step" TEXT NOT NULL DEFAULT 'analyzing',
    "questions" JSONB,
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrichmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MasterResume_userId_idx" ON "MasterResume"("userId");

-- CreateIndex
CREATE INDEX "TailoredResume_userId_idx" ON "TailoredResume"("userId");

-- CreateIndex
CREATE INDEX "TailoredResume_masterResumeId_idx" ON "TailoredResume"("masterResumeId");

-- CreateIndex
CREATE INDEX "ExperienceEntry_sectionId_idx" ON "ExperienceEntry"("sectionId");

-- CreateIndex
CREATE INDEX "EducationEntry_sectionId_idx" ON "EducationEntry"("sectionId");

-- CreateIndex
CREATE INDEX "ProjectEntry_sectionId_idx" ON "ProjectEntry"("sectionId");

-- CreateIndex
CREATE INDEX "CustomEntry_sectionId_idx" ON "CustomEntry"("sectionId");

-- CreateIndex
CREATE INDEX "JobDescription_userId_idx" ON "JobDescription"("userId");

-- CreateIndex
CREATE INDEX "TrackerCard_userId_idx" ON "TrackerCard"("userId");

-- CreateIndex
CREATE INDEX "TrackerCard_status_idx" ON "TrackerCard"("status");

-- CreateIndex
CREATE INDEX "CoverLetter_resumeId_idx" ON "CoverLetter"("resumeId");

-- CreateIndex
CREATE INDEX "OutreachMessage_resumeId_idx" ON "OutreachMessage"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE INDEX "EnrichmentSession_resumeId_idx" ON "EnrichmentSession"("resumeId");

-- AddForeignKey
ALTER TABLE "MasterResume" ADD CONSTRAINT "MasterResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_sourceJobDescriptionId_fkey" FOREIGN KEY ("sourceJobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_tailoredResumeId_fkey" FOREIGN KEY ("tailoredResumeId") REFERENCES "TailoredResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceEntry" ADD CONSTRAINT "ExperienceEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ResumeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ResumeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEntry" ADD CONSTRAINT "ProjectEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ResumeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomEntry" ADD CONSTRAINT "CustomEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ResumeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerCard" ADD CONSTRAINT "TrackerCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerCard" ADD CONSTRAINT "TrackerCard_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerCard" ADD CONSTRAINT "TrackerCard_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "TailoredResume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrichmentSession" ADD CONSTRAINT "EnrichmentSession_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
