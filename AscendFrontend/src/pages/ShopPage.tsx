import Layout from "@/components/Layout";
import Shop from "@/pages/Shop";
import { useGame } from "@/stores/GameContext";

export default function ShopPage() {
  const store = useGame();
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Shop
        rewards={store.rewards}
        coins={store.coins}
        buyReward={store.buyReward}
        addReward={store.addReward}
        removeReward={store.removeReward}
      />
    </Layout>
  );
}
