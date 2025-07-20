'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client'; // Ensure this client is imported for patient search
import { createAppointment } from '@/app/(app)/agenda/actions'; // Import the server action

interface Patient {
    id: string;
    first_name: string | null;
    last_name: string | null;
    // Add other relevant patient fields if needed for display or search
}

interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null; // Date object for the selected day
    selectedTime: string | null; // e.g., "09:00"
    onAppointmentCreated: () => void; // Callback to refresh agenda
    currentDoctorId: string | null;
    currentDoctorName: string | null;
}

export default function AppointmentFormModal({
    isOpen,
    onClose,
    selectedDate,
    selectedTime,
    onAppointmentCreated,
    currentDoctorId,
    currentDoctorName,
}: AppointmentFormModalProps) {
    const [patientId, setPatientId] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [duration, setDuration] = useState(30); // Default duration 30 minutes
    const [notes, setNotes] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState('weekly'); // e.g., 'weekly', 'monthly'
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    // const supabase = createClient(); // Not needed directly for patient search if we make it a server component or use a route handler

    useEffect(() => {
        if (!isOpen) {
            // Reset form fields when modal closes
            setPatientId('');
            setServiceDescription('');
            setDuration(30); // Reset duration
            setNotes('');
            setIsRecurring(false);
            setRecurrenceRule('weekly');
            setSearchTerm('');
            setSelectedPatientName('');
            setPatients([]);
            setIsLoading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        // For patient search, we still need a client-side Supabase instance
        // or we'd need to create a separate server action/route handler for patient search.
        // For simplicity in this step, let's keep client-side search.
        // If this becomes an issue or for more robust search, a dedicated endpoint is better.
        if (searchTerm.length > 2) {
            const supabaseClient = createClient(); // Local instance for search
            const fetchPatients = async () => {
                const { data, error } = await supabaseClient
                    .from('patients')
                    .select('id, first_name, last_name')
                    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
                    .limit(10);
                if (error) {
                    console.error('Error fetching patients:', error);
                    setPatients([]);
                } else {
                    setPatients(data || []);
                }
            };
            fetchPatients();
        } else {
            setPatients([]);
        }
    }, [searchTerm]); // Removed supabase from dependencies as it's created locally

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !patientId) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        setIsLoading(true);

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const localDate = new Date(selectedDate);
        localDate.setHours(hours, minutes, 0, 0);

        // Manually construct ISO string with timezone offset
        const timezoneOffset = localDate.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0');
        const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
        const offsetSign = timezoneOffset <= 0 ? '+' : '-';
        const timezoneString = `${offsetSign}${offsetHours}:${offsetMinutes}`;

        const startTime = new Date(localDate.getTime() - (timezoneOffset * 60000));
        const startTimeISO = startTime.toISOString().slice(0, -1) + timezoneString;

        const endTime = new Date(localDate.getTime() + duration * 60000);
        const endTimeISO = new Date(endTime.getTime() - (timezoneOffset * 60000)).toISOString().slice(0, -1) + timezoneString;

        if (!currentDoctorId) {
            alert('Error: No se pudo identificar al doctor. Por favor, inicie sesión nuevamente.');
            setIsLoading(false);
            return;
        }

        const appointmentData = {
            patient_id: patientId,
            doctor_id: currentDoctorId,
            start_time: startTimeISO,
            end_time: endTimeISO,
            service_description: serviceDescription,
            notes: notes,
            is_recurring: isRecurring,
            recurrence_rule: isRecurring ? recurrenceRule : null,
        };

        const result = await createAppointment(appointmentData);

        setIsLoading(false);
        if (result.error) {
            console.error('Error creating appointment:', result.error);
            alert(`Error al crear la cita: ${result.error.message}`);
        } else {
            alert('Cita creada exitosamente!');
            onAppointmentCreated(); // This will trigger re-fetch in AgendaPage due to revalidatePath
            onClose();
        }
    };

    const handlePatientSelect = (patient: Patient) => {
        setPatientId(patient.id);
        setSelectedPatientName(`${patient.first_name || ''} ${patient.last_name || ''}`);
        setSearchTerm(`${patient.first_name || ''} ${patient.last_name || ''}`);
        setPatients([]); // Clear search results
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>
                        Agendar Nueva Cita
                        {currentDoctorName && (
                            <span className="block text-xs font-normal text-muted-foreground mt-1">Doctor: {currentDoctorName}</span>
                        )}
                        {selectedDate && selectedTime && (
                            <span className="block text-sm font-normal text-muted-foreground mt-1">
                                Para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {selectedTime}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="patient-search">Buscar Paciente</Label>
                        <Input
                            id="patient-search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (patientId && e.target.value !== selectedPatientName) {
                                    setPatientId(''); // Clear selected patient if search term changes
                                    setSelectedPatientName('');
                                }
                            }}
                            placeholder="Escriba para buscar..."
                            disabled={!!patientId && searchTerm === selectedPatientName}
                            className="bg-input text-foreground"
                        />
                        {patientId && searchTerm === selectedPatientName && (
                            <Button variant="link" size="sm" onClick={() => { setPatientId(''); setSearchTerm(''); setSelectedPatientName(''); }} className="p-0 h-auto text-primary">Limpiar selección</Button>
                        )}
                        {patients.length > 0 && (
                            <ul className="border border-border rounded-md mt-2 max-h-40 overflow-y-auto bg-card">
                                {patients.map((p) => (
                                    <li
                                        key={p.id}
                                        onClick={() => handlePatientSelect(p)}
                                        className="p-3 hover:bg-accent cursor-pointer"
                                    >
                                        {p.first_name} {p.last_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="service">Servicio/Motivo</Label>
                        <Input
                            id="service"
                            value={serviceDescription}
                            onChange={(e) => setServiceDescription(e.target.value)}
                            placeholder="Ej: Consulta de ortodoncia"
                            required
                            className="bg-input text-foreground"
                        />
                    </div>

                    <div>
                        <Label htmlFor="duration">Duración (minutos)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            required
                            min="30"
                            step="30"
                            className="bg-input text-foreground"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is-recurring"
                                checked={isRecurring}
                                onCheckedChange={(checked: boolean | 'indeterminate') =>
                                    setIsRecurring(checked === true)
                                }
                            />
                            <Label htmlFor="is-recurring" className="font-medium">
                                Repetir Cita
                            </Label>
                        </div>
                        {isRecurring && (
                            <div>
                                <Label htmlFor="recurrence-rule">Frecuencia</Label>
                                <Select
                                    value={recurrenceRule}
                                    onValueChange={setRecurrenceRule}
                                >
                                    <SelectTrigger id="recurrence-rule">
                                        <SelectValue placeholder="Seleccione frecuencia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="bi-weekly">Quincenal</SelectItem>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas opcionales sobre la cita..."
                            className="bg-input text-foreground"
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading || !patientId}>
                            {isLoading ? 'Agendando...' : 'Agendar Cita'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
