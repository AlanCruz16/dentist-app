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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createBlockedTime } from '@/app/(app)/agenda/actions'; // Server action

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
    const getFormattedTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = date.getMinutes();
        // Round down to the nearest 30-minute interval
        const roundedMinutes = minutes < 30 ? '00' : '30';
        return `${hours}:${roundedMinutes}`;
    };

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const timeSlots = [];
    for (let i = 8; i < 19; i++) {
        timeSlots.push(`${String(i).padStart(2, '0')}:00`);
        timeSlots.push(`${String(i).padStart(2, '0')}:30`);
    }
    timeSlots.push('19:00');

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
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>Bloquear Tiempo en Agenda</DialogTitle>
                    {currentDoctorName && (
                        <p className="text-sm text-muted-foreground">
                            Para: Dr. {currentDoctorName}
                        </p>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start-date">Fecha Inicio</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="bg-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="start-time">Hora Inicio</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger id="start-time" className="bg-input text-foreground">
                                    <SelectValue placeholder="Seleccione hora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map(time => (
                                        <SelectItem key={`start-${time}`} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                className="bg-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-time">Hora Fin</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger id="end-time" className="bg-input text-foreground">
                                    <SelectValue placeholder="Seleccione hora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map(time => (
                                        <SelectItem key={`end-${time}`} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="reason">Motivo (Opcional)</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ej: Vacaciones, Conferencia, etc."
                            className="bg-input text-foreground"
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
