import Layout from "@/components/Layout";
import Quests from "@/pages/Quests";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills, convertUserQuestsToQuests } from "@/utils/typeConverters";

export default function QuestsPage() {
  const store = useGameStoreAPI();

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Quests
        quests={convertUserQuestsToQuests(store.quests)}
        skills={convertUserSkillsToSkills(store.skills)}
        completeQuest={(questId: string) => store.completeQuest(parseInt(questId))}
        clearCompletedQuests={() => Promise.resolve()}
        generateQuest={() => Promise.resolve()}
        addQuest={(quest: any) => store.addQuest(quest)}
        removeQuest={() => Promise.resolve()}
      />
    </Layout>
  );
}
