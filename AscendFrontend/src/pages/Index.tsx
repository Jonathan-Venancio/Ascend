import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills, convertUserQuestsToQuests } from "@/utils/typeConverters";

export default function Index() {
  const store = useGameStoreAPI();

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Dashboard
        skills={convertUserSkillsToSkills(store.skills)}
        quests={convertUserQuestsToQuests(store.quests)}
        coins={store.coins}
        playerLevel={store.playerLevel}
        totalXp={store.totalXp}
      />
    </Layout>
  );
}
