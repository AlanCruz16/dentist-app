'use server';

import { createSupabaseServerActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface AppointmentData {
    patient_id: string;
    doctor_id: string;
    start_time: string; // ISO string
    end_time: string;   // ISO string
    service_description?: string;
    notes?: string;
}

export async function createAppointment(appointmentData: AppointmentData) {
    const supabase = await createSupabaseServerActionClient();

    const {
        patient_id,
        doctor_id,
        start_time,
        end_time,
        service_description,
        notes,
    } = appointmentData;

    if (!patient_id || !doctor_id || !start_time || !end_time) {
        return { error: { message: 'Faltan datos requeridos para crear la cita.' } };
    }

    // Prevent double-booking for appointments
    // Prevent double-booking for appointments
    // An existing appointment (ea_start, ea_end) overlaps with a new one (na_start, na_end) if:
    // ea_start < na_end AND ea_end > na_start
    const { data: overlappingAppointments, error: overlapError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctor_id)
        .lt('start_time', end_time) // Existing appointment starts before new one ends
        .gt('end_time', start_time)   // Existing appointment ends after new one starts
        .neq('status', 'cancelled');

    if (overlapError) {
        console.error('Error checking for overlapping appointments:', overlapError);
        return { error: { message: `Error al verificar citas existentes: ${overlapError.message}` } };
    }

    if (overlappingAppointments && overlappingAppointments.length > 0) {
        return { error: { message: 'Ya existe una cita programada para este doctor en el horario seleccionado.' } };
    }

    // Prevent booking over blocked times
    // Prevent booking over blocked times
    // An existing blocked time (bt_start, bt_end) overlaps with a new one (na_start, na_end) if:
    // bt_start < na_end AND bt_end > na_start
    const { data: overlappingBlockedTimes, error: blockedOverlapError } = await supabase
        .from('blocked_times')
        .select('id')
        .eq('doctor_id', doctor_id)
        .lt('start_time', end_time) // Blocked time starts before new appointment ends
        .gt('end_time', start_time);  // Blocked time ends after new appointment starts

    if (blockedOverlapError) {
        console.error('Error checking for overlapping blocked times:', blockedOverlapError);
        return { error: { message: `Error al verificar tiempos bloqueados: ${blockedOverlapError.message}` } };
    }

    if (overlappingBlockedTimes && overlappingBlockedTimes.length > 0) {
        return { error: { message: 'El horario seleccionado está bloqueado por el doctor.' } };
    }

    const { data, error } = await supabase
        .from('appointments')
        .insert({
            patient_id,
            doctor_id,
            start_time,
            end_time,
            service_description: service_description || null,
            notes: notes || null,
            status: 'scheduled',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating appointment in action:', error);
        return { error: { message: `Error al crear la cita: ${error.message}` } };
    }

    revalidatePath('/agenda');
    return { data };
}

interface BlockedTimeData {
    doctor_id: string; // Can be null if it's a clinic-wide block, adjust if needed
    start_time: string; // ISO string
    end_time: string;   // ISO string
    reason?: string;
    // clinic_id could be added if needed and not handled by RLS/default
}

export async function createBlockedTime(blockedTimeData: BlockedTimeData) {
    const supabase = await createSupabaseServerActionClient();

    const {
        doctor_id,
        start_time,
        end_time,
        reason,
    } = blockedTimeData;

    if (!doctor_id || !start_time || !end_time) { // doctor_id might be optional if clinic-wide blocks are allowed
        return { error: { message: 'Faltan datos requeridos para bloquear el tiempo.' } };
    }

    // Optional: Check if this new blocked time overlaps existing appointments
    // This might be complex depending on desired behavior (e.g., auto-cancel appointments?)
    // For MVP, we might skip this server-side check and rely on UI cues,
    // or simply block, and existing appointments in that slot remain.

    const { data, error } = await supabase
        .from('blocked_times')
        .insert({
            doctor_id,
            start_time,
            end_time,
            reason: reason || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating blocked time in action:', error);
        return { error: { message: `Error al bloquear el tiempo: ${error.message}` } };
    }

    revalidatePath('/agenda');
    return { data };
}
