import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    start_time: string;
    patient: {
        first_name: string | null;
        last_name: string | null;
    } | null;
}

interface TodaysAppointmentsCardProps {
    appointments: Appointment[];
}

export default function TodaysAppointmentsCard({ appointments }: TodaysAppointmentsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Próximas Citas en la Semana</CardTitle>
            </CardHeader>
            <CardContent>
                {appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-right">
                                    <p>{new Date(appointment.start_time).toLocaleDateString([], { weekday: 'long' })}</p>
                                    <p>{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No hay próximas citas en la semana.</p>
                )}
            </CardContent>
        </Card>
    );
}
