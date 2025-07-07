import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewPatientsReport } from "@/components/reportes/NewPatientsReport";
import { MonthlyRevenueReport } from "@/components/reportes/MonthlyRevenueReport";
import ServiceBreakdownReport from "@/components/reportes/ServiceBreakdownReport";
import { getServiceBreakdownData } from "./actions";

async function ServiceBreakdownDataLoader() {
    const data = await getServiceBreakdownData();
    return <ServiceBreakdownReport data={data} />;
}

export default async function ReportesPage() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Reportes</h1>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevos Pacientes por Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<p>Cargando reporte...</p>}>
                            <NewPatientsReport />
                        </Suspense>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Ingresos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<p>Cargando reporte...</p>}>
                            <MonthlyRevenueReport />
                        </Suspense>
                    </CardContent>
                </Card>
                {/* The new report takes the full width on medium screens and half on large screens */}
                <div className="md:col-span-1 lg:col-span-2">
                    <Suspense fallback={<p>Cargando reporte de servicios...</p>}>
                        <ServiceBreakdownDataLoader />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
