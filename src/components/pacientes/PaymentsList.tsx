'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import Receipt from './Receipt'; // The component we just created
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
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReceipt = async (payment: Payment) => {
        setSelectedPayment(payment);
        setIsGenerating(true);

        // We need a slight delay to allow React to render the hidden receipt component
        setTimeout(async () => {
            const receiptElement = document.getElementById('receipt-to-print');
            if (!receiptElement) {
                console.error('Receipt element not found!');
                setIsGenerating(false);
                setSelectedPayment(null);
                return;
            }

            const canvas = await html2canvas(receiptElement, { scale: 2 }); // Higher scale for better quality
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter', // Standard letter size
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`recibo-${patient.first_name}-${payment.id.substring(0, 6)}.pdf`);

            // Clean up after generation
            setIsGenerating(false);
            setSelectedPayment(null);
        }, 100);
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
                                    onClick={() => handleGenerateReceipt(payment)}
                                    disabled={isGenerating}
                                >
                                    {isGenerating && selectedPayment?.id === payment.id ? 'Generando...' : 'Recibo'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Hidden container for the receipt component to be rendered for PDF generation */}
            <div className="absolute -left-[9999px] top-auto">
                <Receipt payment={selectedPayment} patient={patient} />
            </div>
        </div>
    );
}
