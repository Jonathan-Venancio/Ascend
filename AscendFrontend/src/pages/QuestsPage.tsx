import Layout from "@/components/Layout";
import Quests from "@/pages/Quests";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills, convertUserQuestsToQuests } from "@/utils/typeConverters";

export default function QuestsPage() {
  const store = useGameStoreAPI();

  // Show all available skills for quest generation, not just acquired ones
  const allAvailableSkills = store.allSkills.map(skill => ({
    id: skill.id.toString(),
    name: skill.name,
    parentId: skill.parent_id?.toString() || null,
    level: 1,
    xp: 0,
    xpToNext: 100,
    completed: false,
    color: skill.color,
    milestones: skill.milestones.map(m => ({
      level: m.level,
      title: m.title
    }))
  }));

  // Convert all available quests (not just user quests)
  const allAvailableQuests = store.allQuests.map(quest => ({
    id: quest.id.toString(),
    skillId: quest.skill_id.toString(),
    title: quest.title,
    description: quest.description,
    xpReward: quest.xp_reward,
    coinReward: quest.coin_reward,
    completed: false, // Available quests are not completed yet
    createdAt: new Date(quest.created_at).getTime(),
    dueDate: null,
    recurring: quest.recurring,
    recurrenceInterval: quest.recurrence_interval || null
  }));

  // Combine user quests with available quests
  const userQuests = convertUserQuestsToQuests(store.quests);
  const allQuests = [...userQuests, ...allAvailableQuests.filter(
    // Don't duplicate quests that user already has
    available => !userQuests.some(user => user.id === available.id.toString())
  )];

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Quests
        quests={allQuests}
        skills={allAvailableSkills}
        completeQuest={(questId: string) => store.completeQuest(parseInt(questId))}
        generateQuest={(skillId: string) => store.generateQuest(parseInt(skillId))}
        addQuest={(quest: any) => store.addQuest(quest)}
        removeQuest={(questId: string) => store.removeQuest(parseInt(questId))}
      />
    </Layout>
  );
}
