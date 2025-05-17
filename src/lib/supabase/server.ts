import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() { // Make async
    const cookieStore = await cookies(); // Await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // This is a server component, so we generally don't set cookies directly here.
                    // If needed, it would be part of a server action response.
                    // For read-only operations, this might not be strictly necessary
                    // but good to have the full structure for consistency if client is reused.
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Gracefully ignore if called from a context where set is not allowed (e.g. rendering)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Gracefully ignore
                    }
                },
            },
        }
    );
}

// Specific client for use ONLY within Server Actions or Route Handlers
// where cookies can be modified as part of the response.
export async function createSupabaseServerActionClient() {
    const cookieStore = await cookies(); // Await for actions/handlers as established
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );
}
