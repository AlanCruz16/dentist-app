'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PaymentData {
    service_description: string | null;
    amount_paid: number;
}

interface ServiceBreakdownReportProps {
    data: PaymentData[];
}

// A simple color generator for the pie chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF195E'];

export default function ServiceBreakdownReport({ data }: ServiceBreakdownReportProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Desglose de Servicios</CardTitle>
                    <CardDescription>No hay datos de pagos para mostrar.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-gray-500">
                    <p>No hay datos disponibles.</p>
                </CardContent>
            </Card>
        );
    }

    // Aggregate data: group by service_description and sum the amounts
    const aggregatedData = data.reduce((acc, payment) => {
        const service = payment.service_description || 'Sin descripción';
        if (!acc[service]) {
            acc[service] = 0;
        }
        acc[service] += payment.amount_paid;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(aggregatedData).map(service => ({
        name: service,
        value: aggregatedData[service],
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Desglose de Ingresos por Servicio</CardTitle>
                <CardDescription>Muestra qué servicios están generando más ingresos.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
