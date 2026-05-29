CREATE TYPE "public"."product_status" AS ENUM('pending', 'researched', 'scripted', 'produced', 'published');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('scheduled', 'published', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."script_status" AS ENUM('draft', 'approved', 'in_production', 'done');--> statement-breakpoint
CREATE TYPE "public"."series" AS ENUM('test-that', 'house-30s', 'which-one-better');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('pending', 'rendering', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publish_job_id" uuid NOT NULL,
	"tiktok_post_id" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"avg_watch_time" real,
	"completion_rate" real,
	"insights_json" jsonb,
	"snapshot_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_urls" jsonb DEFAULT '[]'::jsonb,
	"source_url" text,
	"price_range" text,
	"category" text,
	"brand" text,
	"status" "product_status" DEFAULT 'pending' NOT NULL,
	"brief_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publish_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"tiktok_post_id" text,
	"caption" text NOT NULL,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"trending_sound_url" text,
	"scheduled_at" timestamp NOT NULL,
	"published_at" timestamp,
	"status" "publish_status" DEFAULT 'scheduled' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"series" "series" NOT NULL,
	"hook" text NOT NULL,
	"body" text NOT NULL,
	"cta" text NOT NULL,
	"estimated_duration" integer,
	"status" "script_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"topview_job_id" text,
	"creatomate_job_id" text,
	"video_url" text,
	"thumbnail_url" text,
	"duration_seconds" integer,
	"status" "video_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_publish_job_id_publish_jobs_id_fk" FOREIGN KEY ("publish_job_id") REFERENCES "public"."publish_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publish_jobs" ADD CONSTRAINT "publish_jobs_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scripts" ADD CONSTRAINT "scripts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videos" ADD CONSTRAINT "videos_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_tiktok_post_id_idx" ON "analytics_snapshots" USING btree ("tiktok_post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "publish_jobs_status_idx" ON "publish_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "publish_jobs_scheduled_at_idx" ON "publish_jobs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scripts_product_id_idx" ON "scripts" USING btree ("product_id");