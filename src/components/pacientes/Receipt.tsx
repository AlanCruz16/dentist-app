import React from 'react';

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
    if (!payment || !patient) {
        return null; // Don't render if essential data is missing
    }

    const patientFullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
    const paymentDate = new Date(payment.payment_date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div id="receipt-to-print" className="p-8 bg-white text-black font-sans text-sm max-w-2xl mx-auto border-2 border-gray-300 rounded-lg">
            {/* Clinic Header */}
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600">{clinicName}</h1>
                <p className="text-gray-600">{clinicAddress}</p>
                <p className="text-gray-600">Tel: {clinicPhone}</p>
            </header>

            {/* Receipt Details */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-gray-400">
                <div>
                    <h2 className="text-xl font-semibold">Recibo de Pago</h2>
                    <p className="text-gray-500">ID de Recibo: <span className="font-mono">{payment.id.substring(0, 8)}</span></p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Fecha</p>
                    <p>{paymentDate}</p>
                </div>
            </div>

            {/* Patient Information */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Paciente</h3>
                <p className="text-lg">{patientFullName}</p>
            </div>

            {/* Payment Details Table */}
            <table className="w-full mb-8">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Descripción del Servicio</th>
                        <th className="p-3 text-right font-semibold text-gray-700">Monto Pagado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="p-3">{payment.service_description || 'N/A'}</td>
                        <td className="p-3 text-right font-mono text-lg">${payment.amount_paid.toFixed(2)} MXN</td>
                    </tr>
                </tbody>
            </table>

            {/* Total Section */}
            <div className="flex justify-end mb-10">
                <div className="w-1/2">
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total Pagado:</span>
                        <span>${payment.amount_paid.toFixed(2)} MXN</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-xs pt-4 border-t border-gray-300">
                <p>Gracias por su pago. ¡Le deseamos una excelente salud dental!</p>
                <p className="mt-1">Este recibo es un comprobante de pago y no tiene validez fiscal.</p>
            </footer>
        </div>
    );
};

export default Receipt;
