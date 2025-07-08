import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ReceiptView from '@/components/pacientes/ReceiptView';
import { notFound } from 'next/navigation';

// This is now a React Server Component (RSC)
export default async function ReceiptPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Await the params to resolve them
    const supabase = await createSupabaseServerClient();

    // Fetch the payment details
    const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

    if (paymentError || !payment) {
        // If not found, you can render a "not found" page
        notFound();
    }

    // Fetch the patient details using the patient_id from the payment
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('id', payment.patient_id)
        .single();

    if (patientError || !patient) {
        notFound();
    }

    // Pass the fetched data to the client component for rendering
    return <ReceiptView payment={payment} patient={patient} />;
}
