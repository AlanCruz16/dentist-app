'use client';

import React from 'react';
import Receipt from '@/components/pacientes/Receipt';

// Re-defining types here, but ideally they should be in a shared file
interface Payment {
    id: string;
    payment_date: string;
    amount_paid: number;
    service_description: string | null;
    patient_id: string;
}

interface Patient {
    first_name: string | null;
    last_name: string | null;
}

interface ReceiptViewProps {
    payment: Payment | null;
    patient: Patient | null;
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ payment, patient }) => {
    if (!payment || !patient) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: No se pudieron cargar los datos del recibo.</div>;
    }

    return (
        <div className="bg-white text-black">
            <div id="receipt-container">
                <Receipt payment={payment} patient={patient} />
            </div>
            <div className="print-hide p-4 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Imprimir Recibo
                </button>
            </div>
            <style jsx global>{`
                @media print {
                    @page {
                        size: 80mm auto; /* Standard thermal printer width, auto height */
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #receipt-container, #receipt-container * {
                        visibility: visible;
                    }
                    #receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .print-hide {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReceiptView;
