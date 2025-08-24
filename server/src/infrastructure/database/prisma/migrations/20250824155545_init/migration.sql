CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "public"."DEVICE_CHILD_STATUS" AS ENUM (
    'AVAILABLE',
    'BORROWED',
    'LOST',
    'UNDER_MAINTENANCE',
    'BROKEN'
);

-- CreateEnum
CREATE TYPE "public"."TICKET_STATUS" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_USE',
    'RETURNED_SUCCESS',
    'DAMAGED',
    'LOST'
);

-- CreateEnum
CREATE TYPE "public"."STAGE_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ISSUE_STATUS" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'DAMAGED',
    'CANCELLED'
);

-- CreateEnum
CREATE TYPE "public"."BASE_EVENT" AS ENUM (
    'DEVICE_CREATED',
    'TICKET_CREATED',
    'TICKET_APPROVED',
    'TICKET_REJECTED',
    'TICKET_STAGE_PASSED',
    'TICKET_RETURNED',
    'TICKET_DUE_SOON',
    'TICKET_OVERDUE',
    'ISSUE_REPORTED',
    'ISSUE_ASSIGNED',
    'ISSUE_RESOLVED',
    'ISSUE_MARK_DAMAGED'
);

-- CreateEnum
CREATE TYPE "public"."AUDIENCE_EVENT" AS ENUM (
    'APPROVAL_REQUESTED',
    'YOUR_TICKET_APPROVED',
    'YOUR_TICKET_REJECTED',
    'YOUR_TICKET_IN_USE',
    'YOUR_TICKET_RETURNED',
    'DUE_SOON_REMINDER',
    'OVERDUE_ALERT',
    'ISSUE_NEW_FOR_TECH',
    'ISSUE_ASSIGNED_TO_YOU',
    'ISSUE_RESOLVED_FOR_REPORTER'
);

