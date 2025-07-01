'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createAppointmentRequest } from './actions';
import { useActionState, useEffect, useRef } from 'react';
import ServicesCarousel from '@/components/landing/ServicesCarousel';

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    );
}

function ContactForm() {
    const [state, formAction] = useActionState(createAppointmentRequest, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.data) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <div>
                <Label htmlFor="name" className="sr-only">Nombre Completo</Label>
                <Input id="name" name="name" type="text" placeholder="Nombre Completo" required className="bg-white border-gray-300" />
            </div>
            <div>
                <Label htmlFor="phone" className="sr-only">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" placeholder="Teléfono" required className="bg-white border-gray-300" />
            </div>
            <div>
                <Label htmlFor="email" className="sr-only">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="Correo Electrónico (Opcional)" className="bg-white border-gray-300" />
            </div>
            <div>
                <Label htmlFor="message" className="sr-only">Mensaje</Label>
                <Textarea id="message" name="message" placeholder="Mensaje (Opcional)" className="bg-white border-gray-300" />
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-3">Enviar Solicitud</Button>
            {state?.message && <p className="mt-4 text-center text-sm">{state.message}</p>}
        </form>
    );
}

export default function LandingPage() {
    return (
        <div className="bg-gray-100 text-black font-sans">
            {/* Header */}
            <header className="px-4 sm:px-8 py-4 flex justify-between items-center">
                <Button variant="outline" size="icon" className="rounded-full bg-white">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                </Button>
                <div className="text-xl font-semibold">Clínica Dental Sonrisa</div>
                <div className="hidden md:block text-lg font-medium">Tel: (55) 1234-5678</div>
            </header>

            <main className="px-4 sm:px-8 py-8">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    <div className="flex flex-col justify-between space-y-8">
                        <div className="bg-white p-8 rounded-3xl">
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">Una Fusión de Talento y Compasión</h1>
                            <p className="text-lg lg:text-xl mt-4">Ortodoncia Especializada</p>
                            <p className="text-lg lg:text-xl">Ciudad de México</p>
                        </div>
                        <div className="bg-[#F8F1E8] p-8 rounded-3xl">
                            <h2 className="text-2xl lg:text-3xl font-semibold">Un Enfoque Moderno para un Cuidado de Clase Mundial</h2>
                            <div className="flex justify-between items-center mt-4">
                                <a href="#nosotros" className="text-lg hover:underline">Conócenos &rarr;</a>
                                <Button asChild>
                                    <a href="#contacto" className="bg-black text-white rounded-full px-6 py-3 hover:bg-gray-800">Agenda una Cita</a>
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <Image
                                src="/images/landing/hero2.jpg"
                                alt="Consultorio dental"
                                width={400}
                                height={266}
                                className="rounded-3xl object-cover w-full"
                            />
                            <Image
                                src="/images/landing/hero3.jpg"
                                alt="Equipo dental"
                                width={400}
                                height={266}
                                className="rounded-3xl object-cover w-full"
                            />
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                        <Image
                            src="/images/landing/mainheroimage.jpg"
                            alt="Paciente sonriendo"
                            fill
                            className="rounded-3xl object-cover object-top"
                        />
                    </div>
                </div>

                {/* Services Section */}
                <section id="servicios" className="mt-16">
                    <h3 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h3>
                    <ServicesCarousel />
                </section>

                {/* About Us Section */}
                <section id="nosotros" className="mt-16 bg-white/70 p-8 rounded-3xl backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-4">Conoce a la Dra. Ana Pérez</h3>
                            <p className="text-lg mb-4">
                                La Dra. Pérez es una especialista en Ortodoncia con más de 15 años de experiencia, dedicada a crear sonrisas saludables y hermosas. Graduada de la Universidad Nacional, ha continuado su formación en las técnicas más avanzadas para ofrecer el mejor cuidado a sus pacientes.
                            </p>
                        </div>
                        <div className="relative w-full h-80">
                            <Image
                                src="/images/landing/aboutthedoctor.jpg"
                                alt="Dra. Ana Pérez"
                                fill
                                className="rounded-3xl object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contacto" className="mt-16 bg-white/70 p-8 rounded-3xl max-w-3xl mx-auto backdrop-blur-sm">
                    <h3 className="text-3xl font-bold text-center mb-8">Agenda tu Cita de Valoración</h3>
                    <ContactForm />
                </section>
            </main>

            {/* Footer */}
            <footer className="text-center py-8 mt-8 sm:mt-16">
                <p>&copy; {new Date().getFullYear()} Clínica Dental Sonrisa. Todos los derechos reservados.</p>
                <p className="text-sm text-gray-600 mt-2">Calle Ficticia 123, Colonia Centro, Ciudad de México</p>
            </footer>
        </div>
    );
}
