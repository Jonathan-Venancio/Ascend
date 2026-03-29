import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Skill } from "@/stores/useGameStore";
import { Plus, Trash2, ZoomIn, ZoomOut, Maximize2, Trophy } from "lucide-react";
import MilestoneDialog from "@/components/MilestoneDialog";

interface Props {
  skills: Skill[];
  addSkill: (name: string, parentId: string | null) => void;
  removeSkill: (id: string) => void;
  generateQuest: (skillId: string) => void;
  addMilestone: (skillId: string, level: number, title: string) => void;
  removeMilestone: (skillId: string, index: number) => void;
  acquireSkill: (skillId: string) => void;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
}

const NODE_RADIUS = 32;
const CHILD_DISTANCE = 140;
const ANGLE_SPREAD = (2 * Math.PI) / 8;

function layoutTree(skills: Skill[]): NodePos[] {
  const positions: NodePos[] = [];
  const roots = skills.filter((s) => s.parentId === null);
  const posMap = new Map<string, { x: number; y: number }>();

  // Place roots in a horizontal line
  const rootSpacing = 300;
  const rootStartX = -(roots.length - 1) * rootSpacing / 2;

  roots.forEach((root, i) => {
    const x = rootStartX + i * rootSpacing;
    const y = 0;
    posMap.set(root.id, { x, y });
    positions.push({ id: root.id, x, y });
  });

  // BFS to place children radially around their parent
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = skills.filter((s) => s.parentId === current.id);
    if (children.length === 0) continue;

    const parentPos = posMap.get(current.id)!;
    const grandparentPos = current.parentId ? posMap.get(current.parentId) : null;

    // Calculate base angle (away from grandparent)
    let baseAngle = Math.PI / 2; // default: downward
    if (grandparentPos) {
      baseAngle = Math.atan2(parentPos.y - grandparentPos.y, parentPos.x - grandparentPos.x);
    }

    const totalSpread = Math.min((children.length - 1) * ANGLE_SPREAD, Math.PI * 1.5);
    const startAngle = baseAngle - totalSpread / 2;

    children.forEach((child, i) => {
      const angle = children.length === 1
        ? baseAngle
        : startAngle + (i * totalSpread) / (children.length - 1);
      const x = parentPos.x + Math.cos(angle) * CHILD_DISTANCE;
      const y = parentPos.y + Math.sin(angle) * CHILD_DISTANCE;
      posMap.set(child.id, { x, y });
      positions.push({ id: child.id, x, y });
      queue.push(child);
    });
  }

  return positions;
}

