-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');

-- Create profiles table to store user information and roles
CREATE TABLE public.profiles
(
    id         UUID                     NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
    email      TEXT                     NOT NULL,
    first_name TEXT,
    last_name  TEXT,
    role       app_role                 NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE
POLICY "Users can view their own profile"
  ON public.profiles
  FOR
SELECT
    USING (auth.uid() = id);

-- Create policy for users to update their own profile (excluding role)
CREATE
POLICY "Users can update their own profile"
  ON public.profiles
  FOR
UPDATE
    USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
-- Don't use OLD here

-- Function to prevent role changes by the user
CREATE
OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF
NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing role is not allowed';
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Trigger to enforce immutability of the role field
CREATE TRIGGER check_role_immutable
    BEFORE UPDATE
    ON public.profiles
    FOR EACH ROW
    WHEN (auth.uid() = OLD.id)
    EXECUTE FUNCTION public.prevent_role_change();

-- Create security definer function to check user roles
CREATE
OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (SELECT 1
               FROM public.profiles
               WHERE id = _user_id
                 AND role = _role)
           $$;

-- Function to handle new user registration (customers only)
CREATE
OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT
    ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- OPTIONAL: Insert a default admin user manually
-- (Make sure the user with this UUID/email exists in auth.users)
-- INSERT INTO public.profiles (id, email, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@renteasy.com', 'admin');
