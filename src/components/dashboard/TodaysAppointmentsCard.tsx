import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    start_time: string;
    end_time: string;
    service_description: string | null;
    status: string | null;
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

interface TodaysAppointmentsCardProps {
    appointments: Appointment[];
}

export default function TodaysAppointmentsCard({ appointments }: TodaysAppointmentsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Citas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
                {appointments.length > 0 ? (
                    <ul className="space-y-4">
                        {appointments.map((appointment) => (
                            <li key={appointment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div>
                                    <p className="font-semibold">{appointment.patient?.first_name} {appointment.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.service_description}</p>
                                    <p className="text-sm text-muted-foreground">Dr. {appointment.doctor?.full_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm">{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>{appointment.status}</Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No hay citas programadas para hoy.</p>
                )}
            </CardContent>
        </Card>
    );
}
