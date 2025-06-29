'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { addPayment } from '@/app/pacientes/actions';

// Zod schema for validation
const paymentSchema = z.object({
    amount_paid: z.coerce.number().positive({ message: 'El monto debe ser positivo.' }),
    payment_date: z.string().nonempty({ message: 'La fecha es obligatoria.' }),
    payment_method: z.enum(['cash', 'card', 'transfer', 'insurance']),
    service_description: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormInputs = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
    patientId: string;
}

export function PaymentForm({ patientId }: PaymentFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PaymentFormInputs>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            payment_date: new Date().toISOString().split('T')[0], // Today's date
            payment_method: 'cash',
        },
    });

    const onSubmit: SubmitHandler<PaymentFormInputs> = async (data) => {
        const paymentData = {
            ...data,
            patient_id: patientId,
        };

        const result = await addPayment(paymentData);

        if (result.error) {
            // Here you would handle the error, e.g., show a toast notification
            alert(`Error: ${result.error.message}`);
        } else {
            // Success, close the dialog and reset form
            reset();
            setIsOpen(false);
            // Optionally, show a success message
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Registrar Pago</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount_paid" className="text-right">
                                Monto
                            </Label>
                            <Input id="amount_paid" type="number" step="0.01" {...register('amount_paid')} className="col-span-3" />
                            {errors.amount_paid && <p className="col-span-4 text-red-500 text-xs">{errors.amount_paid.message}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payment_date" className="text-right">
                                Fecha
                            </Label>
                            <Input id="payment_date" type="date" {...register('payment_date')} className="col-span-3" />
                            {errors.payment_date && <p className="col-span-4 text-red-500 text-xs">{errors.payment_date.message}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payment_method" className="text-right">
                                Método
                            </Label>
                            <select id="payment_method" {...register('payment_method')} className="col-span-3 border rounded p-2">
                                <option value="cash">Efectivo</option>
                                <option value="card">Tarjeta</option>
                                <option value="transfer">Transferencia</option>
                                <option value="insurance">Seguro</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service_description" className="text-right">
                                Servicio
                            </Label>
                            <Input id="service_description" {...register('service_description')} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notas
                            </Label>
                            <Textarea id="notes" {...register('notes')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Pago'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
