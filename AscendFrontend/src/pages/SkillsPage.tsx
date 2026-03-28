import Layout from "@/components/Layout";
import SkillTree from "@/pages/SkillTree";
import { useGame } from "@/stores/GameContext";

export default function SkillsPage() {
  const store = useGame();
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <SkillTree
        skills={store.skills}
        addSkill={store.addSkill}
        removeSkill={store.removeSkill}
        generateQuest={store.generateQuest}
        addMilestone={store.addMilestone}
        removeMilestone={store.removeMilestone}
      />
    </Layout>
  );
}
