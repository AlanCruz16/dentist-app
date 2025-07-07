import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditPatientForm from '@/components/pacientes/EditPatientForm'; // Import the client component
import { ArrowLeft } from 'lucide-react';

interface EditPatientPageProps {
    params: {
        id: string;
    };
}

// Define a type for the full patient data, consistent with EditPatientForm
interface PatientDetail {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    orthodontic_stage_notes: string | null;
    allow_whatsapp_reminders: boolean | null;
    // created_at and updated_at might also be fetched if needed by the form/page
}

export default async function EditPatientPage(props: EditPatientPageProps) { // Changed to take full props
    const params = await props.params; // Await props.params
    const patientId = params.id;        // Then access .id
    const supabase = await createSupabaseServerClient();

    const { data: patient, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, phone_number, email, address, orthodontic_stage_notes, allow_whatsapp_reminders')
        .eq('id', patientId)
        .is('deleted_at', null)
        .single();

    if (error || !patient) {
        console.error('Error fetching patient for editing or patient not found:', error);
        notFound();
    }

    const typedPatient = patient as PatientDetail; // Type assertion

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Link href={`/pacientes/${patientId}`} className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a detalles del paciente
            </Link>
            <EditPatientForm patient={typedPatient} />
        </div>
    );
}
