import { useState, useEffect, useCallback } from 'react';
import { skillsAPI, questsAPI, rewardsAPI, profileAPI } from '@/lib/api';
import { toast } from 'sonner';

export interface SkillMilestone {
  level: number;
  title: string;
}

export interface Skill {
  id: number;
  name: string;
  parent_id: number | null;
  color: string;
  created_at: string;
  milestones: SkillMilestone[];
}

export interface UserSkill {
  id: number;
  skill_id: number;
  level: number;
  xp: number;
  xp_to_next: number;
  skill: Skill;
}

export interface Quest {
  id: number;
  skill_id: number;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  recurring: boolean;
  recurrence_interval?: "daily" | "weekly" | "monthly" | null;
  created_at: string;
  skill: Skill;
}

export interface UserQuest {
  id: number;
  quest_id: number;
  completed: boolean;
  completed_at?: string;
  quest: {
    id: number;
    skill_id: number;
    title: string;
    description: string;
    xp_reward: number;
    coin_reward: number;
    recurring: boolean;
    recurrence_interval?: string;
    created_at: string;
    skill: {
      id: number;
      name: string;
      parent_id?: number;
      color: string;
      created_at: string;
    };
  };
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  created_at: string;
}

export interface UserReward {
  id: number;
  reward_id: number;
  purchased_at: string;
  reward: Reward;
}

export interface Profile {
  user: {
    id: number;
    username: string;
    email: string;
    coins: number;
    total_xp: number;
    player_level: number;
    selected_title: string;
    created_at: string;
  };
  skills: UserSkill[];
  quests: UserQuest[];
  unlocked_titles: string[];
  user_rewards: UserReward[];
}

export interface CreateQuestInput {
  skill_id: number;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  dueDate?: number | null;
  recurring: boolean;
  recurrence_interval?: "daily" | "weekly" | "monthly" | null;
}

export function useGameStoreAPI() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, skillsRes, questsRes, rewardsRes] = await Promise.all([
        profileAPI.get(),
        skillsAPI.getAll(),
        questsAPI.getAll(),
        rewardsAPI.getAll(),
      ]);

      setProfile(profileRes.data);
      setAllSkills(skillsRes.data);
      setAllQuests(questsRes.data);
      setAllRewards(rewardsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Skills
  const addSkill = useCallback(async (name: string, parentId: number | null) => {
    try {
      const response = await skillsAPI.create({ name, parent_id: parentId });
      setAllSkills(prev => [...prev, response.data]);
      toast.success('Skill created successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create skill');
      throw error;
    }
  }, []);

  const removeSkill = useCallback(async (skillId: number) => {
    try {
      await skillsAPI.delete(skillId);
      setAllSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast.success('Skill deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete skill');
      throw error;
    }
  }, []);

  const acquireSkill = useCallback(async (skillId: number) => {
    try {
      await skillsAPI.acquire(skillId);
      // Reload to get updated user skills and profile
      await loadData(); 
      toast.success('Skill acquired successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to acquire skill');
      throw error;
    }
  }, [loadData]);

  const addMilestone = useCallback(async (skillId: number, level: number, title: string) => {
    try {
      const response = await skillsAPI.addMilestone(skillId, { level, title });
      await loadData(); // Reload to get updated skills with milestones
      toast.success('Milestone added successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add milestone');
      throw error;
    }
  }, [loadData]);

  const removeMilestone = useCallback(async (skillId: number, level: number) => {
    try {
      await skillsAPI.removeMilestone(skillId, level);
      await loadData(); // Reload to get updated skills with milestones
      toast.success('Milestone removed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to remove milestone');
      throw error;
    }
  }, [loadData]);

  // Quests
  const addQuest = useCallback(async (input: any) => {
    try {
      // Convert frontend format to backend format
      const backendData = {
        skill_id: parseInt(input.skillId),
        title: input.title,
        description: input.description,
        xp_reward: input.xpReward,
        coin_reward: input.coinReward,
        recurring: input.recurring || false,
        recurrence_interval: input.recurrenceInterval || null,
      };
      
      const response = await questsAPI.create(backendData);
      setAllQuests(prev => [...prev, response.data]);
      toast.success('Quest created successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create quest');
      throw error;
    }
  }, []);

  const generateQuest = useCallback(async (skillId: number) => {
    try {
      const response = await questsAPI.generate(skillId);
      setAllQuests(prev => [...prev, response.data]);
      toast.success('Quest generated successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quest');
      throw error;
    }
  }, []);

  const removeQuest = useCallback(async (questId: number) => {
    try {
      await questsAPI.delete(questId);
      // Remove from local state immediately
      setAllQuests(prev => prev.filter(quest => quest.id !== questId));
      toast.success('Quest deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete quest');
      throw error;
    }
  }, []);

  const assignQuest = useCallback(async (questId: number) => {
    try {
      await questsAPI.assign(questId);
      await loadData(); // Reload to get updated user quests
      toast.success('Quest assigned successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to assign quest');
      throw error;
    }
  }, [loadData]);

  const completeQuest = useCallback(async (questId: number) => {
    try {
      const response = await questsAPI.complete(questId);
      await loadData(); // Reload to get updated profile
      
      toast.success(response.data.message);
      if (response.data.new_level) {
        toast.success(`Congratulations! You reached level ${response.data.new_level}!`);
      }
      if (response.data.titles_unlocked.length > 0) {
        toast.success(`Titles unlocked: ${response.data.titles_unlocked.join(', ')}`);
      }
      
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete quest');
      throw error;
    }
  }, [loadData]);

  // Rewards
  const buyReward = useCallback(async (rewardId: number) => {
    try {
      const response = await rewardsAPI.buy(rewardId);
      await loadData(); // Reload to get updated profile
      toast.success(response.data.message);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to buy reward');
      throw error;
    }
  }, [loadData]);

  const addReward = useCallback(async (name: string, description: string, cost: number, emoji: string) => {
    try {
      const response = await rewardsAPI.create({ name, description, cost, emoji });
      setAllRewards(prev => [...prev, response.data]);
      toast.success('Reward created successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create reward');
      throw error;
    }
  }, []);

  // Profile
  const updateTitle = useCallback(async (title: string) => {
    try {
      await profileAPI.updateTitle(title);
      await loadData(); // Reload to get updated profile
      toast.success(`Title updated to "${title}"`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update title');
      throw error;
    }
  }, [loadData]);

  return {
    // Data
    profile,
    allSkills,
    allQuests,
    allRewards,
    isLoading,
    
    // Computed properties (for compatibility with existing components)
    skills: profile?.skills || [],
    quests: profile?.quests || [],
    myRewards: profile?.user_rewards || [],
    rewards: allRewards,
    coins: profile?.user.coins || 0,
    totalXp: profile?.user.total_xp || 0,
    playerLevel: profile?.user.player_level || 1,
    unlockedTitles: profile?.unlocked_titles || [],
    selectedTitle: profile?.user.selected_title || 'Novato',
    
    // Actions
    addSkill,
    removeSkill,
    acquireSkill,
    addMilestone,
    removeMilestone,
    addQuest,
    generateQuest,
    removeQuest,
    assignQuest,
    completeQuest,
    buyReward,
    addReward,
    updateTitle,
    loadData,
    
    // Legacy methods for compatibility
    clearCompletedQuests: async () => toast.error('Not implemented yet'),
    selectTitle: updateTitle,
  };
}
