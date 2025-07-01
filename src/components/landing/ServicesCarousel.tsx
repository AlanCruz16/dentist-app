'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const services = [
    { src: '/images/landing/services1.jpg', alt: 'Servicio de ortodoncia 1' },
    { src: '/images/landing/services2.jpg', alt: 'Servicio de ortodoncia 2' },
    { src: '/images/landing/services3.jpg', alt: 'Servicio de ortodoncia 3' },
    { src: '/images/landing/services4.jpg', alt: 'Servicio de ortodoncia 4' },
    { src: '/images/landing/services5.jpg', alt: 'Servicio de ortodoncia 5' },
    { src: '/images/landing/services6.jpg', alt: 'Servicio de ortodoncia 6' },
];

export default function ServicesCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const firstImageIndex = currentIndex;
    const secondImageIndex = (currentIndex + 1) % services.length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="relative h-80 w-full">
                {services.map((service, index) => (
                    <Image
                        key={service.src}
                        src={service.src}
                        alt={service.alt}
                        fill
                        className={`rounded-3xl object-cover transition-opacity duration-1000 ${index === firstImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>
            <div className="relative h-80 w-full">
                {services.map((service, index) => (
                    <Image
                        key={service.src}
                        src={service.src}
                        alt={service.alt}
                        fill
                        className={`rounded-3xl object-cover transition-opacity duration-1000 ${index === secondImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>
        </div>
    );
}
