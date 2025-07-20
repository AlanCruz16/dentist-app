'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAppointmentsForWeek, createClient } from '@/lib/supabase/client';
import AppointmentFormModal from '@/components/agenda/AppointmentFormModal';
import BlockTimeModal from '@/components/agenda/BlockTimeModal';
import AppointmentDetailModal from '@/components/agenda/AppointmentDetailModal';
import { Button } from '@/components/ui/button';

// Define an interface for the appointment data, including nested patient and doctor
interface Appointment {
    id: string;
    type: 'appointment'; // To distinguish from blocked times
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

interface BlockedTime {
    id: string;
    type: 'blocked'; // To distinguish from appointments
    start_time: string;
    end_time: string;
    reason: string | null;
    doctor: { // Assuming blocked times can also be linked to a doctor
        id: string;
        full_name: string | null;
    } | null;
}

type CalendarEvent = Appointment | BlockedTime;

// Helper function to get the start of the week (Monday)
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date()); // Represents any day in the current week
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
    const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
    const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);
    const [currentDoctorName, setCurrentDoctorName] = useState<string | null>(null);
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const timeSlots = [];
    for (let i = 8; i < 19; i++) {
        timeSlots.push(`${String(i).padStart(2, '0')}:00`);
        timeSlots.push(`${String(i).padStart(2, '0')}:30`);
    }
    timeSlots.push('19:00');


    const fetchCalendarEvents = useCallback(async () => {
        const startOfWeek = getStartOfWeek(currentDate);
        startOfWeek.setHours(0, 0, 0, 0);

        // Update week dates
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        setWeekDates(dates);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(0, 0, 0, 0);

        try {
            // getAppointmentsForWeek now returns an object { appointments: [], blockedTimes: [], error: null }
            const result = await getAppointmentsForWeek(startOfWeek.toISOString(), endOfWeek.toISOString());
            if (result.error) {
                console.error("Failed to fetch calendar events:", result.error);
                setAppointments([]);
                setBlockedTimes([]);
            } else {
                setAppointments(result.appointments as Appointment[]); // Cast as Appointment[]
                setBlockedTimes(result.blockedTimes as BlockedTime[]); // Cast as BlockedTime[]
            }
        } catch (error) {
            console.error("Exception while fetching calendar events:", error);
            setAppointments([]);
            setBlockedTimes([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        const supabase = createClient();
        const fetchUserAndCalendarEvents = async () => {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentDoctorId(session.user.id);
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching doctor profile:', profileError);
                } else if (profile) {
                    setCurrentDoctorName(profile.full_name);
                } else {
                    // Fallback if full_name is not in profiles, or user has no profile entry yet
                    setCurrentDoctorName(session.user.email || 'Doctor');
                }
            } else {
                console.warn("No active session found.");
            }
            await fetchCalendarEvents();
        };

        fetchUserAndCalendarEvents();
    }, [fetchCalendarEvents]);

    const handlePreviousWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 7);
            return newDate;
        });
    };

    const handleNextWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + 7);
            return newDate;
        });
    };

    const handleOpenAppointmentModal = (dayIndex: number, time: string) => {
        const startOfWeek = getStartOfWeek(currentDate);
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        setSelectedSlotDate(slotDate);
        setSelectedSlotTime(time);
        setIsAppointmentModalOpen(true);
    };

    const handleCloseAppointmentModal = () => {
        setIsAppointmentModalOpen(false);
        setSelectedSlotDate(null); // Clear selection when closing
        setSelectedSlotTime(null);
    };

    const handleOpenBlockTimeModal = () => {
        setIsBlockTimeModalOpen(true);
    };

    const handleCloseBlockTimeModal = () => {
        setIsBlockTimeModalOpen(false);
    };

    const handleOpenDetailModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleEventCreated = () => { // Generic handler for both appointment and blocked time creation
        handleCloseAppointmentModal();
        handleCloseBlockTimeModal();
        fetchCalendarEvents(); // Refresh the agenda
    };

    const getEventsForSlot = (dayIndex: number, time: string): CalendarEvent[] => {
        const startOfWeek = getStartOfWeek(currentDate);
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        const [hour, minute] = time.split(':').map(Number);

        const slotAppointments = appointments.filter(app => {
            const appStartDate = new Date(app.start_time);
            return appStartDate.getFullYear() === slotDate.getFullYear() &&
                appStartDate.getMonth() === slotDate.getMonth() &&
                appStartDate.getDate() === slotDate.getDate() &&
                appStartDate.getHours() === hour &&
                appStartDate.getMinutes() === minute;
        });

        const slotBlockedTimes = blockedTimes.filter(bt => {
            const btStartDate = new Date(bt.start_time);
            // A blocked time is for the current doctor if the doctor object exists and the ID matches.
            const isForCurrentDoctor = bt.doctor && bt.doctor.id === currentDoctorId;

            const isSameDay = btStartDate.getFullYear() === slotDate.getFullYear() &&
                btStartDate.getMonth() === slotDate.getMonth() &&
                btStartDate.getDate() === slotDate.getDate();
            const isSameTime = btStartDate.getHours() === hour && btStartDate.getMinutes() === minute;

            return isSameDay && isSameTime && isForCurrentDoctor;
        });

        return [...slotAppointments, ...slotBlockedTimes].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    };

    const isSlotOccupied = (dayIndex: number, time: string): boolean => {
        const startOfWeek = getStartOfWeek(currentDate);
        const slotDateTime = new Date(startOfWeek);
        slotDateTime.setDate(startOfWeek.getDate() + dayIndex);
        const [hour, minute] = time.split(':').map(Number);
        slotDateTime.setHours(hour, minute, 0, 0);

        const occupiedByAppointment = appointments.some(app => {
            const appStart = new Date(app.start_time);
            const appEnd = new Date(app.end_time);
            return slotDateTime >= appStart && slotDateTime < appEnd;
        });

        const occupiedByBlock = blockedTimes.some(bt => {
            const btStart = new Date(bt.start_time);
            const btEnd = new Date(bt.end_time);
            // A slot is occupied by a block if the doctor object exists and the ID matches.
            const isForCurrentDoctor = bt.doctor && bt.doctor.id === currentDoctorId;
            return slotDateTime >= btStart && slotDateTime < btEnd && isForCurrentDoctor;
        });

        return occupiedByAppointment || occupiedByBlock;
    };

    const formatWeekDisplay = (date: Date): string => {
        const startOfWeek = getStartOfWeek(new Date(date));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
        return `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}, ${startOfWeek.getFullYear()}`;
    };


    return (
        <div className="container mx-auto p-6 bg-background">
            <h1 className="text-3xl font-bold mb-8">Agenda</h1>

            <div className="mb-6 flex justify-between items-center">
                <Button onClick={handlePreviousWeek} variant="outline">
                    {'< Semana Anterior'}
                </Button>
                <h2 className="text-xl font-semibold">{formatWeekDisplay(currentDate)}</h2>
                <Button onClick={handleNextWeek} variant="outline">
                    {'Semana Siguiente >'}
                </Button>
            </div>

            <div className="mb-6 text-right">
                <Button onClick={handleOpenBlockTimeModal}>Bloquear Horario</Button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Cargando agenda...</div>
            ) : (
                <div className="grid grid-cols-8 border border-border bg-card rounded-lg shadow-sm relative">
                    <div className="p-3 border-r border-b border-border font-semibold bg-muted text-center sticky top-0 z-10">Hora</div>
                    {daysOfWeek.map((day, index) => (
                        <div
                            key={day}
                            className="p-3 border-r border-b border-border font-semibold bg-muted text-center sticky top-0 z-10"
                        >
                            {day}
                            {weekDates[index] && (
                                <span className="block font-normal text-sm">
                                    {weekDates[index].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                </span>
                            )}
                        </div>
                    ))}

                    {timeSlots.map((time) => (
                        <React.Fragment key={time}>
                            <div className={`p-3 border-r border-b border-border font-semibold bg-muted text-center h-12 flex items-center justify-center text-sm ${!time.endsWith(':00') && 'text-muted-foreground'}`}>
                                {time}
                            </div>
                            {daysOfWeek.map((day, dayIndex) => {
                                const eventsForThisSlot = getEventsForSlot(dayIndex, time);
                                const isOccupied = isSlotOccupied(dayIndex, time);
                                const isBlockedByEvent = eventsForThisSlot.some(e => e.type === 'blocked');

                                // A slot is truly blocked if it's occupied by a block event for the current doctor.
                                const isClickable = !isOccupied && !isBlockedByEvent;

                                return (
                                    <div
                                        key={`${day}-${time}`}
                                        className={`relative p-1 border-r border-b border-border h-12 text-xs ${isBlockedByEvent ? 'bg-destructive/20 cursor-not-allowed' : ''
                                            } ${isClickable ? 'hover:bg-accent cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (isClickable) {
                                                handleOpenAppointmentModal(dayIndex, time);
                                            }
                                        }}
                                    >
                                        {eventsForThisSlot.map(event => {
                                            const start = new Date(event.start_time);
                                            const end = new Date(event.end_time);
                                            const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                                            const height = (durationInMinutes / 30) * 48; // 48px per 30-min slot (h-12)

                                            if (event.type === 'appointment') {
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="absolute z-20 w-[calc(100%-0.5rem)] p-2 rounded-lg shadow-md cursor-pointer flex flex-col items-center justify-center text-center box-border bg-primary"
                                                        style={{
                                                            height: `${height}px`,
                                                            top: `0px`, // Position relative to the start slot
                                                            //backgroundColor: 'oklch(0.7 0.2 50)'
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(event); }}
                                                    >
                                                        <p className="font-bold text-white">{event.patient?.first_name} {event.patient?.last_name}</p>
                                                        <p className="text-white/90">{event.service_description || 'Cita'}</p>
                                                    </div>
                                                );
                                            } else if (event.type === 'blocked') {
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="absolute z-20 w-[calc(100%-0.5rem)] bg-destructive/80 p-2 rounded-lg shadow-md text-center box-border"
                                                        style={{
                                                            height: `${height}px`,
                                                            top: `0px` // Position relative to the start slot
                                                        }}
                                                    >
                                                        <p className="font-bold text-destructive-foreground">BLOQUEADO</p>
                                                        {event.reason && <p className="text-xs text-destructive-foreground/90">{event.reason}</p>}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            )}
            <p className="mt-6 text-sm text-muted-foreground">
                Haga clic en un espacio vacío para agendar una nueva cita o use el botón para bloquear un horario.
            </p>

            <AppointmentFormModal
                isOpen={isAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                selectedDate={selectedSlotDate}
                selectedTime={selectedSlotTime}
                onAppointmentCreated={handleEventCreated}
                currentDoctorId={currentDoctorId}
                currentDoctorName={currentDoctorName}
            />

            <BlockTimeModal
                isOpen={isBlockTimeModalOpen}
                onClose={handleCloseBlockTimeModal}
                onTimeBlocked={handleEventCreated}
                currentDoctorId={currentDoctorId}
                currentDoctorName={currentDoctorName}
            />

            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                appointment={selectedAppointment}
            />
        </div>
    );
}
