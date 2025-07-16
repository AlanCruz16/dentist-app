import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialsCardProps {
    monthlyRevenue: number;
}

export default function FinancialsCard({ monthlyRevenue }: FinancialsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Finanzas del Mes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Ingresos del Mes</p>
                        <p className="font-semibold">${monthlyRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
