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
import { createBlockedTime } from '@/app/agenda/actions'; // Server action

interface BlockTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTimeBlocked: () => void; // Callback to refresh agenda
    currentDoctorId: string | null;
    currentDoctorName: string | null;
}

export default function BlockTimeModal({
    isOpen,
    onClose,
    onTimeBlocked,
    currentDoctorId,
    currentDoctorName,
}: BlockTimeModalProps) {
    const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];
    const getFormattedTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setStartDate(getFormattedDate(now));
            setStartTime(getFormattedTime(now));
            setEndDate(getFormattedDate(now));
            setEndTime(getFormattedTime(oneHourLater));
            setReason('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentDoctorId || !startDate || !startTime || !endDate || !endTime) {
            alert('Por favor, complete todos los campos de fecha y hora.');
            return;
        }
        setIsLoading(true);

        try {
            const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);

            const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                alert('Formato de fecha u hora inválido.');
                setIsLoading(false);
                return;
            }

            if (endDateTime <= startDateTime) {
                alert('La hora de finalización debe ser posterior a la hora de inicio.');
                setIsLoading(false);
                return;
            }

            const result = await createBlockedTime({
                doctor_id: currentDoctorId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                reason: reason,
            });

            setIsLoading(false);
            if (result.error) {
                console.error('Error blocking time:', result.error);
                alert(`Error al bloquear el tiempo: ${result.error.message}`);
            } else {
                alert('Tiempo bloqueado exitosamente!');
                onTimeBlocked();
                onClose();
            }
        } catch (error) {
            console.error("Error processing date/time for blocking:", error);
            alert("Ocurrió un error al procesar las fechas. Verifique el formato.");
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bloquear Tiempo en Agenda</DialogTitle>
                    {currentDoctorName && (
                        <p className="text-sm text-muted-foreground">
                            Para: Dr. {currentDoctorName} (ID: {currentDoctorId})
                        </p>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start-date">Fecha Inicio</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="start-time">Hora Inicio</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="end-date">Fecha Fin</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-time">Hora Fin</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="reason">Motivo (Opcional)</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ej: Vacaciones, Conferencia, etc."
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Bloqueando...' : 'Bloquear Tiempo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