function SkillTreeCanvas({
  skills,
  removeSkill,
  generateQuest,
  onAddChild,
  onMilestones,
  acquireSkill,
}: {
  skills: Skill[];
  removeSkill: (id: string) => void;
  generateQuest: (skillId: string) => void;
  onAddChild: (parentId: string) => void;
  onMilestones: (skillId: string) => void;
  acquireSkill: (skillId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const positions = useMemo(() => layoutTree(skills), [skills]);
  const posMap = useMemo(() => {
    const m = new Map<string, NodePos>();
    positions.forEach((p) => m.set(p.id, p));
    return m;
  }, [positions]);

  // Center view on mount or when skills change
  useEffect(() => {
    if (positions.length === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    // Find center of all nodes
    const avgX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
    const avgY = positions.reduce((s, p) => s + p.y, 0) / positions.length;
    setPan({ x: cx - avgX, y: cy - avgY });
  }, [skills.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z * delta)));
  }, []);

  // Touch support
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { x: t.clientX - pan.x, y: t.clientY - pan.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchRef.current) {
      const t = e.touches[0];
      setPan({ x: t.clientX - touchRef.current.x, y: t.clientY - touchRef.current.y });
    }
  };

  const handleTouchEnd = () => { touchRef.current = null; };

  const resetView = () => {
    if (!containerRef.current || positions.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const avgX = positions.reduce((s, p) => s + p.x, 0) / positions.length;
    const avgY = positions.reduce((s, p) => s + p.y, 0) / positions.length;
    setPan({ x: rect.width / 2 - avgX, y: rect.height / 2 - avgY });
    setZoom(1);
  };

  // Edges
  const edges = skills
    .filter((s) => s.parentId !== null)
    .map((s) => {
      const from = posMap.get(s.parentId!);
      const to = posMap.get(s.id);
      if (!from || !to) return null;
      return { from, to, skill: s };
    })
    .filter(Boolean) as { from: NodePos; to: NodePos; skill: Skill }[];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ background: "radial-gradient(ellipse at center, hsl(222 47% 10%), hsl(222 47% 4%))" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={() => setZoom((z) => Math.min(3, z * 1.2))} className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
          <ZoomIn size={16} className="text-foreground" />
        </button>
        <button onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))} className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
          <ZoomOut size={16} className="text-foreground" />
        </button>
        <button onClick={resetView} className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
          <Maximize2 size={16} className="text-foreground" />
        </button>
      </div>

      {/* SVG Layer for edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Glow filter */}
          <defs>
            <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map(({ from, to, skill }, i) => {
            const color = `hsl(${skill.color})`;
            return (
              <g key={i}>
                {/* Glow line */}
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={color}
                  strokeWidth={3}
                  strokeOpacity={0.15}
                  filter="url(#edgeGlow)"
                />
                {/* Main line */}
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                />
                {/* Small dot at midpoint */}
                <circle
                  cx={(from.x + to.x) / 2}
                  cy={(from.y + to.y) / 2}
                  r={2}
                  fill={color}
                  opacity={0.5}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Nodes Layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          zIndex: 2,
        }}
      >
        {positions.map((pos) => {
          const skill = skills.find((s) => s.id === pos.id)!;
          if (!skill) return null;
          const isSelected = selectedSkill === skill.id;
          const xpPercent = (skill.xp / skill.xpToNext) * 100;
          const color = `hsl(${skill.color})`;
          const colorAlpha = (a: number) => `hsl(${skill.color} / ${a})`;

          return (
            <div
              key={skill.id}
              className="absolute"
              style={{
                left: pos.x - NODE_RADIUS,
                top: pos.y - NODE_RADIUS,
                width: NODE_RADIUS * 2,
                height: NODE_RADIUS * 2,
              }}
            >
              {/* Node circle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSkill(isSelected ? null : skill.id);
                }}
                className="w-full h-full rounded-full relative flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: `radial-gradient(circle, ${colorAlpha(0.25)}, ${colorAlpha(0.08)})`,
                  border: `2px solid ${colorAlpha(0.5)}`,
                  boxShadow: isSelected
                    ? `0 0 20px ${colorAlpha(0.5)}, 0 0 40px ${colorAlpha(0.2)}`
                    : `0 0 10px ${colorAlpha(0.2)}`,
                }}
              >
                {/* XP ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 68 68">
                  <circle
                    cx="34" cy="34" r="30"
                    fill="none"
                    stroke={colorAlpha(0.15)}
                    strokeWidth="3"
                  />
                  <circle
                    cx="34" cy="34" r="30"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={`${(xpPercent / 100) * 188.5} 188.5`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 3px ${colorAlpha(0.6)})` }}
                  />
                </svg>

                {/* Level number */}
                <span
                  className="text-xs font-bold relative z-10"
                  style={{ color, textShadow: `0 0 8px ${colorAlpha(0.5)}` }}
                >
                  {skill.level}
                </span>
              </button>

              {/* Name label */}
              <div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none"
                style={{ top: NODE_RADIUS * 2 + 6 }}
              >
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    color,
                    background: colorAlpha(0.1),
                    textShadow: `0 0 6px ${colorAlpha(0.4)}`,
                  }}
                >
                  {skill.name}
                </span>
              </div>

              {/* Action popover */}
              {isSelected && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex gap-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                  style={{ bottom: NODE_RADIUS * 2 + 8 }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); acquireSkill(skill.id); setSelectedSkill(null); }}
                    className="p-1.5 rounded-lg text-xs border border-border hover:scale-110 transition-transform"
                    style={{ background: "hsl(142 71% 45% / 0.2)", color: "hsl(142 71% 45%)" }}
                    title="Adquirir habilidade"
                  >
                    🎯
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); generateQuest(skill.id); setSelectedSkill(null); }}
                    className="p-1.5 rounded-lg text-xs border border-border hover:scale-110 transition-transform"
                    style={{ background: colorAlpha(0.2), color }}
                    title="Gerar missão"
                  >
                    ⚔️
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMilestones(skill.id); setSelectedSkill(null); }}
                    className="p-1.5 rounded-lg border border-border hover:scale-110 transition-transform"
                    style={{ background: "hsl(43 96% 56% / 0.2)", color: "hsl(43 96% 56%)" }}
                    title="Títulos"
                  >
                    <Trophy size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddChild(skill.id); setSelectedSkill(null); }}
                    className="p-1.5 rounded-lg border border-border hover:scale-110 transition-transform"
                    style={{ background: "hsl(142 71% 45% / 0.2)", color: "hsl(142 71% 45%)" }}
                    title="Adicionar sub-habilidade"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSkill(skill.id); setSelectedSkill(null); }}
                    className="p-1.5 rounded-lg border border-border hover:scale-110 transition-transform"
                    style={{ background: "hsl(0 84% 60% / 0.2)", color: "hsl(0 84% 60%)" }}
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {skills.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="text-4xl">🌱</p>
            <p>Sua árvore está vazia</p>
            <p className="text-xs">Adicione sua primeira habilidade abaixo!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillTree({ skills, addSkill, removeSkill, generateQuest, addMilestone, removeMilestone, acquireSkill }: Props) {
  const [newName, setNewName] = useState("");
  const [addingTo, setAddingTo] = useState<string | null | "root">(null);
  const [childName, setChildName] = useState("");
  const [milestoneSkillId, setMilestoneSkillId] = useState<string | null>(null);

  const milestoneSkill = milestoneSkillId ? skills.find((s) => s.id === milestoneSkillId) : null;

  const handleAddRoot = () => {
    if (!newName.trim()) return;
    addSkill(newName.trim(), null);
    setNewName("");
  };

  const handleAddChild = (parentId: string) => {
    setAddingTo(parentId);
    setChildName("");
  };

  const confirmAddChild = () => {
    if (!childName.trim() || addingTo === null || addingTo === "root") return;
    addSkill(childName.trim(), addingTo);
    setAddingTo(null);
    setChildName("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pb-16 sm:pb-0">
      {/* Header + inputs */}
      <div className="space-y-3 p-1 shrink-0">
        <h1 className="font-display text-sm text-primary text-glow-gold">🌳 Árvore de Habilidades</h1>

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

        {addingTo && addingTo !== "root" && (
          <div className="rpg-card border-secondary/30 flex gap-2">
            <input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAddChild()}
              placeholder={`Sub-habilidade de ${skills.find((s) => s.id === addingTo)?.name}`}
              className="flex-1 bg-muted/50 text-foreground rounded px-3 py-2 text-sm border border-border focus:border-secondary focus:outline-none"
              autoFocus
            />
            <button onClick={confirmAddChild} className="px-4 py-2 bg-secondary text-secondary-foreground rounded font-semibold text-sm">
              Adicionar
            </button>
            <button onClick={() => setAddingTo(null)} className="px-3 py-2 text-muted-foreground text-sm hover:text-foreground">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 rounded-lg border border-border overflow-hidden mt-3">
        <SkillTreeCanvas
          skills={skills}
          removeSkill={removeSkill}
          generateQuest={generateQuest}
          onAddChild={handleAddChild}
          onMilestones={(id) => setMilestoneSkillId(id)}
          acquireSkill={acquireSkill}
        />
      </div>

      {/* Milestone Dialog */}
      {milestoneSkill && (
        <MilestoneDialog
          skill={milestoneSkill}
          open={!!milestoneSkillId}
          onClose={() => setMilestoneSkillId(null)}
          addMilestone={addMilestone}
          removeMilestone={removeMilestone}
        />
      )}
    </div>
  );
}
