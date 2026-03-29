import { useState, useEffect, useCallback } from "react";

export interface SkillMilestone {
  level: number;
  title: string;
}

export interface Skill {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  completed: boolean;
  color: string;
  milestones: SkillMilestone[];
}

export interface Quest {
  id: string;
  skillId: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  completedAt?: string;
  createdAt: number;
  dueDate?: number | null;
  recurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | null;
}

export interface CreateQuestInput {
  skillId: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  dueDate?: number | null;
  recurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
}

export interface GameState {
  skills: Skill[];
  quests: Quest[];
  rewards: Reward[];
  coins: number;
  totalXp: number;
  playerLevel: number;
  unlockedTitles: string[];
  selectedTitle: string;
}

const STORAGE_KEY = "ascend-data";

const DEFAULT_REWARDS: Reward[] = [
  { id: "r1", name: "30min de Descanso", description: "Relaxe por 30 minutos", cost: 50, emoji: "😴" },
  { id: "r2", name: "15min de Instagram", description: "Navegue no Instagram", cost: 30, emoji: "📱" },
  { id: "r3", name: "1 Partida de LoL", description: "Jogue uma partida", cost: 80, emoji: "🎮" },
  { id: "r4", name: "1 Episódio de Série", description: "Assista um episódio", cost: 60, emoji: "📺" },
  { id: "r5", name: "Lanche Especial", description: "Coma algo gostoso", cost: 40, emoji: "🍕" },
];

const defaultState: GameState = {
  skills: [],
  quests: [],
  rewards: DEFAULT_REWARDS,
  coins: 0,
  totalXp: 0,
  playerLevel: 1,
  unlockedTitles: ["Novato"],
  selectedTitle: "Novato",
};

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const SKILL_COLORS = [
  "43 96% 56%",   // gold
  "186 100% 50%", // cyan
  "270 70% 60%",  // purple
  "142 71% 45%",  // green
  "0 84% 60%",    // red
  "200 80% 55%",  // blue
  "30 90% 55%",   // orange
];

