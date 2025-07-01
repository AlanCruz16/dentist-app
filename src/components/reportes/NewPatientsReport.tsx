import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getNewPatientsPerMonth } from "@/app/(app)/reportes/actions";

interface NewPatientData {
    month: string;
    new_patients_count: number;
}

export async function NewPatientsReport() {
    const data: NewPatientData[] = await getNewPatientsPerMonth();

    if (!data || data.length === 0) {
        return <p>No se encontraron datos de nuevos pacientes.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Nuevos Pacientes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row: NewPatientData) => (
                    <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right">{row.new_patients_count}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
