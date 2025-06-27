'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAppointmentsForWeek, createClient } from '@/lib/supabase/client';
import AppointmentFormModal from '@/components/agenda/AppointmentFormModal';
import BlockTimeModal from '@/components/agenda/BlockTimeModal'; // Import BlockTimeModal
import { Button } from '@/components/ui/button'; // Import Button for the new modal trigger

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
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false); // Renamed for clarity
    const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false); // State for BlockTimeModal
    const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
    const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
    const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);
    const [currentDoctorName, setCurrentDoctorName] = useState<string | null>(null);

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const timeSlots = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 08:00 to 18:00

    const fetchCalendarEvents = useCallback(async () => {
        const startOfWeek = getStartOfWeek(currentDate);
        startOfWeek.setHours(0, 0, 0, 0);

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

    const handleEventCreated = () => { // Generic handler for both appointment and blocked time creation
        handleCloseAppointmentModal();
        handleCloseBlockTimeModal();
        fetchCalendarEvents(); // Refresh the agenda
    };

    const getEventsForSlot = (dayIndex: number, time: string): CalendarEvent[] => {
        const startOfWeek = getStartOfWeek(currentDate);
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        const [hour] = time.split(':').map(Number);

        const slotAppointments = appointments.filter(app => {
            const appStartDate = new Date(app.start_time);
            return appStartDate.getFullYear() === slotDate.getFullYear() &&
                appStartDate.getMonth() === slotDate.getMonth() &&
                appStartDate.getDate() === slotDate.getDate() &&
                appStartDate.getHours() === hour;
        });

        const slotBlockedTimes = blockedTimes.filter(bt => {
            const btStartDate = new Date(bt.start_time);
            // Assuming blocked times are for the whole hour slot if they start within it
            // More precise overlap logic might be needed if blocked times can be partial hours
            return btStartDate.getFullYear() === slotDate.getFullYear() &&
                btStartDate.getMonth() === slotDate.getMonth() &&
                btStartDate.getDate() === slotDate.getDate() &&
                btStartDate.getHours() === hour;
        });

        return [...slotAppointments, ...slotBlockedTimes].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    };

    const formatWeekDisplay = (date: Date): string => {
        const startOfWeek = getStartOfWeek(new Date(date));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
        return `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}, ${startOfWeek.getFullYear()}`;
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-6 text-center">Agenda Semanal</h1>

            <div className="mb-4 flex justify-between items-center">
                <Button onClick={handlePreviousWeek} variant="outline">
                    {'< Semana Anterior'}
                </Button>
                <h2 className="text-xl font-medium">{formatWeekDisplay(currentDate)}</h2>
                <Button onClick={handleNextWeek} variant="outline">
                    {'Semana Siguiente >'}
                </Button>
            </div>

            <div className="mb-4 text-right">
                <Button onClick={handleOpenBlockTimeModal}>Bloquear Horario</Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Cargando agenda...</div>
            ) : (
                <div className="grid grid-cols-8 border border-gray-300 bg-white">
                    <div className="p-2 border-r border-b border-gray-300 font-medium bg-gray-50 text-center sticky top-0 z-10">Hora</div>
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className="p-2 border-r border-b border-gray-300 font-medium bg-gray-50 text-center sticky top-0 z-10"
                        >
                            {day}
                        </div>
                    ))}

                    {timeSlots.map((time) => (
                        <React.Fragment key={time}>
                            <div className="p-2 border-r border-b border-gray-300 font-medium bg-gray-50 text-center h-28 flex items-center justify-center">
                                {time}
                            </div>
                            {daysOfWeek.map((day, dayIndex) => {
                                const slotEvents = getEventsForSlot(dayIndex, time);
                                const isBlocked = slotEvents.some(event => event.type === 'blocked');

                                return (
                                    <div
                                        key={`${day}-${time}`}
                                        className={`p-1 border-r border-b border-gray-300 h-28 overflow-y-auto text-xs ${isBlocked ? 'bg-red-100 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'
                                            }`}
                                        onClick={() => {
                                            if (!isBlocked && slotEvents.filter(e => e.type === 'appointment').length === 0) {
                                                handleOpenAppointmentModal(dayIndex, time);
                                            }
                                        }}
                                    >
                                        {slotEvents.map(event => {
                                            if (event.type === 'appointment') {
                                                return (
                                                    <div key={event.id} className="bg-blue-100 p-1 rounded mb-1 shadow-sm">
                                                        <p className="font-semibold">{event.patient?.first_name} {event.patient?.last_name}</p>
                                                        <p>{event.service_description || 'Cita'}</p>
                                                    </div>
                                                );
                                            } else if (event.type === 'blocked') {
                                                return (
                                                    <div key={event.id} className="bg-red-200 p-1 rounded mb-1 shadow-sm text-center">
                                                        <p className="font-semibold">BLOQUEADO</p>
                                                        {event.reason && <p className="text-xs">{event.reason}</p>}
                                                        {/* {event.doctor?.full_name && <p className="text-xs text-gray-600">Dr. {event.doctor.full_name}</p>} */}
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
            <p className="mt-4 text-sm text-gray-600">
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
        </div>
    );
}
