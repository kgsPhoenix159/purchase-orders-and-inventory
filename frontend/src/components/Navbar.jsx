import { NavLink } from 'react-router-dom';

const links = [
  { to: '/inventory',        label: 'Inventory',        icon: '📦' },
  { to: '/purchase-orders',  label: 'Purchase Orders',  icon: '📋' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white shadow-lg shadow-primary-600/25">
            SG
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Simple<span className="text-primary-400">Grid</span>
          </span>
        </div>

        {}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                    : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
