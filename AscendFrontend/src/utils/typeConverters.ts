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
    createdAt: new Date(userQuest.quest.created_at).getTime(),
    dueDate: null,
    recurring: userQuest.quest.recurring,
    recurrenceInterval: userQuest.quest.recurrence_interval || null
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
  return userQuests.map(convertUserQuestToQuest);
}

export function convertAPIRewardsToRewards(apiRewards: APIReward[]): OldReward[] {
  return apiRewards.map(convertAPIRewardToReward);
}
