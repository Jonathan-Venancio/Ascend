import Layout from "@/components/Layout";
import Shop from "@/pages/Shop";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertAPIRewardsToRewards } from "@/utils/typeConverters";

export default function ShopPage() {
  const store = useGameStoreAPI();
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <Shop
        rewards={convertAPIRewardsToRewards(store.rewards)}
        myRewards={store.myRewards}
        coins={store.coins}
        buyReward={(rewardId: string) => store.buyReward(parseInt(rewardId))}
        addReward={store.addReward}
        removeReward={() => Promise.resolve()}
      />
    </Layout>
  );
}
