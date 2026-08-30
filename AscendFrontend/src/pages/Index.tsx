import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills, convertUserQuestsToQuests } from "@/utils/typeConverters";
import { getRootSkills } from "@/utils/skills";

export default function Index() {
  const store = useGameStoreAPI();
  const rootSkills = getRootSkills(convertUserSkillsToSkills(store.skills));

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Dashboard
        skills={rootSkills}
        quests={convertUserQuestsToQuests(store.quests)}
        coins={store.coins}
        playerLevel={store.playerLevel}
        totalXp={store.totalXp}
      />
    </Layout>
  );
}
