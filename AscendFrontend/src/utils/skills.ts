import { Skill } from "@/stores/useGameStore";

type ApiSkill = {
  id: number;
  name: string;
  parent_id: number | null;
  color: string;
  milestones: { level: number; title: string }[];
};

export function buildAvailableSkills(
  allSkills: ApiSkill[],
  userSkills: Skill[]
): Skill[] {
  const userSkillMap = new Map(userSkills.map((skill) => [skill.id, skill]));

  return allSkills.map((skill) => {
    const userSkill = userSkillMap.get(skill.id.toString());

    return {
      id: skill.id.toString(),
      name: skill.name,
      parentId: skill.parent_id?.toString() || null,
      level: userSkill?.level ?? 1,
      xp: userSkill?.xp ?? 0,
      xpToNext: userSkill?.xpToNext ?? 100,
      completed: false,
      color: skill.color,
      acquired: !!userSkill,
      milestones: skill.milestones.map((m) => ({
        level: m.level,
        title: m.title,
      })),
    };
  });
}

/** Retorna a skill raiz + todos os descendentes. */
export function getSkillSubtree(skills: Skill[], rootId: string): Skill[] {
  const ids = new Set<string>();

  const collect = (id: string) => {
    ids.add(id);
    skills
      .filter((skill) => skill.parentId === id)
      .forEach((child) => collect(child.id));
  };

  collect(rootId);
  return skills.filter((skill) => ids.has(skill.id));
}

export function getRootSkills(skills: Skill[]): Skill[] {
  return skills.filter((skill) => skill.parentId === null);
}
