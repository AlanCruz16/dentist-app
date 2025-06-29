'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Appointment {
    id: string;
    start_time: string;
    end_time: string;
    service_description: string | null;
    status: string | null;
    notes: string | null;
    patient: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
    doctor: {
        id: string;
        full_name: string | null;
    } | null;
}

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ isOpen, onClose, appointment }) => {
    if (!appointment) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalles de la Cita</DialogTitle>
                    <DialogDescription>
                        Información detallada de la cita seleccionada.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <h3 className="font-semibold">Paciente:</h3>
                        <p>{appointment.patient?.first_name} {appointment.patient?.last_name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Doctor:</h3>
                        <p>{appointment.doctor?.full_name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Fecha y Hora:</h3>
                        <p>{new Date(appointment.start_time).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Servicio:</h3>
                        <p>{appointment.service_description}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Estado:</h3>
                        <p>{appointment.status}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Notas:</h3>
                        <p>{appointment.notes}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentDetailModal;
