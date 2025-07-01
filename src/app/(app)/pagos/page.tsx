import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { RegisterPaymentForm } from '@/components/pagos/RegisterPaymentForm';

// The Payment type will be inferred from the data, removing the need for a static interface here.

export default async function PagosPage() {
    const supabase = await createSupabaseServerClient();

    const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
            id,
            payment_date,
            amount_paid,
            payment_method,
            service_description,
            notes,
            patient:patients (
                first_name,
                last_name
            )
        `)
        .order('payment_date', { ascending: false });

    const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .is('deleted_at', null)
        .order('last_name', { ascending: true });

    if (paymentsError || patientsError) {
        console.error('Error fetching data:', paymentsError || patientsError);
        // Handle error appropriately
        return <p>Error al cargar los datos.</p>;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    const translatePaymentMethod = (method: string) => {
        switch (method) {
            case 'cash': return 'Efectivo';
            case 'card': return 'Tarjeta';
            case 'transfer': return 'Transferencia';
            case 'insurance': return 'Seguro';
            default: return method;
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Historial de Pagos</h1>
                <RegisterPaymentForm patients={patients || []} />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Servicio/Descripción</TableHead>
                        <TableHead>Notas</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments?.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell>
                                {payment.patient && Array.isArray(payment.patient) && payment.patient.length > 0
                                    ? `${payment.patient[0].first_name} ${payment.patient[0].last_name}`
                                    : payment.patient && !Array.isArray(payment.patient)
                                        ? `${(payment.patient as any).first_name} ${(payment.patient as any).last_name}`
                                        : 'Paciente no encontrado'}
                            </TableCell>
                            <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                            <TableCell>{translatePaymentMethod(payment.payment_method)}</TableCell>
                            <TableCell>{payment.service_description || 'N/A'}</TableCell>
                            <TableCell>{payment.notes || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
