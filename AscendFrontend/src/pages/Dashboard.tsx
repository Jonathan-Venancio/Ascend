import { Skill, Quest } from "@/stores/useGameStore";
import { Swords, TreePine, Star, Zap } from "lucide-react";

interface Props {
  skills: Skill[];
  quests: Quest[];
  coins: number;
  playerLevel: number;
  totalXp: number;
}

export default function Dashboard({ skills, quests, coins, playerLevel, totalXp }: Props) {
  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);
  const xpInLevel = totalXp % 100;

  const topSkills = [...skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* Hero */}
      <div className="rpg-border p-6 text-center space-y-3">
        <h1 className="font-display text-lg text-primary text-glow-gold">
          Ascend
        </h1>
        <p className="text-muted-foreground text-sm">Transforme seus estudos em aventura</p>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{playerLevel}</div>
            <div className="text-xs text-muted-foreground">Nível</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalXp}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">🪙 {coins}</div>
            <div className="text-xs text-muted-foreground">Moedas</div>
          </div>
        </div>

        <div className="max-w-xs mx-auto mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Lv.{playerLevel}</span>
            <span>{xpInLevel}/100 XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TreePine, label: "Habilidades", value: skills.length, glow: "box-glow-cyan" },
          { icon: Swords, label: "Missões Ativas", value: activeQuests.length, glow: "box-glow-purple" },
          { icon: Star, label: "Completas", value: completedQuests.length, glow: "box-glow-green" },
          { icon: Zap, label: "Moedas", value: coins, glow: "box-glow-gold" },
        ].map((stat) => (
          <div key={stat.label} className={`rpg-card ${stat.glow} flex flex-col items-center gap-2 py-4`}>
            <stat.icon size={20} className="text-primary" />
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <div className="rpg-card space-y-3">
          <h2 className="font-display text-xs text-primary">Top Habilidades</h2>
          <div className="space-y-2">
            {topSkills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `hsl(${skill.color} / 0.2)`,
                    color: `hsl(${skill.color})`,
                    boxShadow: `0 0 10px hsl(${skill.color} / 0.2)`,
                  }}
                >
                  {skill.level}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{skill.name}</div>
                  <div className="xp-bar mt-1">
                    <div
                      className="xp-fill"
                      style={{ width: `${(skill.xp / skill.xpToNext) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {skill.xp}/{skill.xpToNext}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Quests Preview */}
      {activeQuests.length > 0 && (
        <div className="rpg-card space-y-3">
          <h2 className="font-display text-xs text-secondary text-glow-cyan">Missões Ativas</h2>
          <div className="space-y-2">
            {activeQuests.slice(0, 3).map((q) => (
              <div key={q.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm">{q.title}</span>
                <span className="text-xs text-primary">+{q.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="rpg-card text-center py-8 space-y-2">
          <TreePine size={40} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Comece adicionando suas habilidades!</p>
          <p className="text-xs text-muted-foreground">Vá para a aba Habilidades e crie sua árvore de estudos</p>
        </div>
      )}
    </div>
  );
}