export function useGameStore() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addSkill = useCallback((name: string, parentId: string | null) => {
    setState((s) => {
      const colorIndex = s.skills.length % SKILL_COLORS.length;
      const newSkill: Skill = {
        id: generateId(),
        name,
        parentId,
        level: 1,
        xp: 0,
        xpToNext: 100,
        completed: false,
        color: SKILL_COLORS[colorIndex],
        milestones: [],
      };
      return { ...s, skills: [...s.skills, newSkill] };
    });
  }, []);

  const removeSkill = useCallback((skillId: string) => {
    setState((s) => {
      const idsToRemove = new Set<string>();
      const collectChildren = (id: string) => {
        idsToRemove.add(id);
        s.skills.filter((sk) => sk.parentId === id).forEach((sk) => collectChildren(sk.id));
      };
      collectChildren(skillId);
      return {
        ...s,
        skills: s.skills.filter((sk) => !idsToRemove.has(sk.id)),
        quests: s.quests.filter((q) => !idsToRemove.has(q.skillId)),
      };
    });
  }, []);

  const generateQuest = useCallback((skillId: string) => {
    setState((s) => {
      const skill = s.skills.find((sk) => sk.id === skillId);
      if (!skill) return s;
      const actions = ["Estudar", "Praticar", "Revisar", "Aprofundar", "Exercitar"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const quest: Quest = {
        id: generateId(),
        skillId,
        title: `${action} ${skill.name}`,
        description: `Complete uma sessão de estudo focada em ${skill.name}. Nível atual: ${skill.level}`,
        xpReward: 20 + skill.level * 5,
        coinReward: 10 + skill.level * 3,
        completed: false,
        createdAt: Date.now(),
        recurring: false,
      };
      return { ...s, quests: [...s.quests, quest] };
    });
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setState((s) => {
      const quest = s.quests.find((q) => q.id === questId);
      if (!quest || quest.completed) return s;

      const newQuests = s.quests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      );

      // Collect skill and all ancestors
      const idsToLevel = new Set<string>();
      let currentId: string | null = quest.skillId;
      while (currentId) {
        idsToLevel.add(currentId);
        const sk = s.skills.find((s) => s.id === currentId);
        currentId = sk?.parentId ?? null;
      }

      const newUnlockedTitles = new Set(s.unlockedTitles);

      let newSkills = s.skills.map((sk) => {
        if (!idsToLevel.has(sk.id)) return sk;
        const newXp = sk.xp + quest.xpReward;
        if (newXp >= sk.xpToNext) {
          const newLevel = sk.level + 1;
          // Check milestones for this skill
          (sk.milestones || []).forEach((m) => {
            if (newLevel >= m.level) {
              newUnlockedTitles.add(m.title);
            }
          });
          return {
            ...sk,
            xp: newXp - sk.xpToNext,
            level: newLevel,
            xpToNext: sk.xpToNext + 50,
          };
        }
        return { ...sk, xp: newXp };
      });

      const newTotalXp = s.totalXp + quest.xpReward;
      return {
        ...s,
        quests: newQuests,
        skills: newSkills,
        coins: s.coins + quest.coinReward,
        totalXp: newTotalXp,
        playerLevel: calcLevel(newTotalXp),
        unlockedTitles: Array.from(newUnlockedTitles),
      };
    });
  }, []);

  const buyReward = useCallback((rewardId: string) => {
    setState((s) => {
      const reward = s.rewards.find((r) => r.id === rewardId);
      if (!reward || s.coins < reward.cost) return s;
      return { ...s, coins: s.coins - reward.cost };
    });
  }, []);

  const addReward = useCallback((name: string, description: string, cost: number, emoji: string) => {
    setState((s) => ({
      ...s,
      rewards: [...s.rewards, { id: generateId(), name, description, cost, emoji }],
    }));
  }, []);

  const removeReward = useCallback((rewardId: string) => {
    setState((s) => ({
      ...s,
      rewards: s.rewards.filter((r) => r.id !== rewardId),
    }));
  }, []);

  const clearCompletedQuests = useCallback(() => {
    setState((s) => ({
      ...s,
      quests: s.quests.filter((q) => !q.completed),
    }));
  }, []);

  const addQuest = useCallback((input: CreateQuestInput) => {
    setState((s) => {
      const quest: Quest = {
        id: generateId(),
        ...input,
        completed: false,
        createdAt: Date.now(),
      };
      return { ...s, quests: [...s.quests, quest] };
    });
  }, []);

  const removeQuest = useCallback((questId: string) => {
    setState((s) => ({
      ...s,
      quests: s.quests.filter((q) => q.id !== questId),
    }));
  }, []);

  const addMilestone = useCallback((skillId: string, level: number, title: string) => {
    setState((s) => ({
      ...s,
      skills: s.skills.map((sk) =>
        sk.id === skillId
          ? { ...sk, milestones: [...(sk.milestones || []), { level, title }].sort((a, b) => a.level - b.level) }
          : sk
      ),
    }));
  }, []);

  const removeMilestone = useCallback((skillId: string, index: number) => {
    setState((s) => ({
      ...s,
      skills: s.skills.map((sk) =>
        sk.id === skillId
          ? { ...sk, milestones: (sk.milestones || []).filter((_, i) => i !== index) }
          : sk
      ),
    }));
  }, []);

  const selectTitle = useCallback((title: string) => {
    setState((s) => {
      if (!s.unlockedTitles.includes(title)) return s;
      return { ...s, selectedTitle: title };
    });
  }, []);

  return {
    ...state,
    addSkill,
    removeSkill,
    generateQuest,
    completeQuest,
    buyReward,
    addReward,
    removeReward,
    clearCompletedQuests,
    addQuest,
    removeQuest,
    addMilestone,
    removeMilestone,
    selectTitle,
  };
}
