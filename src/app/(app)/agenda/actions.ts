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
    is_recurring?: boolean;
    recurrence_rule?: string | null;
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
        is_recurring,
        recurrence_rule,
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

    // If it's a recurring appointment, create multiple entries
    if (is_recurring && recurrence_rule) {
        const appointmentsToCreate = [];
        const initialStartTime = new Date(start_time);
        const initialEndTime = new Date(end_time);
        const duration = initialEndTime.getTime() - initialStartTime.getTime(); // duration in ms

        // Create up to 12 occurrences (e.g., ~3 months for weekly)
        for (let i = 0; i < 12; i++) {
            const newStartTime = new Date(initialStartTime);

            if (recurrence_rule === 'weekly') {
                newStartTime.setDate(initialStartTime.getDate() + (i * 7));
            } else if (recurrence_rule === 'bi-weekly') {
                newStartTime.setDate(initialStartTime.getDate() + (i * 14));
            } else if (recurrence_rule === 'monthly') {
                newStartTime.setMonth(initialStartTime.getMonth() + i);
            } else {
                if (i > 0) break;
            }

            const newEndTime = new Date(newStartTime.getTime() + duration);

            const timezoneOffset = newStartTime.getTimezoneOffset();
            const offsetHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0');
            const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
            const offsetSign = timezoneOffset <= 0 ? '+' : '-';
            const timezoneString = `${offsetSign}${offsetHours}:${offsetMinutes}`;

            const startTimeISO = new Date(newStartTime.getTime() - (timezoneOffset * 60000)).toISOString().slice(0, -1) + timezoneString;
            const endTimeISO = new Date(newEndTime.getTime() - (timezoneOffset * 60000)).toISOString().slice(0, -1) + timezoneString;

            appointmentsToCreate.push({
                patient_id,
                doctor_id,
                start_time: startTimeISO,
                end_time: endTimeISO,
                service_description: service_description || null,
                notes: notes || null,
                status: 'scheduled',
                is_recurring,
                recurrence_rule,
            });
        }

        // Note: A robust implementation should check for double-booking for EACH occurrence.
        // For this version, we are keeping it simple and inserting all at once.
        // A transaction would be ideal here if Supabase Edge Functions supported it easily,
        // but for a server action, `insert` on an array is atomic.
        const { data, error } = await supabase
            .from('appointments')
            .insert(appointmentsToCreate)
            .select();

        if (error) {
            console.error('Error creating recurring appointments:', error);
            return { error: { message: `Error al crear las citas recurrentes: ${error.message}` } };
        }

        revalidatePath('/agenda');
        return { data };

    } else {
        // Logic for a single appointment
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
                is_recurring: false,
                recurrence_rule: null,
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
