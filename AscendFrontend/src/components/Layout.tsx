import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Swords, TreePine, ScrollText, ShoppingBag, User, Menu, X } from "lucide-react";

const navItems = [
  { to: "/", icon: Swords, label: "Dashboard" },
  { to: "/skills", icon: TreePine, label: "Habilidades" },
  { to: "/quests", icon: ScrollText, label: "Missões" },
  { to: "/shop", icon: ShoppingBag, label: "Loja" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export default function Layout({ children, coins, playerLevel, totalXp }: {
  children: ReactNode;
  coins: number;
  playerLevel: number;
  totalXp: number;
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const xpInLevel = totalXp % 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="font-display text-xs text-primary text-glow-gold">
            Ascend
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-bold">Lv.{playerLevel}</span>
              <div className="xp-bar w-16 hidden sm:block">
                <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">🪙</span>
              <span className="font-semibold">{coins}</span>
            </div>
            <button
              className="sm:hidden text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <nav className="hidden sm:flex flex-col w-16 border-r border-border bg-card/50 items-center py-4 gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-xs ${
                  active
                    ? "text-primary box-glow-gold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[9px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 sm:hidden flex flex-col items-center justify-center gap-6">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 text-lg font-semibold ${
                    active ? "text-primary" : "text-foreground"
                  }`}
                >
                  <item.icon size={24} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 px-4 max-w-4xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md z-30">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
