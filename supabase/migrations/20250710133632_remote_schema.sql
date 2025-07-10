SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'customer',
    'admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'active',
    'completed',
    'canceled'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."fuel_type" AS ENUM (
    'gasoline',
    'diesel',
    'electric',
    'hybrid'
);


ALTER TYPE "public"."fuel_type" OWNER TO "postgres";


CREATE TYPE "public"."transmission_type" AS ENUM (
    'manual',
    'automatic'
);


ALTER TYPE "public"."transmission_type" OWNER TO "postgres";


CREATE TYPE "public"."vehicle_status" AS ENUM (
    'active',
    'rented',
    'maintenance',
    'inactive'
);


ALTER TYPE "public"."vehicle_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_booking_total"("p_daily_rate" numeric, "p_start_date" "date", "p_end_date" "date") RETURNS numeric
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
  days INTEGER;
BEGIN
  days := (p_end_date - p_start_date) + 1;
  RETURN p_daily_rate * days;
END;
$$;


ALTER FUNCTION "public"."calculate_booking_total"("p_daily_rate" numeric, "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancel_expired_pending_bookings"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.bookings 
  SET status = 'canceled',
      updated_at = now()
  WHERE status = 'pending' 
    AND pending_expires_at IS NOT NULL 
    AND pending_expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cancel_expired_pending_bookings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_vehicle_availability"("p_vehicle_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_exclude_booking_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  -- Check if vehicle has any overlapping bookings
  -- We'll check for unexpired pending bookings instead of trying to update them
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.bookings 
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('pending', 'confirmed', 'active')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        -- For pending bookings, only consider them if they haven't expired
        (status = 'pending' AND (pending_expires_at IS NULL OR pending_expires_at > now()))
        OR status IN ('confirmed', 'active')
      )
      AND (
        (start_date <= p_end_date AND end_date >= p_start_date)
      )
  );
END;
$$;


ALTER FUNCTION "public"."check_vehicle_availability"("p_vehicle_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_exclude_booking_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_contract_version"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only create version if content has changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.contract_versions (
      contract_id, 
      version, 
      content, 
      changes_summary,
      created_by
    ) VALUES (
      NEW.id, 
      NEW.version, 
      NEW.content, 
      'Content updated',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_contract_version"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_default_vehicle_image"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If this is an insert and no default image exists for this vehicle, make this one default
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.vehicle_images 
      WHERE vehicle_id = NEW.vehicle_id AND is_default = true
    ) THEN
      NEW.is_default = true;
    END IF;
  END IF;
  
  -- If updating to set as default, unset other defaults for this vehicle
  IF TG_OP = 'UPDATE' AND NEW.is_default = true AND OLD.is_default = false THEN
    UPDATE public.vehicle_images 
    SET is_default = false 
    WHERE vehicle_id = NEW.vehicle_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_default_vehicle_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_contract_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  contract_number TEXT;
  year_suffix TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT 'CNT-' || year_suffix || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO contract_number
  FROM public.contracts
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  RETURN contract_number;
END;
$$;


ALTER FUNCTION "public"."generate_contract_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        'customer');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
SELECT EXISTS (SELECT 1
               FROM public.profiles
               WHERE id = _user_id
                 AND role = _role)
           $$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF
NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing role is not allowed';
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_pending_expiration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    NEW.pending_expires_at = now() + INTERVAL '15 minutes';
  ELSIF NEW.status != 'pending' THEN
    NEW.pending_expires_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_pending_expiration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."booking_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "form_type" "text" NOT NULL,
    "vehicle_condition" "jsonb",
    "fuel_level" integer,
    "mileage_reading" integer,
    "damages" "jsonb",
    "photos" "jsonb",
    "inspector_notes" "text",
    "customer_signature" "text",
    "inspector_signature" "text",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "booking_forms_form_type_check" CHECK (("form_type" = ANY (ARRAY['pickup'::"text", 'delivery'::"text"]))),
    CONSTRAINT "booking_forms_fuel_level_check" CHECK ((("fuel_level" >= 0) AND ("fuel_level" <= 100)))
);


