import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import { useGame } from "@/stores/GameContext";

export default function Index() {
  const store = useGame();
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Dashboard
        skills={store.skills}
        quests={store.quests}
        coins={store.coins}
        playerLevel={store.playerLevel}
        totalXp={store.totalXp}
      />
    </Layout>
  );
}
