from app.config import settings

_supabase_client = None


def get_supabase_client():
    global _supabase_client
    if _supabase_client is None:
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                from supabase import create_client
                _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            except Exception as e:
                _supabase_client = None
    return _supabase_client


class SafeSupabaseProxy:
    def __getattr__(self, name):
        client = get_supabase_client()
        if client:
            return getattr(client, name)
        raise RuntimeError("Supabase client is not reachable or offline.")


supabase = SafeSupabaseProxy()