ALTER TABLE "public"."booking_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "start_time" time without time zone DEFAULT '09:00:00'::time without time zone,
    "end_time" time without time zone DEFAULT '09:00:00'::time without time zone,
    "pickup_location" "text" NOT NULL,
    "dropoff_location" "text" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "daily_rate" numeric(10,2) NOT NULL,
    "duration_days" integer NOT NULL,
    "status" "public"."booking_status" DEFAULT 'pending'::"public"."booking_status" NOT NULL,
    "notes" "text",
    "booking_type" "text" DEFAULT 'online'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pending_expires_at" timestamp with time zone,
    CONSTRAINT "bookings_amount_check" CHECK (("total_amount" >= (0)::numeric)),
    CONSTRAINT "bookings_booking_type_check" CHECK (("booking_type" = ANY (ARRAY['online'::"text", 'offline'::"text"]))),
    CONSTRAINT "bookings_date_check" CHECK (("end_date" >= "start_date")),
    CONSTRAINT "bookings_duration_check" CHECK (("duration_days" > 0))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contract_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "template_content" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contract_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contract_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_id" "uuid" NOT NULL,
    "version" integer NOT NULL,
    "content" "text" NOT NULL,
    "changes_summary" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contract_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "template_id" "uuid",
    "contract_number" "text" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "pdf_url" "text",
    "customer_signature" "text",
    "customer_signed_at" timestamp with time zone,
    "admin_signature" "text",
    "admin_signed_at" timestamp with time zone,
    "signed_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contracts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_signature'::"text", 'signed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "document_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size" integer,
    "mime_type" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customer_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text" NOT NULL,
    "date_of_birth" "date",
    "license_number" "text" NOT NULL,
    "license_expiry" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "license_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_bookings" integer DEFAULT 0 NOT NULL,
    "total_spent" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "customers_license_status_check" CHECK (("license_status" = ANY (ARRAY['verified'::"text", 'pending'::"text", 'rejected'::"text"]))),
    CONSTRAINT "customers_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'flagged'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "locations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "role" "public"."app_role" DEFAULT 'customer'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspended" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vehicle_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."vehicle_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand" "text" NOT NULL,
    "model" "text" NOT NULL,
    "year" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "location" "text" NOT NULL,
    "mileage" integer DEFAULT 0 NOT NULL,
    "status" "public"."vehicle_status" DEFAULT 'active'::"public"."vehicle_status" NOT NULL,
    "description" "text",
    "fuel_type" "public"."fuel_type" DEFAULT 'gasoline'::"public"."fuel_type" NOT NULL,
    "transmission" "public"."transmission_type" DEFAULT 'automatic'::"public"."transmission_type" NOT NULL,
    "seats" integer NOT NULL,
    "color" "text" NOT NULL,
    "license_plate" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category_id" "uuid",
    CONSTRAINT "vehicles_mileage_check" CHECK (("mileage" >= 0)),
    CONSTRAINT "vehicles_price_check" CHECK (("price" > (0)::numeric)),
    CONSTRAINT "vehicles_seats_check" CHECK ((("seats" >= 1) AND ("seats" <= 15))),
    CONSTRAINT "vehicles_year_check" CHECK ((("year" >= 1900) AND (("year")::numeric <= (EXTRACT(year FROM CURRENT_DATE) + (1)::numeric))))
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."booking_forms"
    ADD CONSTRAINT "booking_forms_booking_id_form_type_key" UNIQUE ("booking_id", "form_type");



ALTER TABLE ONLY "public"."booking_forms"
    ADD CONSTRAINT "booking_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contract_templates"
    ADD CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contract_versions"
    ADD CONSTRAINT "contract_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_contract_number_key" UNIQUE ("contract_number");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_documents"
    ADD CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."vehicle_categories"
    ADD CONSTRAINT "vehicle_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."vehicle_categories"
    ADD CONSTRAINT "vehicle_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_images"
    ADD CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_license_plate_key" UNIQUE ("license_plate");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bookings_customer_id" ON "public"."bookings" USING "btree" ("customer_id");



CREATE INDEX "idx_bookings_dates" ON "public"."bookings" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_bookings_pending_expires" ON "public"."bookings" USING "btree" ("pending_expires_at") WHERE ("status" = 'pending'::"public"."booking_status");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "idx_bookings_vehicle_id" ON "public"."bookings" USING "btree" ("vehicle_id");



CREATE INDEX "idx_customer_documents_customer_id" ON "public"."customer_documents" USING "btree" ("customer_id");



CREATE INDEX "idx_customers_email" ON "public"."customers" USING "btree" ("email");



CREATE INDEX "idx_customers_profile_id" ON "public"."customers" USING "btree" ("profile_id");



CREATE INDEX "idx_customers_status" ON "public"."customers" USING "btree" ("status");



CREATE INDEX "idx_vehicle_images_display_order" ON "public"."vehicle_images" USING "btree" ("vehicle_id", "display_order");



CREATE UNIQUE INDEX "idx_vehicle_images_unique_default" ON "public"."vehicle_images" USING "btree" ("vehicle_id") WHERE ("is_default" = true);



CREATE INDEX "idx_vehicle_images_vehicle_id" ON "public"."vehicle_images" USING "btree" ("vehicle_id");



CREATE INDEX "idx_vehicles_brand_model" ON "public"."vehicles" USING "btree" ("brand", "model");



CREATE INDEX "idx_vehicles_location" ON "public"."vehicles" USING "btree" ("location");



CREATE INDEX "idx_vehicles_status" ON "public"."vehicles" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "bookings_set_pending_expiration_trigger" BEFORE INSERT OR UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."set_pending_expiration"();



