DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE public.users
            ALTER COLUMN profile_image TYPE TEXT USING profile_image::text;
    END IF;
END $$;
