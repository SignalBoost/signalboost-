// File: components/SiteHeader.tsx
// Project: SignalBoost (main production repo)

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SiteHeader() {
  const router = useRouter();

  const navItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Promote Business', path: '/promote' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Spreadsheets', path: '/spreadsheets' },
    { name: 'Outreach', path: '/outreach' },
    { name: 'Personal Assistant', path: '/assistant' },
    { name: 'Admin', path: '/admin' }, // restricted access
  ];

  return (
    <header className="bg-black bg-opacity-80 backdrop-blur-md px-6 py-3 flex items-center">
      <div className="text-xl font-bold">
        <span className="text-white">signal</span>
        <span className="text-yellow-400">boost</span>
      </div>
      <nav className="ml-auto">
        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a
                  className={`transition hover:text-cyan-400 ${
                    router.pathname === item.path ? 'text-cyan-400' : 'text-white'
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
