import Layout from "@/components/Layout";
import SkillTree from "@/pages/SkillTree";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills } from "@/utils/typeConverters";

export default function SkillsPage() {
  const store = useGameStoreAPI();
  
  // Get user's acquired skills with real levels and XP
  const userSkills = convertUserSkillsToSkills(store.skills);
  
  // Create a map of user skill data for quick lookup
  const userSkillMap = new Map();
  userSkills.forEach(skill => {
    userSkillMap.set(skill.id, skill);
  });
  
  // Show all available skills, but with real data for acquired ones
  const allAvailableSkills = store.allSkills.map(skill => {
    const userSkill = userSkillMap.get(skill.id.toString());
    
    if (userSkill) {
      // Use real data from acquired skill
      return {
        id: skill.id.toString(),
        name: skill.name,
        parentId: skill.parent_id?.toString() || null,
        level: userSkill.level,
        xp: userSkill.xp,
        xpToNext: userSkill.xpToNext,
        completed: false,
        color: skill.color,
        milestones: skill.milestones.map(m => ({
          level: m.level,
          title: m.title
        }))
      };
    } else {
      // Use default data for unacquired skills
      return {
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
      };
    }
  });
  
  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <SkillTree
        skills={allAvailableSkills}
        addSkill={(name: string, parentId: string | null) => 
          store.addSkill(name, parentId ? parseInt(parentId) : null)
        }
        removeSkill={(id: string) => store.removeSkill(parseInt(id))}
        generateQuest={(skillId: string) => store.generateQuest(parseInt(skillId))}
        addMilestone={(skillId: string, level: number, title: string) => 
          store.addMilestone(parseInt(skillId), level, title)
        }
        removeMilestone={(skillId: string, index: number) => 
          store.removeMilestone(parseInt(skillId), index)
        }
        acquireSkill={(skillId: string) => store.acquireSkill(parseInt(skillId))}
      />
    </Layout>
  );
}
