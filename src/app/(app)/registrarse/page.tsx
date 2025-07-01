'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message === 'User already registered' ? 'Este correo electrónico ya está registrado.' : 'Ocurrió un error al registrar la cuenta. Por favor, intente más tarde.');
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            // This case might indicate that email confirmation is required but the user already exists (though unconfirmed)
            // Supabase might return a user object with an empty identities array if "Confirm email" is enabled and the user signs up again.
            setError('Este correo electrónico ya está registrado pero no confirmado. Revise su bandeja de entrada para el correo de confirmación.');
        } else if (data.user) {
            // Handle case where "Confirm email" is OFF in Supabase settings
            // Or if "Confirm email" is ON and this is a successful new signup (email sent)
            if (data.session) { // User is immediately logged in
                router.push('/');
                router.refresh();
            } else { // Email confirmation required
                setMessage('¡Registro exitoso! Por favor, revise su correo electrónico para confirmar su cuenta.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Complete el formulario para registrarse.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="•••••••• (mínimo 6 caracteres)"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        )}
                        {message && (
                            <p className="text-sm text-green-600 text-center">{message}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-sm text-center">
                    <p>¿Ya tiene una cuenta? <a href="/iniciar-sesion" className="font-medium text-blue-600 hover:underline">Inicie sesión aquí</a></p>
                </CardFooter>
            </Card>
        </div>
    );
}
