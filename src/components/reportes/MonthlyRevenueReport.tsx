import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getMonthlyRevenue } from "@/app/(app)/reportes/actions";

interface MonthlyRevenueData {
    month: string;
    total_revenue: number;
}

export async function MonthlyRevenueReport() {
    const data: MonthlyRevenueData[] = await getMonthlyRevenue();

    if (!data || data.length === 0) {
        return <p>No se encontraron datos de ingresos.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row: MonthlyRevenueData) => (
                    <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.total_revenue)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