CREATE OR REPLACE TRIGGER "bookings_updated_at_trigger" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "check_role_immutable" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW WHEN (("auth"."uid"() = "old"."id")) EXECUTE FUNCTION "public"."prevent_role_change"();



CREATE OR REPLACE TRIGGER "create_contract_version_trigger" AFTER UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."create_contract_version"();



CREATE OR REPLACE TRIGGER "trigger_ensure_default_vehicle_image" BEFORE INSERT OR UPDATE ON "public"."vehicle_images" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_default_vehicle_image"();



CREATE OR REPLACE TRIGGER "update_contract_templates_updated_at" BEFORE UPDATE ON "public"."contract_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contracts_updated_at" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_customers_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vehicle_categories_updated_at" BEFORE UPDATE ON "public"."vehicle_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vehicles_updated_at" BEFORE UPDATE ON "public"."vehicles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."booking_forms"
    ADD CONSTRAINT "booking_forms_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_forms"
    ADD CONSTRAINT "booking_forms_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."contract_versions"
    ADD CONSTRAINT "contract_versions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contract_versions"
    ADD CONSTRAINT "contract_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."contract_templates"("id");



ALTER TABLE ONLY "public"."customer_documents"
    ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_documents"
    ADD CONSTRAINT "customer_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicle_images"
    ADD CONSTRAINT "vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."vehicle_categories"("id");



CREATE POLICY "Admins can delete vehicles" ON "public"."vehicles" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert vehicles" ON "public"."vehicles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all booking forms" ON "public"."booking_forms" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all bookings" ON "public"."bookings" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all contracts" ON "public"."contracts" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all customer documents" ON "public"."customer_documents" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all customers" ON "public"."customers" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage contract templates" ON "public"."contract_templates" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage contract versions" ON "public"."contract_versions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage locations" ON "public"."locations" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage system settings" ON "public"."system_settings" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage vehicle categories" ON "public"."vehicle_categories" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage vehicle images" ON "public"."vehicle_images" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update vehicles" ON "public"."vehicles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all vehicles" ON "public"."vehicles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Anyone can view active vehicles" ON "public"."vehicles" FOR SELECT USING (("status" = 'active'::"public"."vehicle_status"));



CREATE POLICY "Anyone can view vehicle categories" ON "public"."vehicle_categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view vehicle images" ON "public"."vehicle_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vehicles"
  WHERE (("vehicles"."id" = "vehicle_images"."vehicle_id") AND (("vehicles"."status" = 'active'::"public"."vehicle_status") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Customers can create their own bookings" ON "public"."bookings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "bookings"."customer_id") AND ("customers"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Customers can view their contract versions" ON "public"."contract_versions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."contracts" "c"
     JOIN "public"."bookings" "b" ON (("b"."id" = "c"."booking_id")))
     JOIN "public"."customers" "cust" ON (("cust"."id" = "b"."customer_id")))
  WHERE (("c"."id" = "contract_versions"."contract_id") AND ("cust"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Customers can view their own booking forms" ON "public"."booking_forms" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."bookings" "b"
     JOIN "public"."customers" "c" ON (("c"."id" = "b"."customer_id")))
  WHERE (("b"."id" = "booking_forms"."booking_id") AND ("c"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Customers can view their own bookings" ON "public"."bookings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "bookings"."customer_id") AND ("customers"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Customers can view their own contracts" ON "public"."contracts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."bookings" "b"
     JOIN "public"."customers" "c" ON (("c"."id" = "b"."customer_id")))
  WHERE (("b"."id" = "contracts"."booking_id") AND ("c"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own customer record" ON "public"."customers" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own documents" ON "public"."customer_documents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customers"
  WHERE (("customers"."id" = "customer_documents"."customer_id") AND ("customers"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."booking_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contract_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contract_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_booking_total"("p_daily_rate" numeric, "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_booking_total"("p_daily_rate" numeric, "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_booking_total"("p_daily_rate" numeric, "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."cancel_expired_pending_bookings"() TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_expired_pending_bookings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_expired_pending_bookings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_vehicle_availability"("p_vehicle_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_exclude_booking_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_vehicle_availability"("p_vehicle_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_exclude_booking_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_vehicle_availability"("p_vehicle_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_exclude_booking_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_contract_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_contract_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_contract_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_default_vehicle_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_default_vehicle_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_default_vehicle_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_contract_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_contract_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_contract_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_pending_expiration"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_pending_expiration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_pending_expiration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."booking_forms" TO "anon";
GRANT ALL ON TABLE "public"."booking_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_forms" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."contract_templates" TO "anon";
GRANT ALL ON TABLE "public"."contract_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_templates" TO "service_role";



GRANT ALL ON TABLE "public"."contract_versions" TO "anon";
GRANT ALL ON TABLE "public"."contract_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_versions" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON TABLE "public"."customer_documents" TO "anon";
GRANT ALL ON TABLE "public"."customer_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_documents" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_categories" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_categories" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_images" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_images" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_images" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
