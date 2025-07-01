'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const FormSchema = z.object({
    name: z.string().min(1, { message: 'El nombre es requerido.' }),
    phone: z.string().min(1, { message: 'El teléfono es requerido.' }),
    email: z.string().email({ message: 'Por favor ingrese un correo válido.' }).optional().or(z.literal('')),
    message: z.string().optional(),
});

export async function createAppointmentRequest(prevState: any, formData: FormData) {
    const validatedFields = FormSchema.safeParse({
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        // Log the detailed error for debugging
        console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
        // Return a more generic error message to the user
        return {
            message: 'Error de validación. Por favor revise los campos.',
        };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('appointment_requests')
        .insert([
            {
                name: validatedFields.data.name,
                phone: validatedFields.data.phone,
                email: validatedFields.data.email,
                message: validatedFields.data.message,
            },
        ])
        .select();

    if (error) {
        console.error('Supabase error:', error);
        return {
            message: 'Error en la base de datos: No se pudo crear la solicitud de cita.',
        };
    }

    // Optionally, revalidate a path if you have an admin page to show these requests
    // revalidatePath('/admin/requests');

    return {
        message: '¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto.',
        data,
    };
}
