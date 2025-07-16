import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Patient {
    id: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
}

interface RecentPatientsCardProps {
    patients: Patient[];
}

export default function RecentPatientsCard({ patients }: RecentPatientsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pacientes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                {patients.length > 0 ? (
                    <ul className="space-y-4">
                        {patients.map((patient) => (
                            <li key={patient.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div>
                                    <p className="font-semibold">{patient.first_name} {patient.last_name}</p>
                                    <p className="text-sm text-muted-foreground">Registrado el {new Date(patient.created_at).toLocaleDateString()}</p>
                                </div>
                                <Link href={`/pacientes/${patient.id}`} passHref>
                                    <Button variant="outline" size="sm">Ver</Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No hay pacientes registrados recientemente.</p>
                )}
            </CardContent>
        </Card>
    );
}
