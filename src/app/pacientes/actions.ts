'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Define a type for the patient data for clarity and type safety
export interface PatientFormData {
    first_name: string;
    last_name: string;
    date_of_birth?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    orthodontic_stage_notes?: string | null;
}

export async function addPatient(formData: PatientFormData) {
    const cookieStore = await cookies(); // Await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options }); // Or cookieStore.delete({ name, ...options }) if available and preferred
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                    }
                },
            },
        }
    );

    // Basic server-side validation
    if (!formData.first_name || !formData.last_name) {
        return { error: { message: 'Nombre y Apellidos son obligatorios.' } };
    }

    const patientDataToInsert = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth || null,
        phone_number: formData.phone_number || null,
        email: formData.email?.toLowerCase() || null, // Store email in lowercase
        address: formData.address || null,
        orthodontic_stage_notes: formData.orthodontic_stage_notes || null,
        // clinic_id will be null for now as per plan
    };

    const { data, error } = await supabase
        .from('patients')
        .insert([patientDataToInsert])
        .select()
        .single(); // .single() if you expect one row back and want it as an object not array

    if (error) {
        console.error('Supabase error inserting patient:', error);
        // More specific error handling can be added here based on Supabase error codes
        return { error: { message: `Error de base de datos: ${error.message}` } };
    }

    // Revalidate the path to the patients list page so it shows the new patient
    // Assuming the main patient list will be at '/pacientes'
    revalidatePath('/pacientes');
    revalidatePath(`/pacientes/${data.id}`); // Revalidate the details page as well

    return { data, error: null };
}

export async function updatePatient(id: string, formData: PatientFormData) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    if (!id) {
        return { error: { message: 'ID del paciente es requerido para actualizar.' } };
    }
    if (!formData.first_name || !formData.last_name) {
        return { error: { message: 'Nombre y Apellidos son obligatorios.' } };
    }

    const patientDataToUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth || null,
        phone_number: formData.phone_number || null,
        email: formData.email?.toLowerCase() || null,
        address: formData.address || null,
        orthodontic_stage_notes: formData.orthodontic_stage_notes || null,
        updated_at: new Date().toISOString(), // Explicitly set updated_at, though DB trigger also does it
    };

    const { data, error } = await supabase
        .from('patients')
        .update(patientDataToUpdate)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Supabase error updating patient:', error);
        return { error: { message: `Error de base de datos al actualizar: ${error.message}` } };
    }

    revalidatePath('/pacientes'); // Revalidate patient list
    revalidatePath(`/pacientes/${id}`); // Revalidate this patient's detail page
    revalidatePath(`/pacientes/${id}/editar`); // Revalidate this edit page itself if needed

    return { data, error: null };
}

export async function deletePatient(id: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    if (!id) {
        return { error: { message: 'ID del paciente es requerido para eliminar.' } };
    }

    const { error } = await supabase
        .from('patients')
        .update({ deleted_at: new Date().toISOString() }) // Set deleted_at to current time
        .eq('id', id);

    if (error) {
        console.error('Supabase error deleting patient (soft delete):', error);
        return { error: { message: `Error de base de datos al eliminar: ${error.message}` } };
    }

    revalidatePath('/pacientes'); // Revalidate patient list
    revalidatePath(`/pacientes/${id}`); // Revalidate this patient's detail page
    revalidatePath(`/pacientes/${id}/editar`); // Also revalidate edit page as patient is now "gone"

    return { error: null }; // Indicate success
}
