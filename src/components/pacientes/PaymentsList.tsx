'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// This type should be moved to a shared types file later
interface Payment {
    id: string;
    payment_date: string;
    amount_paid: number;
    payment_method: 'cash' | 'card' | 'transfer' | 'insurance';
    service_description: string | null;
    notes: string | null;
}

// Patient data is needed for the receipt
interface Patient {
    first_name: string | null;
    last_name: string | null;
}

interface PaymentsListProps {
    payments: Payment[];
    patient: Patient; // Pass patient data down
}

export function PaymentsList({ payments, patient }: PaymentsListProps) {
    const handleGenerateReceipt = (paymentId: string) => {
        window.open(`/recibo/${paymentId}`, '_blank');
    };

    if (!payments || payments.length === 0) {
        return <p className="text-center text-gray-500 mt-4">No hay pagos registrados para este paciente.</p>;
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
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Historial de Pagos</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Servicio/Descripción</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                            <TableCell>{translatePaymentMethod(payment.payment_method)}</TableCell>
                            <TableCell>{payment.service_description || 'N/A'}</TableCell>
                            <TableCell>{payment.notes || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGenerateReceipt(payment.id)}
                                >
                                    Recibo
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
