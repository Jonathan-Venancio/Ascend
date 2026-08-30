import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SkillTree from "@/pages/SkillTree";
import { useGameStoreAPI } from "@/stores/useGameStoreAPI";
import { convertUserSkillsToSkills } from "@/utils/typeConverters";
import { buildAvailableSkills, getSkillSubtree } from "@/utils/skills";

export default function SkillTreePage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const store = useGameStoreAPI();

  const allAvailableSkills = buildAvailableSkills(
    store.allSkills,
    convertUserSkillsToSkills(store.skills)
  );

  const rootSkill = allAvailableSkills.find(
    (skill) => skill.id === skillId && skill.parentId === null
  );

  if (store.isLoading || (!rootSkill && store.allSkills.length === 0 && !store.profile)) {
    return (
      <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
        <div className="rpg-card text-center py-10 text-muted-foreground text-sm">
          Carregando árvore...
        </div>
      </Layout>
    );
  }

  if (!skillId || !rootSkill) {
    return (
      <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
        <div className="rpg-card space-y-3 text-center py-10">
          <p className="text-muted-foreground">Habilidade não encontrada.</p>
          <Link to="/skills" className="text-primary text-sm hover:underline">
            Voltar para habilidades
          </Link>
        </div>
      </Layout>
    );
  }

  const treeSkills = getSkillSubtree(allAvailableSkills, rootSkill.id);

  return (
    <Layout coins={store.coins} playerLevel={store.playerLevel} totalXp={store.totalXp}>
      <div className="mb-3">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Todas as habilidades
        </Link>
      </div>

      <SkillTree
        skills={treeSkills}
        title={rootSkill.name}
        showCreateRoot={false}
        addSkill={(name: string, parentId: string | null) =>
          store.addSkill(name, parentId ? parseInt(parentId) : null)
        }
        removeSkill={(id: string) => {
          store.removeSkill(parseInt(id));
          if (id === rootSkill.id) {
            navigate("/skills");
          }
        }}
        generateQuest={(id: string) => store.generateQuest(parseInt(id))}
        addMilestone={(id: string, level: number, title: string) =>
          store.addMilestone(parseInt(id), level, title)
        }
        removeMilestone={(id: string, index: number) =>
          store.removeMilestone(parseInt(id), index)
        }
        acquireSkill={(id: string) => store.acquireSkill(parseInt(id))}
      />
    </Layout>
  );
}
