import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react'; // Icon for Add button

// Define a type for the patient data fetched from Supabase
interface Patient {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    email: string | null;
    created_at: string; // Assuming it's a string date
}

export default async function PatientsPage() {
    const supabase = await createSupabaseServerClient(); // Use the async version

    const { data: patients, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone_number, email, created_at')
        .is('deleted_at', null) // Fetch only non-deleted patients
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching patients:', error);
        // TODO: Add a more user-friendly error display
        return <div className="container mx-auto p-4 text-red-500">Error al cargar pacientes: {error.message}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Lista de Pacientes</h1>
                <Link href="/pacientes/nuevo" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Agregar Paciente
                    </Button>
                </Link>
            </div>

            {patients && patients.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                                <TableHead className="hidden lg:table-cell">Email</TableHead>
                                <TableHead className="hidden md:table-cell">Registrado el</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell>
                                        {patient.first_name} {patient.last_name}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{patient.phone_number || '-'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{patient.email || '-'}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {new Date(patient.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/pacientes/${patient.id}`} passHref>
                                            <Button variant="outline" size="sm" className="mr-2">Ver</Button>
                                        </Link>
                                        <Link href={`/pacientes/${patient.id}/editar`} passHref>
                                            <Button variant="outline" size="sm">Editar</Button>
                                        </Link>
                                        {/* Delete button/action will be added later */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-10 border rounded-lg">
                    <p className="text-gray-500">No hay pacientes registrados.</p>
                    <Link href="/pacientes/nuevo" passHref className="mt-4 inline-block">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Primer Paciente
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
