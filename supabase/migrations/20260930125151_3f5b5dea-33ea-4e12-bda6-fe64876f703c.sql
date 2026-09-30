REVOKE EXECUTE ON FUNCTION public.resolve_location_id(text,double precision,double precision) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.stamp_time_record_location_ids() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.propagate_location_rename() FROM PUBLIC, anon, authenticated;