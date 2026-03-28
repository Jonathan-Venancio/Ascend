import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skill, SkillMilestone } from "@/stores/useGameStore";
import { Plus, Trash2, Trophy } from "lucide-react";

interface Props {
  skill: Skill;
  open: boolean;
  onClose: () => void;
  addMilestone: (skillId: string, level: number, title: string) => void;
  removeMilestone: (skillId: string, index: number) => void;
}

export default function MilestoneDialog({ skill, open, onClose, addMilestone, removeMilestone }: Props) {
  const [level, setLevel] = useState("");
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    const lvl = parseInt(level);
    if (!lvl || lvl < 1 || !title.trim()) return;
    addMilestone(skill.id, lvl, title.trim());
    setLevel("");
    setTitle("");
  };

  const milestones = skill.milestones || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Trophy size={18} className="text-primary" />
            Títulos de {skill.name}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          Defina títulos que serão desbloqueados ao atingir determinados níveis.
        </p>

        {/* Existing milestones */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {milestones.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-3">Nenhum título configurado</p>
          ) : (
            milestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Lv.{m.level}</span>
                  <span className="text-sm text-foreground">{m.title}</span>
                  {skill.level >= m.level && (
                    <span className="text-[10px] text-green-400">✓ Desbloqueado</span>
                  )}
                </div>
                <button onClick={() => removeMilestone(skill.id, i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new milestone */}
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="Nível"
            className="w-20 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Ex: Mestre Python"
            className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
