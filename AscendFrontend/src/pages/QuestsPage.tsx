import Layout from "@/components/Layout";
import Quests from "@/pages/Quests";
import { useGame } from "@/stores/GameContext";

export default function QuestsPage() {
  const store = useGame();
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Quests
        quests={store.quests}
        skills={store.skills}
        completeQuest={store.completeQuest}
        clearCompletedQuests={store.clearCompletedQuests}
        generateQuest={store.generateQuest}
        addQuest={store.addQuest}
        removeQuest={store.removeQuest}
      />
    </Layout>
  );
}
