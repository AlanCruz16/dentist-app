import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewPatientsReport } from "@/components/reportes/NewPatientsReport";
import { MonthlyRevenueReport } from "@/components/reportes/MonthlyRevenueReport";

export default async function ReportesPage() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Reportes</h1>
            <div className="grid gap-6 md:grid-cols-2">
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
            </div>
        </div>
    );
}
