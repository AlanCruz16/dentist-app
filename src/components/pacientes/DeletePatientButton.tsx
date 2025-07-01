'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deletePatient } from '@/app/(app)/pacientes/actions'; // Server action

interface DeletePatientButtonProps {
    patientId: string;
    patientName: string; // For the confirmation message
    onDelete?: () => void; // Optional callback after successful deletion
}

export default function DeletePatientButton({ patientId, patientName, onDelete }: DeletePatientButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const [isDialogOpen, setIsDialogOpen] = useState(false); // If manual control is needed

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await deletePatient(patientId);
            if (result.error) {
                setError(result.error.message);
                // Potentially show a toast notification here for the error
                console.error("Error deleting patient:", result.error.message);
            } else {
                // Successfully deleted (soft delete)
                if (onDelete) {
                    onDelete();
                }
                // Re-routing or refreshing will be handled by revalidatePath in server action
                // and potentially by parent component if needed.
                // For now, let's push to the main patients list.
                router.push('/pacientes');
                router.refresh(); // Ensure the list is updated if user navigates back or stays
            }
        } catch (e) {
            setError('Ocurrió un error inesperado.');
            console.error("Client-side error during delete:", e);
        } finally {
            setIsLoading(false);
            // setIsDialogOpen(false); // Close dialog if manually controlled
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro de que desea eliminar a {patientName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción marcará al paciente como eliminado y no se podrá deshacer fácilmente.
                        Los datos del paciente se conservarán para fines de auditoría pero no serán visibles en las listas activas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-sm text-red-500 py-2">Error: {error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                        {isLoading ? 'Eliminando...' : 'Sí, eliminar paciente'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
