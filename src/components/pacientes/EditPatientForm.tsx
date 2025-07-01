'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updatePatient, type PatientFormData } from '@/app/(app)/pacientes/actions'; // Adjusted path

// Define a type for the patient data passed as props (full detail)
interface PatientDetail {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    orthodontic_stage_notes: string | null;
    // created_at and updated_at are not directly editable but good to have if needed
}

interface EditPatientFormProps {
    patient: PatientDetail;
}

export default function EditPatientForm({ patient }: EditPatientFormProps) {
    const router = useRouter();

    const [firstName, setFirstName] = useState(patient.first_name || '');
    const [lastName, setLastName] = useState(patient.last_name || '');
    // Dates from DB might be full ISO strings, ensure input type="date" gets YYYY-MM-DD
    const [dateOfBirth, setDateOfBirth] = useState(patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '');
    const [phoneNumber, setPhoneNumber] = useState(patient.phone_number || '');
    const [email, setEmail] = useState(patient.email || '');
    const [address, setAddress] = useState(patient.address || '');
    const [orthodonticStageNotes, setOrthodonticStageNotes] = useState(patient.orthodontic_stage_notes || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Effect to update form fields if patient prop changes (e.g., due to re-fetch or navigation)
    useEffect(() => {
        setFirstName(patient.first_name || '');
        setLastName(patient.last_name || '');
        setDateOfBirth(patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '');
        setPhoneNumber(patient.phone_number || '');
        setEmail(patient.email || '');
        setAddress(patient.address || '');
        setOrthodonticStageNotes(patient.orthodontic_stage_notes || '');
    }, [patient]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (!firstName || !lastName) {
            setError('Nombre y Apellidos son obligatorios.');
            setLoading(false);
            return;
        }

        const updatedFormData: PatientFormData = {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth || null,
            phone_number: phoneNumber || null,
            email: email || null,
            address: address || null,
            orthodontic_stage_notes: orthodonticStageNotes || null,
        };

        try {
            const result = await updatePatient(patient.id, updatedFormData);

            if (result.error) {
                setError(`Error al actualizar paciente: ${result.error.message}`);
            } else {
                setMessage('Paciente actualizado exitosamente. Redirigiendo...');
                setTimeout(() => {
                    router.push(`/pacientes/${patient.id}`); // Redirect to patient details page
                }, 1500);
            }
        } catch (e: any) {
            setError('Ocurrió un error inesperado en el cliente. Por favor, intente de nuevo.');
            console.error("Client-side submit error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Editar Paciente</CardTitle>
                <CardDescription>Modifique los datos del paciente {patient.first_name} {patient.last_name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input id="firstName" value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" value={lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} required disabled={loading} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Fecha de Nacimiento (YYYY-MM-DD)</Label>
                        <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)} disabled={loading} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                            <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)} disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={loading} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea id="address" value={address} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)} disabled={loading} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orthodonticStageNotes">Notas / Etapa del Tratamiento (Ortodoncia)</Label>
                        <Textarea id="orthodonticStageNotes" value={orthodonticStageNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrthodonticStageNotes(e.target.value)} disabled={loading} />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {message && <p className="text-sm text-green-600">{message}</p>}

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => router.push(`/pacientes/${patient.id}`)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
