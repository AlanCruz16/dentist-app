import Link from 'next/link';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
            <h2 className="text-xl font-semibold mb-4">Clínica Dental</h2>
            <nav>
                <ul>
                    <li>
                        <Link href="/" className="block py-2 px-3 hover:bg-gray-700 rounded">
                            Inicio
                        </Link>
                    </li>
                    <li>
                        <Link href="/pacientes" className="block py-2 px-3 hover:bg-gray-700 rounded">
                            Pacientes
                        </Link>
                    </li>
                    <li>
                        <Link href="/calendario" className="block py-2 px-3 hover:bg-gray-700 rounded">
                            Calendario
                        </Link>
                    </li>
                    <li>
                        <Link href="/pagos" className="block py-2 px-3 hover:bg-gray-700 rounded">
                            Pagos
                        </Link>
                    </li>
                    <li>
                        <Link href="/reportes" className="block py-2 px-3 hover:bg-gray-700 rounded">
                            Reportes
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
