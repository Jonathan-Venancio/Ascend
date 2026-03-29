import Layout from "@/components/Layout";
import SkillTree from "@/pages/SkillTree";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills } from "@/utils/typeConverters";

export default function SkillsPage() {
  const store = useGameStoreAPI();
  
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <SkillTree
        skills={convertUserSkillsToSkills(store.skills)}
        addSkill={(name: string, parentId: string | null) => 
          store.addSkill(name, parentId ? parseInt(parentId) : null)
        }
        removeSkill={store.removeSkill}
        generateQuest={store.generateQuest}
        addMilestone={store.addMilestone}
        removeMilestone={store.removeMilestone}
      />
    </Layout>
  );
}
