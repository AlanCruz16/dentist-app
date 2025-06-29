'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const getLinkClass = (path: string) => {
        return `block py-2 px-3 rounded-lg ${pathname === path
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'hover:bg-sidebar-accent'
            }`;
    };

    return (
        <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 space-y-6">
            <div className="flex items-center space-x-2">
                <Shield size={32} />
                <h2 className="text-xl font-semibold">Clínica Dental</h2>
            </div>
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link href="/" className={getLinkClass('/')}>
                            Inicio
                        </Link>
                    </li>
                    <li>
                        <Link href="/pacientes" className={getLinkClass('/pacientes')}>
                            Pacientes
                        </Link>
                    </li>
                    <li>
                        <Link href="/agenda" className={getLinkClass('/agenda')}>
                            Agenda
                        </Link>
                    </li>
                    <li>
                        <Link href="/pagos" className={getLinkClass('/pagos')}>
                            Pagos
                        </Link>
                    </li>
                    <li>
                        <Link href="/reportes" className={getLinkClass('/reportes')}>
                            Reportes
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
