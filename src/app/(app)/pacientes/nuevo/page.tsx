'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For multi-line notes
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addPatient, type PatientFormData } from '../actions'; // Import the server action

export default function AddPatientPage() {
    const router = useRouter();
    // const supabase = createClient(); // No longer needed directly for form submission

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(''); // Store as string, YYYY-MM-DD
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [orthodonticStageNotes, setOrthodonticStageNotes] = useState('');
    const [allowWhatsappReminders, setAllowWhatsappReminders] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // Basic client-side validation (can be enhanced)
        if (!firstName || !lastName) {
            setError('Nombre y Apellidos son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            const patientFormData: PatientFormData = {
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth || null,
                phone_number: phoneNumber || null,
                email: email || null,
                address: address || null,
                orthodontic_stage_notes: orthodonticStageNotes || null,
                allow_whatsapp_reminders: allowWhatsappReminders,
            };

            const result = await addPatient(patientFormData);

            if (result.error) {
                setError(`Error al agregar paciente: ${result.error.message}`);
            } else {
                setMessage('Paciente agregado exitosamente. Redirigiendo...');
                // Clear form
                setFirstName('');
                setLastName('');
                setDateOfBirth('');
                setPhoneNumber('');
                setEmail('');
                setAddress('');
                setOrthodonticStageNotes('');

                // Optionally, redirect after a short delay or immediately
                // router.push('/pacientes'); // Redirect to patient list
                // router.refresh(); // Ensure data is fresh if staying on a page that needs it

                // For now, let's redirect to the main patients list page after a short delay
                // to allow the user to see the success message.
                setTimeout(() => {
                    router.push('/pacientes'); // Assuming /pacientes will be the list page
                }, 2000);
            }
        } catch (e: any) {
            setError('Ocurrió un error inesperado en el cliente. Por favor, intente de nuevo.');
            console.error("Client-side submit error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Agregar Nuevo Paciente</CardTitle>
                    <CardDescription>Complete los datos del nuevo paciente.</CardDescription>
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

                        <div className="flex items-center space-x-2">
                            <Checkbox id="allowWhatsappReminders" checked={allowWhatsappReminders} onCheckedChange={(checked) => setAllowWhatsappReminders(checked as boolean)} disabled={loading} />
                            <label htmlFor="allowWhatsappReminders" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Permitir recordatorios por WhatsApp
                            </label>
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

                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Paciente'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
