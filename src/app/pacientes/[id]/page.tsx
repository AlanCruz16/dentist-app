import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react'; // Removed Trash2, it's in DeletePatientButton
import DeletePatientButton from '@/components/pacientes/DeletePatientButton'; // Import the new component

interface PatientDetailsPageProps {
    params: {
        id: string;
    };
}

// Define a type for the full patient data
interface PatientDetail {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null; // Stored as YYYY-MM-DD string
    phone_number: string | null;
    email: string | null;
    address: string | null;
    orthodontic_stage_notes: string | null;
    created_at: string;
    updated_at: string;
}

export default async function PatientDetailsPage(props: PatientDetailsPageProps) { // Changed to take full props
    const params = await props.params; // Await props.params as per error message implication
    const patientId = params.id;        // Then access .id
    const supabase = await createSupabaseServerClient();

    const { data: patient, error } = await supabase
        .from('patients')
        .select('*') // Select all columns for details view
        .eq('id', patientId)
        .is('deleted_at', null) // Ensure patient is not soft-deleted
        .single(); // Expect a single record

    if (error || !patient) {
        console.error('Error fetching patient details or patient not found:', error);
        notFound(); // Triggers the not-found page
    }

    const typedPatient = patient as PatientDetail; // Type assertion

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No especificada';
        try {
            return new Date(dateString).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' // Ensure UTC if date is stored as simple date
            });
        } catch (e) {
            return dateString; // Fallback to original string if formatting fails
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Link href="/pacientes" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista de pacientes
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">
                            {typedPatient.first_name} {typedPatient.last_name}
                        </CardTitle>
                        <CardDescription>Detalles del Paciente</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/pacientes/${typedPatient.id}/editar`} passHref>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </Button>
                        </Link>
                        <DeletePatientButton
                            patientId={typedPatient.id}
                            patientName={`${typedPatient.first_name} ${typedPatient.last_name}`}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Nombre Completo:</strong> {typedPatient.first_name} {typedPatient.last_name}</div>
                        <div><strong>Fecha de Nacimiento:</strong> {formatDate(typedPatient.date_of_birth)}</div>
                        <div><strong>Teléfono:</strong> {typedPatient.phone_number || 'No especificado'}</div>
                        <div><strong>Email:</strong> {typedPatient.email || 'No especificado'}</div>
                        <div className="md:col-span-2"><strong>Dirección:</strong> {typedPatient.address || 'No especificada'}</div>
                    </div>
                    <div className="pt-4">
                        <h4 className="font-semibold mb-1">Notas / Etapa del Tratamiento (Ortodoncia):</h4>
                        <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                            {typedPatient.orthodontic_stage_notes || 'Sin notas.'}
                        </p>
                    </div>
                    <hr />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                        <div><strong>ID Paciente:</strong> {typedPatient.id}</div>
                        <div><strong>Registrado el:</strong> {formatDate(typedPatient.created_at)}</div>
                        <div><strong>Última Actualización:</strong> {formatDate(typedPatient.updated_at)}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
