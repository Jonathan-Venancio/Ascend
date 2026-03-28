import { useState } from "react";
import { Skill, CreateQuestInput } from "@/stores/useGameStore";
import { X, Plus, CalendarIcon, Repeat, Swords } from "lucide-react";

interface Props {
  skills: Skill[];
  onSubmit: (input: CreateQuestInput) => void;
  onClose: () => void;
  defaultSkillId?: string;
}

export default function CreateQuestDialog({ skills, onSubmit, onClose, defaultSkillId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillId, setSkillId] = useState(defaultSkillId || skills[0]?.id || "");
  const [xpReward, setXpReward] = useState(25);
  const [coinReward, setCoinReward] = useState(15);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<"daily" | "weekly" | "monthly">("daily");

  const selectedSkill = skills.find((s) => s.id === skillId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !skillId) return;

    let dueDateTs: number | null = null;
    if (hasDueDate && dueDate) {
      const dateStr = dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T23:59`;
      dueDateTs = new Date(dateStr).getTime();
    }

    onSubmit({
      skillId,
      title: title.trim(),
      description: description.trim(),
      xpReward,
      coinReward,
      dueDate: dueDateTs,
      recurring,
      recurrenceInterval: recurring ? recurrenceInterval : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dialog */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm text-secondary flex items-center gap-2">
            <Swords size={16} /> Nova Missão
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Skill selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Habilidade</label>
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:border-secondary focus:outline-none"
            required
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {selectedSkill && (
            <div
              className="inline-block text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: `hsl(${selectedSkill.color} / 0.15)`,
                color: `hsl(${selectedSkill.color})`,
              }}
            >
              Nível {selectedSkill.level}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Título da Missão *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Estudar estruturas de repetição"
            className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:border-secondary focus:outline-none"
            maxLength={100}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes sobre o que estudar, materiais, etc..."
            className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:border-secondary focus:outline-none resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* XP and Gold */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">⭐ XP</label>
            <input
              type="number"
              value={xpReward}
              onChange={(e) => setXpReward(Math.max(1, Math.min(999, Number(e.target.value))))}
              className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:border-primary focus:outline-none"
              min={1}
              max={999}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">🪙 Moedas</label>
            <input
              type="number"
              value={coinReward}
              onChange={(e) => setCoinReward(Math.max(1, Math.min(999, Number(e.target.value))))}
              className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:border-primary focus:outline-none"
              min={1}
              max={999}
            />
          </div>
        </div>

        {/* Due date toggle */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setHasDueDate(!hasDueDate)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              hasDueDate
                ? "border-secondary/50 bg-secondary/10 text-secondary"
                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarIcon size={14} />
            Prazo de entrega
          </button>

          {hasDueDate && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Data</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-1.5 text-xs border border-border focus:border-secondary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Hora (opcional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-muted/50 text-foreground rounded-lg px-3 py-1.5 text-xs border border-border focus:border-secondary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Recurring toggle */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setRecurring(!recurring)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              recurring
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat size={14} />
            Missão recorrente
          </button>

          {recurring && (
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setRecurrenceInterval(interval)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    recurrenceInterval === interval
                      ? "border-accent/50 bg-accent/20 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {interval === "daily" ? "Diária" : interval === "weekly" ? "Semanal" : "Mensal"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim() || !skillId}
          className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Criar Missão
        </button>
      </form>
    </div>
  );
}
