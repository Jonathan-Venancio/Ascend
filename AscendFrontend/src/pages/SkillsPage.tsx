import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronRight, TreePine } from "lucide-react";
import Layout from "@/components/Layout";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills } from "@/utils/typeConverters";
import { buildAvailableSkills, getRootSkills } from "@/utils/skills";

export default function SkillsPage() {
  const store = useGameStoreAPI();
  const [newName, setNewName] = useState("");

  const allAvailableSkills = buildAvailableSkills(
    store.allSkills,
    convertUserSkillsToSkills(store.skills)
  );
  const rootSkills = getRootSkills(allAvailableSkills);

  const handleAddRoot = () => {
    if (!newName.trim()) return;
    store.addSkill(newName.trim(), null);
    setNewName("");
  };

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <div className="space-y-4 pb-20 sm:pb-0">
        <h1 className="font-display text-sm text-primary text-glow-gold">
          🌳 Habilidades
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha uma habilidade para abrir a árvore dela.
        </p>

        <div className="rpg-card flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRoot()}
            placeholder="Nova habilidade (ex: Python)"
            className="flex-1 bg-muted/50 text-foreground rounded px-3 py-2 text-sm border border-border focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleAddRoot}
            className="px-4 py-2 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
          </button>
        </div>

        {rootSkills.length === 0 ? (
          <div className="rpg-card text-center py-10 space-y-2 text-muted-foreground">
            <p className="text-4xl">🌱</p>
            <p>Nenhuma habilidade ainda</p>
            <p className="text-xs">Crie a primeira acima para começar sua árvore.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rootSkills.map((skill) => {
              const color = `hsl(${skill.color})`;
              const colorAlpha = (a: number) => `hsl(${skill.color} / ${a})`;
              const childCount = allAvailableSkills.filter(
                (s) => s.parentId === skill.id
              ).length;
              const xpPercent = (skill.xp / skill.xpToNext) * 100;

              return (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="rpg-card flex items-center gap-3 group hover:border-primary/40 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold"
                    style={{
                      background: colorAlpha(0.15),
                      border: `2px solid ${colorAlpha(0.45)}`,
                      color,
                      boxShadow: `0 0 12px ${colorAlpha(0.2)}`,
                    }}
                  >
                    {skill.level}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold truncate" style={{ color }}>
                        {skill.name}
                      </h2>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TreePine size={12} />
                      <span>
                        {childCount} sub-habilidade{childCount === 1 ? "" : "s"}
                      </span>
                      <span>·</span>
                      <span>
                        {skill.xp}/{skill.xpToNext} XP
                      </span>
                    </div>

                    <div className="xp-bar">
                      <div
                        className="xp-fill"
                        style={{
                          width: `${xpPercent}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
