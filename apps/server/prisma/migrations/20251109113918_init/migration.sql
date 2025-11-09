-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "editId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_viewId_key" ON "Note"("viewId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_editId_key" ON "Note"("editId");

-- CreateIndex
CREATE INDEX "Note_viewId_idx" ON "Note"("viewId");

-- CreateIndex
CREATE INDEX "Note_editId_idx" ON "Note"("editId");
