-- Add can_create_entries to existing users' app_metadata
-- This is a one-time migration to add the permission field

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  '{"can_create_entries":true}'::jsonb
WHERE raw_app_meta_data ? 'role'
  AND raw_app_meta_data ? 'account_type';
