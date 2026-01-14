-- CreateEnum
CREATE TYPE "US_ROLE" AS ENUM ('ADMIN', 'HOD', 'HOS', 'TECHNICAL', 'STAFF', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "DEVICE_CHILD_STATUS" AS ENUM ('READY', 'BORROWED', 'REPAIRING', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "BRT_STATUS" AS ENUM ('PENDING', 'APPROVED', 'IN_USE', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BRTS_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TI_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TI_RESULT" AS ENUM ('SUCCESS', 'FAILED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "DA_STATUS" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BASE_EVENT" AS ENUM ('DEVICE_CREATED', 'APPROVAL_REQUESTED', 'NOTIFICATION_FULFILLED', 'NOTIFICATION_RESOLVED', 'TICKET_CREATED', 'TICKET_APPROVED', 'TICKET_REJECTED', 'TICKET_STAGE_PASSED', 'TICKET_RETURNED', 'TICKET_DUE_SOON', 'TICKET_OVERDUE', 'ISSUE_REPORTED', 'ISSUE_ASSIGNED', 'ISSUE_RESOLVED', 'ISSUE_MARK_DAMAGED');

-- CreateEnum
CREATE TYPE "NR_STATUS" AS ENUM ('UNREAD', 'READ', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NR_EVENT" AS ENUM ('APPROVAL_REQUESTED', 'REQUEST_FULFILLED', 'REQUEST_RESOLVED', 'YOUR_TICKET_APPROVED', 'YOUR_TICKET_STAGE_APPROVED', 'YOUR_TICKET_REJECTED', 'YOUR_TICKET_IN_USE', 'YOUR_TICKET_RETURNED', 'DUE_SOON_REMINDER', 'OVERDUE_ALERT', 'ISSUE_NEW_FOR_TECH', 'ISSUE_ASSIGNED_TO_YOU', 'ISSUE_RESOLVED_FOR_REPORTER');

-- CreateEnum
CREATE TYPE "CM_ROLE" AS ENUM ('user', 'assistant', 'system', 'tool', 'admin');

-- CreateEnum
CREATE TYPE "CM_STATUS" AS ENUM ('ok', 'error', 'blocked');

-- CreateEnum
CREATE TYPE "LDC_ACTION" AS ENUM ('BORROWED', 'RETURNED', 'CHANGED', 'RESOLVED', 'MARK_DAMAGED');

-- CreateEnum
CREATE TYPE "LBR_ACTION" AS ENUM ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'RETURNED', 'MARK_DAMAGED', 'MARK_LOST');

-- CreateEnum
CREATE TYPE "LI_ACTION" AS ENUM ('REPORTED', 'ASSIGNED', 'UPDATED', 'RESOLVED', 'MARK_DAMAGED', 'CANCELLED');

-- CreateTable
CREATE TABLE "departments" (
    "dept_id" SERIAL NOT NULL,
    "dept_name" VARCHAR(200) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "sections" (
    "sec_id" SERIAL NOT NULL,
    "sec_name" VARCHAR(50) NOT NULL,
    "sec_dept_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "sections_pkey" PRIMARY KEY ("sec_id")
);

-- CreateTable
CREATE TABLE "users" (
    "us_id" SERIAL NOT NULL,
    "us_emp_code" VARCHAR(100),
    "us_firstname" VARCHAR(150) NOT NULL,
    "us_lastname" VARCHAR(150) NOT NULL,
    "us_username" VARCHAR(150) NOT NULL,
    "us_password" VARCHAR(255) NOT NULL,
    "us_email" VARCHAR(150) NOT NULL,
    "us_phone" VARCHAR(20) NOT NULL,
    "us_role" "US_ROLE" NOT NULL,
    "us_images" VARCHAR(200),
    "us_dept_id" INTEGER,
    "us_sec_id" INTEGER,
    "us_is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("us_id")
);

-- CreateTable
CREATE TABLE "devices" (
    "de_id" SERIAL NOT NULL,
    "de_serial_number" VARCHAR(100) NOT NULL,
    "de_name" VARCHAR(200) NOT NULL,
    "de_description" VARCHAR(250),
    "de_location" VARCHAR(200) NOT NULL,
    "de_max_borrow_days" INTEGER NOT NULL,
    "de_images" VARCHAR(200),
    "de_af_id" INTEGER NOT NULL,
    "de_ca_id" INTEGER NOT NULL,
    "de_us_id" INTEGER NOT NULL,
    "de_sec_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("de_id")
);

-- CreateTable
CREATE TABLE "device_childs" (
    "dec_id" SERIAL NOT NULL,
    "dec_serial_number" VARCHAR(250),
    "dec_asset_code" VARCHAR(200) NOT NULL,
    "dec_has_serial_number" BOOLEAN NOT NULL DEFAULT false,
    "dec_status" "DEVICE_CHILD_STATUS" NOT NULL,
    "dec_de_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "device_childs_pkey" PRIMARY KEY ("dec_id")
);

-- CreateTable
CREATE TABLE "carts" (
    "ct_id" SERIAL NOT NULL,
    "ct_quantity" INTEGER NOT NULL DEFAULT 1,
    "ct_us_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "carts_pkey" PRIMARY KEY ("ct_id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "cti_id" SERIAL NOT NULL,
    "cti_us_name" VARCHAR(255),
    "cti_phone" VARCHAR(20),
    "cti_note" VARCHAR(255),
    "cti_usage_location" VARCHAR(255),
    "cti_quantity" INTEGER NOT NULL DEFAULT 1,
    "cti_start_date" TIMESTAMPTZ(6),
    "cti_end_date" TIMESTAMPTZ(6),
    "cti_ct_id" INTEGER NOT NULL,
    "cti_de_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cti_id")
);

-- CreateTable
CREATE TABLE "cart_device_childs" (
    "cdc_id" SERIAL NOT NULL,
    "cdc_cti_id" INTEGER NOT NULL,
    "cdc_dec_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "reserved_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_device_childs_pkey" PRIMARY KEY ("cdc_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "rt_id" SERIAL NOT NULL,
    "rt_us_id" INTEGER NOT NULL,
    "rt_token_hash" VARCHAR(255) NOT NULL,
    "rt_revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("rt_id")
);

-- CreateTable
CREATE TABLE "accessories" (
    "acc_id" SERIAL NOT NULL,
    "acc_name" VARCHAR(100) NOT NULL,
    "acc_quantity" INTEGER NOT NULL,
    "acc_de_id" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "accessories_pkey" PRIMARY KEY ("acc_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "ca_id" SERIAL NOT NULL,
    "ca_name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("ca_id")
);

-- CreateTable
CREATE TABLE "approval_flows" (
    "af_id" SERIAL NOT NULL,
    "af_name" VARCHAR(100) NOT NULL,
    "af_is_active" BOOLEAN NOT NULL DEFAULT true,
    "af_us_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "approval_flows_pkey" PRIMARY KEY ("af_id")
);

-- CreateTable
CREATE TABLE "approval_flow_steps" (
    "afs_id" SERIAL NOT NULL,
    "afs_step_approve" INTEGER NOT NULL,
    "afs_dept_id" INTEGER,
    "afs_sec_id" INTEGER,
    "afs_role" "US_ROLE" NOT NULL,
    "afs_af_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "approval_flow_steps_pkey" PRIMARY KEY ("afs_id")
);

-- CreateTable
CREATE TABLE "device_availabilities" (
    "da_id" SERIAL NOT NULL,
    "da_dec_id" INTEGER NOT NULL,
    "da_brt_id" INTEGER NOT NULL,
    "da_start" TIMESTAMPTZ(6) NOT NULL,
    "da_end" TIMESTAMPTZ(6) NOT NULL,
    "da_status" "DA_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_availabilities_pkey" PRIMARY KEY ("da_id")
);

-- CreateTable
CREATE TABLE "borrow_return_tickets" (
    "brt_id" SERIAL NOT NULL,
    "brt_status" "BRT_STATUS" NOT NULL,
    "brt_usage_location" VARCHAR(255) NOT NULL,
    "brt_borrow_purpose" VARCHAR(255) NOT NULL,
    "brt_start_date" TIMESTAMPTZ(6) NOT NULL,
    "brt_end_date" TIMESTAMPTZ(6) NOT NULL,
    "brt_quantity" INTEGER NOT NULL DEFAULT 1,
    "brt_current_stage" INTEGER,
    "brt_reject_reason" VARCHAR(255),
    "brt_pickup_location" VARCHAR(255),
    "brt_pickup_datetime" TIMESTAMPTZ(6),
    "brt_return_location" VARCHAR(255),
    "brt_return_datetime" TIMESTAMPTZ(6),
    "brt_af_id" INTEGER,
    "brt_user_id" INTEGER NOT NULL,
    "brt_staff_id" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "borrow_return_tickets_pkey" PRIMARY KEY ("brt_id")
);

-- CreateTable
CREATE TABLE "borrow_return_ticket_stages" (
    "brts_id" SERIAL NOT NULL,
    "brts_status" "BRTS_STATUS" NOT NULL,
    "brts_name" VARCHAR(191) NOT NULL,
    "brts_step_approve" INTEGER NOT NULL,
    "brts_role" "US_ROLE" NOT NULL,
    "brts_dept_id" INTEGER,
    "brts_sec_id" INTEGER,
    "brts_dept_name" VARCHAR(200),
    "brts_sec_name" VARCHAR(200),
    "brts_brt_id" INTEGER NOT NULL,
    "brts_us_id" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "borrow_return_ticket_stages_pkey" PRIMARY KEY ("brts_id")
);

-- CreateTable
CREATE TABLE "ticket_devices" (
    "td_id" SERIAL NOT NULL,
    "td_brt_id" INTEGER NOT NULL,
    "td_dec_id" INTEGER NOT NULL,
    "td_origin_cti_id" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "ticket_devices_pkey" PRIMARY KEY ("td_id")
);

-- CreateTable
CREATE TABLE "ticket_issues" (
    "ti_id" SERIAL NOT NULL,
    "ti_de_id" INTEGER NOT NULL,
    "ti_brt_id" INTEGER,
    "ti_title" VARCHAR(200) NOT NULL,
    "ti_description" TEXT NOT NULL,
    "ti_reported_by" INTEGER NOT NULL,
    "ti_assigned_to" INTEGER,
    "ti_status" "TI_STATUS" NOT NULL,
    "ti_result" "TI_RESULT" NOT NULL,
    "ti_damaged_reason" VARCHAR(255),
    "ti_resolved_note" TEXT,
    "receive_at" TIMESTAMPTZ(6),
    "success_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_issues_pkey" PRIMARY KEY ("ti_id")
);

-- CreateTable
CREATE TABLE "issue_attachments" (
    "iatt_id" SERIAL NOT NULL,
    "iatt_path_url" VARCHAR(255) NOT NULL,
    "iatt_ti_id" INTEGER NOT NULL,
    "uploaded_by" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_attachments_pkey" PRIMARY KEY ("iatt_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "n_id" SERIAL NOT NULL,
    "n_title" VARCHAR(200) NOT NULL,
    "n_message" TEXT NOT NULL,
    "n_data" JSONB,
    "n_target_route" VARCHAR(255),
    "n_base_event" "BASE_EVENT",
    "n_brt_id" INTEGER,
    "n_brts_id" INTEGER,
    "n_ti_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "send_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("n_id")
);

-- CreateTable
CREATE TABLE "notification_recipients" (
    "nr_id" SERIAL NOT NULL,
    "nr_status" "NR_STATUS" NOT NULL,
    "nr_event" "NR_EVENT" NOT NULL,
    "nr_n_id" INTEGER NOT NULL,
    "nr_us_id" INTEGER NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "dismissed_at" TIMESTAMPTZ(6),

    CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("nr_id")
);

-- CreateTable
CREATE TABLE "log_borrow_returns" (
    "lbr_id" SERIAL NOT NULL,
    "lbr_action" "LBR_ACTION" NOT NULL,
    "lbr_old_status" VARCHAR(50),
    "lbr_new_status" VARCHAR(50),
    "lbr_note" TEXT,
    "lbr_actor_id" INTEGER,
    "lbr_brt_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_borrow_returns_pkey" PRIMARY KEY ("lbr_id")
);

-- CreateTable
CREATE TABLE "log_issues" (
    "li_id" SERIAL NOT NULL,
    "li_action" "LI_ACTION" NOT NULL,
    "li_old_status" VARCHAR(50),
    "li_new_status" VARCHAR(50),
    "li_note" TEXT,
    "li_actor_id" INTEGER,
    "li_ti_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_issues_pkey" PRIMARY KEY ("li_id")
);

-- CreateTable
CREATE TABLE "log_device_childs" (
    "ldc_id" SERIAL NOT NULL,
    "ldc_action" "LDC_ACTION" NOT NULL,
    "ldc_old_status" VARCHAR(50),
    "ldc_new_status" VARCHAR(50),
    "ldc_note" TEXT,
    "ldc_actor_id" INTEGER,
    "ldc_ti_id" INTEGER,
    "ldc_brt_id" INTEGER,
    "ldc_dec_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_device_childs_pkey" PRIMARY KEY ("ldc_id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "cr_id" SERIAL NOT NULL,
    "cr_us_id" INTEGER NOT NULL,
    "cr_title" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "last_msg_at" TIMESTAMPTZ(6),

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("cr_id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "cm_id" SERIAL NOT NULL,
    "cm_role" "CM_ROLE" NOT NULL,
    "cm_content" TEXT NOT NULL,
    "cm_content_json" JSONB,
    "cm_status" "CM_STATUS" NOT NULL DEFAULT 'ok',
    "cm_parent_id" INTEGER,
    "cm_cr_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("cm_id")
);

-- CreateTable
CREATE TABLE "chat_attachments" (
    "catt_id" SERIAL NOT NULL,
    "catt_cm_id" INTEGER NOT NULL,
    "catt_file_path" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_attachments_pkey" PRIMARY KEY ("catt_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_dept_name_key" ON "departments"("dept_name");

-- CreateIndex
CREATE UNIQUE INDEX "sections_sec_name_key" ON "sections"("sec_name");

-- CreateIndex
CREATE INDEX "idx_sections_dept" ON "sections"("sec_dept_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_us_emp_code_key" ON "users"("us_emp_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_us_username_key" ON "users"("us_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_us_email_key" ON "users"("us_email");

-- CreateIndex
CREATE INDEX "idx_users_dept_sec" ON "users"("us_dept_id", "us_sec_id");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "users"("us_is_active");

-- CreateIndex
CREATE UNIQUE INDEX "devices_de_serial_number_key" ON "devices"("de_serial_number");

-- CreateIndex
CREATE INDEX "idx_devices_category" ON "devices"("de_ca_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_childs_dec_serial_number_key" ON "device_childs"("dec_serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "device_childs_dec_asset_code_key" ON "device_childs"("dec_asset_code");

-- CreateIndex
CREATE INDEX "idx_child_device" ON "device_childs"("dec_de_id");

-- CreateIndex
CREATE INDEX "idx_child_status" ON "device_childs"("dec_status");

-- CreateIndex
CREATE INDEX "idx_cart_user_status" ON "carts"("ct_us_id");

-- CreateIndex
CREATE INDEX "idx_ct_item_cart" ON "cart_items"("cti_ct_id");

-- CreateIndex
CREATE INDEX "idx_ct_item_device" ON "cart_items"("cti_de_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ct_item_device" ON "cart_items"("cti_ct_id", "cti_de_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_rt_token_hash_key" ON "refresh_tokens"("rt_token_hash");

-- CreateIndex
CREATE INDEX "idx_rt_user_exp" ON "refresh_tokens"("rt_us_id");

-- CreateIndex
CREATE INDEX "idx_rt_revoked" ON "refresh_tokens"("rt_revoked_at");

-- CreateIndex
CREATE INDEX "accessories_acc_de_id_idx" ON "accessories"("acc_de_id");

-- CreateIndex
CREATE INDEX "idx_steps_flow_step" ON "approval_flow_steps"("afs_af_id", "afs_step_approve");

-- CreateIndex
CREATE INDEX "idx_avail_device_period" ON "device_availabilities"("da_dec_id", "da_start", "da_end");

-- CreateIndex
CREATE INDEX "idx_avail_status" ON "device_availabilities"("da_status");

-- CreateIndex
CREATE INDEX "idx_brt_user_status_created" ON "borrow_return_tickets"("brt_user_id", "brt_staff_id", "brt_status", "created_at");

-- CreateIndex
CREATE INDEX "idx_brt_flow" ON "borrow_return_tickets"("brt_af_id");

-- CreateIndex
CREATE INDEX "idx_brt_start_end" ON "borrow_return_tickets"("brt_start_date", "brt_end_date");

-- CreateIndex
CREATE INDEX "idx_brts_brt_step" ON "borrow_return_ticket_stages"("brts_id", "brts_step_approve");

-- CreateIndex
CREATE INDEX "idx_brts_status" ON "borrow_return_ticket_stages"("brts_status");

-- CreateIndex
CREATE INDEX "idx_brts_pending_lookup" ON "borrow_return_ticket_stages"("brts_status", "brts_role", "brts_dept_id", "brts_sec_id");

-- CreateIndex
CREATE INDEX "idx_ticket_device_brt" ON "ticket_devices"("td_brt_id");

-- CreateIndex
CREATE INDEX "idx_ticket_device_child" ON "ticket_devices"("td_dec_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ticket_device" ON "ticket_devices"("td_brt_id", "td_dec_id");

-- CreateIndex
CREATE INDEX "idx_issue_device_status" ON "ticket_issues"("ti_de_id", "ti_status", "created_at");

-- CreateIndex
CREATE INDEX "idx_issue_assignee" ON "ticket_issues"("ti_assigned_to", "ti_status");

-- CreateIndex
CREATE INDEX "idx_issue_attachments_issue" ON "issue_attachments"("iatt_ti_id");

-- CreateIndex
CREATE INDEX "idx_notif_created" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "idx_notif_brt" ON "notifications"("n_brt_id");

-- CreateIndex
CREATE INDEX "idx_notif_brts" ON "notifications"("n_brts_id");

-- CreateIndex
CREATE INDEX "idx_notif_issue" ON "notifications"("n_ti_id");

-- CreateIndex
CREATE INDEX "idx_notifrec_user_status" ON "notification_recipients"("nr_us_id", "nr_status", "nr_n_id");

-- CreateIndex
CREATE INDEX "idx_log_brt" ON "log_borrow_returns"("lbr_brt_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_log_issue" ON "log_issues"("li_ti_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_ldc_log_issue" ON "log_device_childs"("ldc_ti_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_log_device_history" ON "log_device_childs"("ldc_dec_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_rooms_cr_us_id_last_msg_at_idx" ON "chat_rooms"("cr_us_id", "last_msg_at");

-- CreateIndex
CREATE INDEX "chat_rooms_last_msg_at_idx" ON "chat_rooms"("last_msg_at");

-- CreateIndex
CREATE INDEX "chat_messages_cm_cr_id_created_at_idx" ON "chat_messages"("cm_cr_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_messages_cm_role_idx" ON "chat_messages"("cm_role");

-- CreateIndex
CREATE INDEX "chat_attachments_catt_cm_id_idx" ON "chat_attachments"("catt_cm_id");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_sec_dept_id_fkey" FOREIGN KEY ("sec_dept_id") REFERENCES "departments"("dept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_us_dept_id_fkey" FOREIGN KEY ("us_dept_id") REFERENCES "departments"("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_us_sec_id_fkey" FOREIGN KEY ("us_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_af_id_fkey" FOREIGN KEY ("de_af_id") REFERENCES "approval_flows"("af_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_ca_id_fkey" FOREIGN KEY ("de_ca_id") REFERENCES "categories"("ca_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_us_id_fkey" FOREIGN KEY ("de_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_sec_id_fkey" FOREIGN KEY ("de_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_childs" ADD CONSTRAINT "device_childs_dec_de_id_fkey" FOREIGN KEY ("dec_de_id") REFERENCES "devices"("de_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_ct_us_id_fkey" FOREIGN KEY ("ct_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cti_ct_id_fkey" FOREIGN KEY ("cti_ct_id") REFERENCES "carts"("ct_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cti_de_id_fkey" FOREIGN KEY ("cti_de_id") REFERENCES "devices"("de_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_device_childs" ADD CONSTRAINT "cart_device_childs_cdc_cti_id_fkey" FOREIGN KEY ("cdc_cti_id") REFERENCES "cart_items"("cti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_device_childs" ADD CONSTRAINT "cart_device_childs_cdc_dec_id_fkey" FOREIGN KEY ("cdc_dec_id") REFERENCES "device_childs"("dec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_rt_us_id_fkey" FOREIGN KEY ("rt_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessories" ADD CONSTRAINT "accessories_acc_de_id_fkey" FOREIGN KEY ("acc_de_id") REFERENCES "devices"("de_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flows" ADD CONSTRAINT "approval_flows_af_us_id_fkey" FOREIGN KEY ("af_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_af_id_fkey" FOREIGN KEY ("afs_af_id") REFERENCES "approval_flows"("af_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_dept_id_fkey" FOREIGN KEY ("afs_dept_id") REFERENCES "departments"("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_sec_id_fkey" FOREIGN KEY ("afs_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_availabilities" ADD CONSTRAINT "device_availabilities_da_dec_id_fkey" FOREIGN KEY ("da_dec_id") REFERENCES "device_childs"("dec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_availabilities" ADD CONSTRAINT "device_availabilities_da_brt_id_fkey" FOREIGN KEY ("da_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_tickets" ADD CONSTRAINT "borrow_return_tickets_brt_af_id_fkey" FOREIGN KEY ("brt_af_id") REFERENCES "approval_flows"("af_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_tickets" ADD CONSTRAINT "borrow_return_tickets_brt_user_id_fkey" FOREIGN KEY ("brt_user_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_tickets" ADD CONSTRAINT "borrow_return_tickets_brt_staff_id_fkey" FOREIGN KEY ("brt_staff_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_brt_id_fkey" FOREIGN KEY ("brts_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_us_id_fkey" FOREIGN KEY ("brts_us_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_dept_id_fkey" FOREIGN KEY ("brts_dept_id") REFERENCES "departments"("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_sec_id_fkey" FOREIGN KEY ("brts_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_devices" ADD CONSTRAINT "ticket_devices_td_brt_id_fkey" FOREIGN KEY ("td_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_devices" ADD CONSTRAINT "ticket_devices_td_dec_id_fkey" FOREIGN KEY ("td_dec_id") REFERENCES "device_childs"("dec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_issues" ADD CONSTRAINT "ticket_issues_ti_de_id_fkey" FOREIGN KEY ("ti_de_id") REFERENCES "devices"("de_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_issues" ADD CONSTRAINT "ticket_issues_ti_brt_id_fkey" FOREIGN KEY ("ti_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_issues" ADD CONSTRAINT "ticket_issues_ti_reported_by_fkey" FOREIGN KEY ("ti_reported_by") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_issues" ADD CONSTRAINT "ticket_issues_ti_assigned_to_fkey" FOREIGN KEY ("ti_assigned_to") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_attachments" ADD CONSTRAINT "issue_attachments_iatt_ti_id_fkey" FOREIGN KEY ("iatt_ti_id") REFERENCES "ticket_issues"("ti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_attachments" ADD CONSTRAINT "issue_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_n_brt_id_fkey" FOREIGN KEY ("n_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_n_brts_id_fkey" FOREIGN KEY ("n_brts_id") REFERENCES "borrow_return_ticket_stages"("brts_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_n_ti_id_fkey" FOREIGN KEY ("n_ti_id") REFERENCES "ticket_issues"("ti_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_nr_n_id_fkey" FOREIGN KEY ("nr_n_id") REFERENCES "notifications"("n_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_nr_us_id_fkey" FOREIGN KEY ("nr_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_borrow_returns" ADD CONSTRAINT "log_borrow_returns_lbr_brt_id_fkey" FOREIGN KEY ("lbr_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_borrow_returns" ADD CONSTRAINT "log_borrow_returns_lbr_actor_id_fkey" FOREIGN KEY ("lbr_actor_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_issues" ADD CONSTRAINT "log_issues_li_ti_id_fkey" FOREIGN KEY ("li_ti_id") REFERENCES "ticket_issues"("ti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_issues" ADD CONSTRAINT "log_issues_li_actor_id_fkey" FOREIGN KEY ("li_actor_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_actor_id_fkey" FOREIGN KEY ("ldc_actor_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_ti_id_fkey" FOREIGN KEY ("ldc_ti_id") REFERENCES "ticket_issues"("ti_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_brt_id_fkey" FOREIGN KEY ("ldc_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_dec_id_fkey" FOREIGN KEY ("ldc_dec_id") REFERENCES "device_childs"("dec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_cr_us_id_fkey" FOREIGN KEY ("cr_us_id") REFERENCES "users"("us_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_cm_cr_id_fkey" FOREIGN KEY ("cm_cr_id") REFERENCES "chat_rooms"("cr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_cm_parent_id_fkey" FOREIGN KEY ("cm_parent_id") REFERENCES "chat_messages"("cm_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_catt_cm_id_fkey" FOREIGN KEY ("catt_cm_id") REFERENCES "chat_messages"("cm_id") ON DELETE CASCADE ON UPDATE CASCADE;
