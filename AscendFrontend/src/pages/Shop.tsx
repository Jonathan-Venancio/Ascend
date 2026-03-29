import { useState } from "react";
import { Reward } from "@/stores/useGameStore";
import { Plus, Trash2, ShoppingBag, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Props {
  rewards: Reward[];
  myRewards: any[]; // User rewards with purchase data
  coins: number;
  buyReward: (id: string) => void;
  addReward: (name: string, description: string, cost: number, emoji: string) => void;
  removeReward: (id: string) => void;
}

function formatPurchaseDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Shop({ rewards, myRewards, coins, buyReward, addReward, removeReward }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState(50);
  const [emoji, setEmoji] = useState("🎁");
  const [myRewardsMinimized, setMyRewardsMinimized] = useState(true); // Começa minimizado

  const handleBuy = (reward: Reward) => {
    if (coins < reward.cost) {
      toast.error("Moedas insuficientes!");
      return;
    }
    buyReward(reward.id);
    toast.success(`${reward.emoji} ${reward.name} resgatada!`);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addReward(name.trim(), desc.trim(), cost, emoji);
    setName("");
    setDesc("");
    setCost(50);
    setEmoji("🎁");
    setAdding(false);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-sm text-accent text-glow-purple">🏪 Loja de Recompensas</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">🪙 {coins}</span>
          <button
            onClick={() => setAdding(!adding)}
            className="p-1.5 rounded bg-accent/20 text-accent hover:bg-accent/30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {adding && (
        <div className="rpg-card border-accent/30 space-y-3">
          <div className="flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-12 bg-muted/50 text-center text-foreground rounded px-2 py-2 text-lg border border-border"
              maxLength={2}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da recompensa"
              className="flex-1 bg-muted/50 text-foreground rounded px-3 py-2 text-sm border border-border focus:border-accent focus:outline-none"
            />
          </div>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição"
            className="w-full bg-muted/50 text-foreground rounded px-3 py-2 text-sm border border-border focus:outline-none"
          />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Custo: 🪙</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-20 bg-muted/50 text-foreground rounded px-3 py-2 text-sm border border-border"
              min={1}
            />
            <div className="flex-1" />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-accent text-accent-foreground rounded font-semibold text-sm"
            >
              Criar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rewards.map((reward) => {
          const canBuy = coins >= reward.cost;
          return (
            <div
              key={reward.id}
              className="rpg-card flex items-center gap-3 group"
            >
              <div className="text-3xl">{reward.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{reward.name}</div>
                <div className="text-xs text-muted-foreground">{reward.description}</div>
                <div className="text-xs text-primary mt-1">🪙 {reward.cost}</div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => handleBuy(reward)}
                  disabled={!canBuy}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    canBuy
                      ? "bg-primary text-primary-foreground hover:opacity-90 box-glow-gold"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Resgatar
                </button>
                <button
                  onClick={() => removeReward(reward.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:underline flex items-center justify-center gap-0.5"
                >
                  <Trash2 size={10} /> Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <ShoppingBag size={40} className="mx-auto" />
          <p>Nenhuma recompensa</p>
          <p className="text-xs">Adicione recompensas para se motivar!</p>
        </div>
      )}

      {/* My Rewards Section */}
      {myRewards.length > 0 && (
        <div className="space-y-3">
          <h2 
            className="font-display text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => setMyRewardsMinimized(!myRewardsMinimized)}
          >
            <span className={`transition-transform duration-200 ${myRewardsMinimized ? 'rotate-0' : 'rotate-90'}`}>
              ▶
            </span>
            Minhas Recompensas ({myRewards.length})
          </h2>
          {!myRewardsMinimized && (
            <div className="space-y-2">
              {myRewards.map((userReward) => (
                <div key={userReward.id} className="rpg-card flex items-center gap-3 bg-muted/30">
                  <div className="text-2xl">{userReward.reward.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{userReward.reward.name}</div>
                    <div className="text-xs text-muted-foreground">{userReward.reward.description}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock size={10} />
                      {formatPurchaseDate(userReward.purchased_at)}
                    </div>
                  </div>
                  <div className="text-xs text-primary font-semibold">🪙 {userReward.reward.cost}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