-- CreateEnum
CREATE TYPE "public"."NOTIF_STATUS" AS ENUM ('UNREAD', 'READ', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."LBR_ACTION" AS ENUM (
    'CREATED',
    'UPDATED',
    'APPROVED',
    'REJECTED',
    'RETURNED',
    'MARK_DAMAGED',
    'MARK_LOST'
);

-- CreateEnum
CREATE TYPE "public"."LAP_ACTION" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."LI_ACTION" AS ENUM (
    'REPORTED',
    'ASSIGNED',
    'UPDATED',
    'RESOLVED',
    'MARK_DAMAGED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "dept_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "departments_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "section_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "dept_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "sections_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" SERIAL NOT NULL,
    "emp_code" VARCHAR(50),
    "firstname" VARCHAR(120) NOT NULL,
    "lastname" VARCHAR(120) NOT NULL,
    "username" VARCHAR(120) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(120),
    "phone" VARCHAR(20),
    "images" TEXT,
    "role_id" INTEGER NOT NULL,
    "dept_id" INTEGER,
    "sec_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."devices" (
    "device_id" SERIAL NOT NULL,
    "serial_number" VARCHAR(150) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "location" VARCHAR(200),
    "max_borrow_days" INTEGER,
    "images" TEXT,
    "categories_id" INTEGER NOT NULL,
    "device_type_id" INTEGER,
    "user_id" INTEGER,
    "sec_id" INTEGER,
    "acc_id" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "devices_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "public"."device_child" (
    "device_child_id" SERIAL NOT NULL,
    "serial_number" VARCHAR(150) NOT NULL,
    "device_id" INTEGER NOT NULL,
    "status" "public"."DEVICE_CHILD_STATUS" NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "device_child_pkey" PRIMARY KEY ("device_child_id")
);

-- CreateTable
CREATE TABLE "public"."accessories" (
    "accessory_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "accessories_pkey" PRIMARY KEY ("accessory_id")
);

-- CreateTable
CREATE TABLE "public"."device_type" (
    "device_type_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "device_type_pkey" PRIMARY KEY ("device_type_id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."approval_flow" (
    "approval_flow_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "user_id" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "approval_flow_pkey" PRIMARY KEY ("approval_flow_id")
);

-- CreateTable
CREATE TABLE "public"."approval_flow_steps" (
    "approval_flow_steps_id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "step_approve" INTEGER NOT NULL,
    "approval_flow_id" INTEGER NOT NULL,
    "dept_id" INTEGER,
    "sec_id" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "approval_flow_steps_pkey" PRIMARY KEY ("approval_flow_steps_id")
);

-- CreateTable
CREATE TABLE "public"."borrow_return_tickets" (
    "brt_id" SERIAL NOT NULL,
    "status" "public"."TICKET_STATUS" NOT NULL,
    "usage_location" VARCHAR(191) NOT NULL,
    "borrow_purpose" VARCHAR(191) NOT NULL,
    "start_date" TIMESTAMPTZ (6) NOT NULL,
    "end_date" TIMESTAMPTZ (6) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "reject_reason" VARCHAR(255),
    "pickup_location" VARCHAR(255),
    "pickup_datetime" TIMESTAMPTZ (6) NOT NULL,
    "return_location" VARCHAR(255),
    "return_datetime" TIMESTAMPTZ (6) NOT NULL,
    "approval_flow_id" INTEGER,
    "user_id" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "borrow_return_tickets_pkey" PRIMARY KEY ("brt_id")
);

-- CreateTable
CREATE TABLE "public"."borrow_return_tickets_stage" (
    "brts_id" SERIAL NOT NULL,
    "status" "public"."STAGE_STATUS" NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "step_approve" INTEGER NOT NULL,
    "dept_id" INTEGER,
    "sec_id" INTEGER,
    "brt_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "borrow_return_tickets_stage_pkey" PRIMARY KEY ("brts_id")
);

-- CreateTable
CREATE TABLE "public"."ticket_device" (
    "ticket_device_id" SERIAL NOT NULL,
    "brt_id" INTEGER NOT NULL,
    "device_child_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6),
    "updated_at" TIMESTAMPTZ (6),
    CONSTRAINT "ticket_device_pkey" PRIMARY KEY ("ticket_device_id")
);

-- CreateTable
CREATE TABLE "public"."ticket_issues" (
    "issue_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "brt_id" INTEGER,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "contact_phone" VARCHAR(32),
    "reported_by" INTEGER,
    "assigned_to" INTEGER,
    "status" "public"."ISSUE_STATUS" NOT NULL,
    "damaged_reason" VARCHAR(255),
    "resolved_note" TEXT,
    "deleted_at" TIMESTAMPTZ (6),
    "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_issues_pkey" PRIMARY KEY ("issue_id")
);

-- CreateTable
CREATE TABLE "public"."issue_attachments" (
    "attachment_id" INTEGER NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" VARCHAR(100),
    "uploaded_by" INTEGER,
    "deleted_at" TIMESTAMPTZ (6),
    "uploaded_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "issue_attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "notification_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "target_route" VARCHAR(255),
    "base_event" "public"."BASE_EVENT" NOT NULL,
    "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "send_at" TIMESTAMPTZ (6),
    "brt_id" INTEGER,
    "brts_id" INTEGER,
    "issue_id" INTEGER,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "public"."notification_recipients" (
    "nt_id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "public"."NOTIF_STATUS" NOT NULL,
    "event" "public"."AUDIENCE_EVENT" NOT NULL,
    "read_at" TIMESTAMPTZ (6),
    "dismissed_at" TIMESTAMPTZ (6),
    CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("nt_id")
);

-- CreateTable
CREATE TABLE "public"."log_borrow_return" (
    "lbr_id" INTEGER NOT NULL,
    "brt_id" INTEGER NOT NULL,
    "action" "public"."LBR_ACTION" NOT NULL,
    "old_status" VARCHAR(50),
    "new_status" VARCHAR(50),
    "note" TEXT,
    "actor_id" INTEGER,
    "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "log_borrow_return_pkey" PRIMARY KEY ("lbr_id")
);

-- CreateTable
CREATE TABLE "public"."log_approval" (
    "lap_id" INTEGER NOT NULL,
    "brts_id" INTEGER NOT NULL,
    "action" "public"."LAP_ACTION" NOT NULL,
    "note" TEXT,
    "actor_id" INTEGER,
    "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "log_approval_pkey" PRIMARY KEY ("lap_id")
);

-- CreateTable
CREATE TABLE "public"."log_issue" (
    "li_id" INTEGER NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "action" "public"."LI_ACTION" NOT NULL,
    "old_status" VARCHAR(50),
    "new_status" VARCHAR(50),
    "note" TEXT,
    "actor_id" INTEGER,
    "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "log_issue_pkey" PRIMARY KEY ("li_id")
);

-- CreateTable
CREATE TABLE "public"."role_category_permissions" (
    "role_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "can_ask" BOOLEAN,
    CONSTRAINT "role_category_permissions_pkey" PRIMARY KEY ("role_id", "category_id")
);

-- CreateTable
CREATE TABLE "public"."ticket_chats" (
    "tc_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "ticket_chats_pkey" PRIMARY KEY ("tc_id")
);

-- CreateTable
CREATE TABLE "public"."chat" (
    "chat_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "tc_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ (6),
    "ended_at" TIMESTAMPTZ (6),
    "role_id" INTEGER,
    CONSTRAINT "chat_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "public"."data_chat" (
    "data_id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    CONSTRAINT "data_chat_pkey" PRIMARY KEY ("data_id")
);

-- CreateTable
CREATE TABLE "public"."rag_responses" (
    "response_id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "question_text" TEXT,
    "response_text" TEXT,
    "question_vector" vector NOT NULL,
    "response_vector" vector NOT NULL,
    "model_used" VARCHAR(100),
    "response_timestamp" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence_score" DOUBLE PRECISION,
    CONSTRAINT "rag_responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "public"."departments" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "sections_name_key" ON "public"."sections" ("name");

-- CreateIndex
CREATE INDEX "idx_sections_dept" ON "public"."sections" ("dept_id");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "public"."users" ("role_id");

-- CreateIndex
CREATE INDEX "idx_users_dept_sec" ON "public"."users" ("dept_id", "sec_id");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "public"."users" ("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_number_key" ON "public"."devices" ("serial_number");

-- CreateIndex
CREATE INDEX "idx_devices_category" ON "public"."devices" ("categories_id");

-- CreateIndex
CREATE INDEX "idx_devices_type" ON "public"."devices" ("device_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_child_serial_number_key" ON "public"."device_child" ("serial_number");

-- CreateIndex
CREATE INDEX "idx_child_device" ON "public"."device_child" ("device_id");

-- CreateIndex
CREATE INDEX "idx_child_status" ON "public"."device_child" ("status");

-- CreateIndex
CREATE INDEX "idx_steps_flow_step" ON "public"."approval_flow_steps" ("approval_flow_id", "step_approve");

-- CreateIndex
CREATE INDEX "idx_brt_user_status_created" ON "public"."borrow_return_tickets" ("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "idx_brt_flow" ON "public"."borrow_return_tickets" ("approval_flow_id");

-- CreateIndex
CREATE INDEX "idx_brt_start_end" ON "public"."borrow_return_tickets" ("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_brts_brt_step" ON "public"."borrow_return_tickets_stage" ("brt_id", "step_approve");

-- CreateIndex
CREATE INDEX "idx_brts_status" ON "public"."borrow_return_tickets_stage" ("status");

-- CreateIndex
CREATE INDEX "idx_ticket_device_brt" ON "public"."ticket_device" ("brt_id");

-- CreateIndex
CREATE INDEX "idx_ticket_device_child" ON "public"."ticket_device" ("device_child_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ticket_device" ON "public"."ticket_device" ("brt_id", "device_child_id");

-- CreateIndex
CREATE INDEX "idx_issue_device_status" ON "public"."ticket_issues" ("device_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "idx_issue_assignee" ON "public"."ticket_issues" ("assigned_to", "status");

-- CreateIndex
CREATE INDEX "idx_issue_attachments_issue" ON "public"."issue_attachments" ("issue_id");

-- CreateIndex
CREATE INDEX "idx_notif_created" ON "public"."notifications" ("created_at");

-- CreateIndex
CREATE INDEX "idx_notif_brt" ON "public"."notifications" ("brt_id");

-- CreateIndex
CREATE INDEX "idx_notif_brts" ON "public"."notifications" ("brts_id");

-- CreateIndex
CREATE INDEX "idx_notif_issue" ON "public"."notifications" ("issue_id");

-- CreateIndex
CREATE INDEX "idx_notifrec_user_status" ON "public"."notification_recipients" ("user_id", "status", "nt_id");

-- CreateIndex
CREATE INDEX "idx_log_brt" ON "public"."log_borrow_return" ("brt_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_log_approval" ON "public"."log_approval" ("brts_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_log_issue" ON "public"."log_issue" ("issue_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_chat_user" ON "public"."chat" ("user_id", "started_at");

-- CreateIndex
CREATE INDEX "idx_data_chat_chat_id" ON "public"."data_chat" ("chat_id");

-- CreateIndex
CREATE INDEX "idx_rag_chat_time" ON "public"."rag_responses" ("chat_id", "response_timestamp");

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "public"."departments" ("dept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "public"."departments" ("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_sec_id_fkey" FOREIGN KEY ("sec_id") REFERENCES "public"."sections" ("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "public"."categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_device_type_id_fkey" FOREIGN KEY ("device_type_id") REFERENCES "public"."device_type" ("device_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_sec_id_fkey" FOREIGN KEY ("sec_id") REFERENCES "public"."sections" ("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_acc_id_fkey" FOREIGN KEY ("acc_id") REFERENCES "public"."accessories" ("accessory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_child" ADD CONSTRAINT "device_child_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices" ("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_flow" ADD CONSTRAINT "approval_flow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_approval_flow_id_fkey" FOREIGN KEY ("approval_flow_id") REFERENCES "public"."approval_flow" ("approval_flow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "public"."departments" ("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_sec_id_fkey" FOREIGN KEY ("sec_id") REFERENCES "public"."sections" ("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets" ADD CONSTRAINT "borrow_return_tickets_approval_flow_id_fkey" FOREIGN KEY ("approval_flow_id") REFERENCES "public"."approval_flow" ("approval_flow_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets" ADD CONSTRAINT "borrow_return_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets_stage" ADD CONSTRAINT "borrow_return_tickets_stage_brt_id_fkey" FOREIGN KEY ("brt_id") REFERENCES "public"."borrow_return_tickets" ("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets_stage" ADD CONSTRAINT "borrow_return_tickets_stage_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "public"."departments" ("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets_stage" ADD CONSTRAINT "borrow_return_tickets_stage_sec_id_fkey" FOREIGN KEY ("sec_id") REFERENCES "public"."sections" ("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_return_tickets_stage" ADD CONSTRAINT "borrow_return_tickets_stage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_device" ADD CONSTRAINT "ticket_device_brt_id_fkey" FOREIGN KEY ("brt_id") REFERENCES "public"."borrow_return_tickets" ("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_device" ADD CONSTRAINT "ticket_device_device_child_id_fkey" FOREIGN KEY ("device_child_id") REFERENCES "public"."device_child" ("device_child_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_issues" ADD CONSTRAINT "ticket_issues_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices" ("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_issues" ADD CONSTRAINT "ticket_issues_brt_id_fkey" FOREIGN KEY ("brt_id") REFERENCES "public"."borrow_return_tickets" ("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_issues" ADD CONSTRAINT "ticket_issues_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_issues" ADD CONSTRAINT "ticket_issues_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."issue_attachments" ADD CONSTRAINT "issue_attachments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."ticket_issues" ("issue_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."issue_attachments" ADD CONSTRAINT "issue_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_brt_id_fkey" FOREIGN KEY ("brt_id") REFERENCES "public"."borrow_return_tickets" ("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_brts_id_fkey" FOREIGN KEY ("brts_id") REFERENCES "public"."borrow_return_tickets_stage" ("brts_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."ticket_issues" ("issue_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_recipients" ADD CONSTRAINT "notification_recipients_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications" ("notification_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_recipients" ADD CONSTRAINT "notification_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_borrow_return" ADD CONSTRAINT "log_borrow_return_brt_id_fkey" FOREIGN KEY ("brt_id") REFERENCES "public"."borrow_return_tickets" ("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_borrow_return" ADD CONSTRAINT "log_borrow_return_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_approval" ADD CONSTRAINT "log_approval_brts_id_fkey" FOREIGN KEY ("brts_id") REFERENCES "public"."borrow_return_tickets_stage" ("brts_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_approval" ADD CONSTRAINT "log_approval_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_issue" ADD CONSTRAINT "log_issue_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."ticket_issues" ("issue_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_issue" ADD CONSTRAINT "log_issue_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_category_permissions" ADD CONSTRAINT "role_category_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_category_permissions" ADD CONSTRAINT "role_category_permissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_chats" ADD CONSTRAINT "ticket_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_tc_id_fkey" FOREIGN KEY ("tc_id") REFERENCES "public"."ticket_chats" ("tc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_chat" ADD CONSTRAINT "data_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat" ("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rag_responses" ADD CONSTRAINT "rag_responses_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat" ("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;