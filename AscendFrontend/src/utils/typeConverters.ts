import { UserSkill, UserQuest, Reward as APIReward } from '@/stores/useGameStoreAPI';
import { Skill as OldSkill, Quest as OldQuest, Reward as OldReward } from '@/stores/useGameStore';

export function convertUserSkillToSkill(userSkill: UserSkill): OldSkill {
  return {
    id: userSkill.skill.id.toString(),
    name: userSkill.skill.name,
    parentId: userSkill.skill.parent_id?.toString() || null,
    level: userSkill.level,
    xp: userSkill.xp,
    xpToNext: userSkill.xp_to_next,
    completed: false,
    color: userSkill.skill.color,
    milestones: userSkill.skill.milestones.map(m => ({
      level: m.level,
      title: m.title
    }))
  };
}

export function convertUserQuestToQuest(userQuest: UserQuest): OldQuest {
  return {
    id: userQuest.quest.id.toString(),
    skillId: userQuest.quest.skill_id.toString(),
    title: userQuest.quest.title,
    description: userQuest.quest.description,
    xpReward: userQuest.quest.xp_reward,
    coinReward: userQuest.quest.coin_reward,
    completed: userQuest.completed,
    completedAt: userQuest.completed_at,
    createdAt: new Date(userQuest.quest.created_at).getTime(),
    dueDate: null,
    recurring: userQuest.quest.recurring,
    recurrenceInterval: userQuest.quest.recurrence_interval as "daily" | "weekly" | "monthly" | null
  };
}

export function convertAPIRewardToReward(apiReward: APIReward): OldReward {
  return {
    id: apiReward.id.toString(),
    name: apiReward.name,
    description: apiReward.description,
    cost: apiReward.cost,
    emoji: apiReward.emoji
  };
}

export function convertUserSkillsToSkills(userSkills: UserSkill[]): OldSkill[] {
  return userSkills.map(convertUserSkillToSkill);
}

export function convertUserQuestsToQuests(userQuests: UserQuest[]): OldQuest[] {
  const converted = userQuests.map(convertUserQuestToQuest);
  
  // Sort completed quests by completed_at (most recent first)
  converted.sort((a, b) => {
    // If both are completed, sort by completion date
    if (a.completed && b.completed && a.completedAt && b.completedAt) {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
    // If only one is completed, put completed ones first
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    // If neither is completed, keep original order
    return 0;
  });
  
  return converted;
}

export function convertAPIRewardsToRewards(apiRewards: APIReward[]): OldReward[] {
  return apiRewards.map(convertAPIRewardToReward);
}
