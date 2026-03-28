import { useState } from "react";
import { Quest, Skill, CreateQuestInput } from "@/stores/useGameStore";
import { Check, Trash2, ScrollText, Plus, Clock, Repeat, CalendarIcon } from "lucide-react";
import CreateQuestDialog from "@/components/CreateQuestDialog";

interface Props {
  quests: Quest[];
  skills: Skill[];
  completeQuest: (id: string) => void;
  clearCompletedQuests: () => void;
  generateQuest: (skillId: string) => void;
  addQuest: (input: CreateQuestInput) => void;
  removeQuest: (id: string) => void;
}

function formatDueDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = ts - now.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return "Expirada";
  if (diffH < 1) return `${Math.floor(diffMs / 60000)}min`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function isDueExpired(ts?: number | null): boolean {
  if (!ts) return false;
  return ts < Date.now();
}

export default function Quests({ quests, skills, completeQuest, clearCompletedQuests, generateQuest, addQuest, removeQuest }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const active = quests.filter((q) => !q.completed);
  const completed = quests.filter((q) => q.completed);

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-sm text-secondary text-glow-cyan">⚔️ Missões</h1>
        <div className="flex gap-2">
          {skills.length > 0 && (
            <>
              <select
                onChange={(e) => {
                  if (e.target.value) generateQuest(e.target.value);
                  e.target.value = "";
                }}
                className="bg-muted text-foreground rounded px-2 py-1 text-xs border border-border"
                defaultValue=""
              >
                <option value="" disabled>⚡ Auto-gerar</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> Criar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active quests */}
      {active.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ativas ({active.length})</h2>
          {active.map((q) => {
            const skill = skills.find((s) => s.id === q.skillId);
            const expired = isDueExpired(q.dueDate);
            return (
              <div key={q.id} className={`rpg-card flex items-start gap-3 ${expired ? "border-destructive/30" : ""}`}>
                <button
                  onClick={() => completeQuest(q.id)}
                  className="mt-0.5 w-6 h-6 rounded border-2 border-success/50 flex items-center justify-center hover:bg-success/20 transition-colors shrink-0"
                >
                  <Check size={14} className="text-success opacity-0 hover:opacity-100" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{q.title}</div>
                  {q.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{q.description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {skill && (
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `hsl(${skill.color} / 0.15)`,
                          color: `hsl(${skill.color})`,
                        }}
                      >
                        {skill.name}
                      </span>
                    )}
                    {q.dueDate && (
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                        expired
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Clock size={10} />
                        {formatDueDate(q.dueDate)}
                      </span>
                    )}
                    {q.recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                        <Repeat size={10} />
                        {q.recurrenceInterval === "daily" ? "Diária" : q.recurrenceInterval === "weekly" ? "Semanal" : "Mensal"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-xs text-primary font-semibold">+{q.xpReward} XP</div>
                  <div className="text-xs text-muted-foreground">🪙 {q.coinReward}</div>
                  <button
                    onClick={() => removeQuest(q.id)}
                    className="text-destructive/50 hover:text-destructive transition-colors mt-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Completas ({completed.length})
            </h2>
            <button
              onClick={clearCompletedQuests}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} /> Limpar
            </button>
          </div>
          {completed.map((q) => (
            <div key={q.id} className="rpg-card opacity-50 flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-success/20 flex items-center justify-center shrink-0">
                <Check size={14} className="text-success" />
              </div>
              <span className="text-sm line-through">{q.title}</span>
              <span className="ml-auto text-xs text-primary">+{q.xpReward} XP</span>
            </div>
          ))}
        </div>
      )}

      {quests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <ScrollText size={40} className="mx-auto" />
          <p>Nenhuma missão ainda</p>
          <p className="text-xs">Crie missões personalizadas ou gere automaticamente!</p>
        </div>
      )}

      {/* Create quest dialog */}
      {showCreate && (
        <CreateQuestDialog
          skills={skills}
          onSubmit={addQuest}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
