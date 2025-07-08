import React, { useState, useEffect } from 'react';

// Define types for the data to be displayed on the receipt
interface Payment {
    id: string;
    payment_date: string;
    amount_paid: number;
    service_description: string | null;
}

interface Patient {
    first_name: string | null;
    last_name: string | null;
}

interface ReceiptProps {
    payment: Payment | null;
    patient: Patient | null;
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
}

const Receipt: React.FC<ReceiptProps> = ({
    payment,
    patient,
    clinicName = "OrthoSmile Dental",
    clinicAddress = "Av. Siempre Viva 123, Springfield",
    clinicPhone = "555-123-4567",
}) => {
    const [displayDate, setDisplayDate] = useState('');

    useEffect(() => {
        // This code runs only on the client, after hydration, preventing a mismatch.
        if (payment) {
            const formattedDate = new Date(payment.payment_date).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            setDisplayDate(formattedDate);
        }
    }, [payment]);

    if (!payment || !patient) {
        return null; // Don't render if essential data is missing
    }

    const patientFullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

    return (
        <div
            id="receipt-to-print"
            className="bg-white text-black font-mono text-xs"
            style={{ width: '302px', padding: '20px' }} // Standard 80mm thermal paper width
        >
            {/* Clinic Header */}
            <header className="text-center mb-4">
                <h1 className="text-lg font-bold uppercase">{clinicName}</h1>
                <p>{clinicAddress}</p>
                <p>Tel: {clinicPhone}</p>
            </header>

            <div className="border-t border-b border-dashed border-black my-2 py-1">
                <div className="flex justify-between">
                    <span>ID Recibo:</span>
                    <span>{payment.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{displayDate}</span>
                </div>
            </div>

            {/* Patient Information */}
            <div className="my-2">
                <h2 className="font-bold text-center uppercase">Paciente</h2>
                <p className="text-center">{patientFullName}</p>
            </div>

            {/* Payment Details Table */}
            <div className="border-t border-dashed border-black pt-2 mt-2">
                <div className="flex justify-between font-bold">
                    <span>Descripción</span>
                    <span>Monto</span>
                </div>
                <div className="flex justify-between items-start mt-1">
                    <span className="pr-2 break-words w-3/4">{payment.service_description || 'N/A'}</span>
                    <span className="text-right w-1/4">${payment.amount_paid.toFixed(2)}</span>
                </div>
            </div>

            {/* Total Section */}
            <div className="border-t border-black mt-4 pt-2 text-sm">
                <div className="flex justify-between font-bold">
                    <span>TOTAL PAGADO:</span>
                    <span>${payment.amount_paid.toFixed(2)} MXN</span>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-xs mt-6">
                <p>Gracias por su pago.</p>
                <p className="mt-2">Este recibo no tiene validez fiscal.</p>
            </footer>
        </div>
    );
};

export default Receipt;
