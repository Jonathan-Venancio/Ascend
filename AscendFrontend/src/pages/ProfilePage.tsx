import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { useAuth } from "@/contexts/AuthContext";
import { User, Save, Pencil, ChevronDown } from "lucide-react";

interface Profile {
  name: string;
  age: string;
}

const STORAGE_KEY = "ascend-profile";

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "", age: "" };
}

export default function ProfilePage() {
  const store = useGameStoreAPI();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);
  const [titleOpen, setTitleOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
  };

  const hasProfile = profile.name.trim().length > 0;

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <div className="space-y-6 pb-20 sm:pb-0">
        <h1 className="font-display text-sm text-primary text-glow-gold">Meu Perfil</h1>

        <div className="rpg-border p-6 flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
               style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}>
            <User size={36} className="text-primary" />
          </div>

          {!editing ? (
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {hasProfile ? profile.name : (user?.username || "Aventureiro")}
              </h2>
              <p className="text-sm text-primary font-semibold italic">"{store.selectedTitle}"</p>
              {profile.age && (
                <p className="text-xs text-muted-foreground">{profile.age} anos</p>
              )}
              <button
                onClick={() => { setDraft(profile); setEditing(true); }}
                className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                <Pencil size={14} />
                Editar Perfil
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Idade</label>
                <input
                  type="number"
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                  placeholder="Sua idade"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Save size={14} />
                Salvar
              </button>
            </div>
          )}
        </div>

        {/* Title selector */}
        <div className="rpg-card space-y-3">
          <h2 className="font-display text-xs text-secondary text-glow-cyan">🏅 Título Ativo</h2>
          <div className="relative">
            <button
              onClick={() => setTitleOpen(!titleOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/30 text-foreground text-sm hover:border-primary/50 transition-colors"
            >
              <span className="font-semibold text-primary">"{store.selectedTitle}"</span>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${titleOpen ? "rotate-180" : ""}`} />
            </button>
            {titleOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {store.unlockedTitles.map((title) => (
                  <button
                    key={title}
                    onClick={() => { store.selectTitle(title); setTitleOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                      title === store.selectedTitle ? "text-primary font-bold bg-primary/10" : "text-foreground"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Desbloqueie novos títulos subindo de nível nas suas habilidades!
          </p>
        </div>

        {/* Stats */}
        <div className="rpg-card space-y-3">
          <h2 className="font-display text-xs text-secondary text-glow-cyan">Estatísticas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nível", value: store.playerLevel },
              { label: "XP Total", value: store.totalXp },
              { label: "Moedas", value: `🪙 ${store.coins}` },
              { label: "Habilidades", value: store.skills.length },
              { label: "Missões Completas", value: store.quests.filter(q => q.completed).length },
              { label: "Títulos", value: store.unlockedTitles.length },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
