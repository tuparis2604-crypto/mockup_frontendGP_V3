import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluateCheckin } from "@/lib/api";

interface CheckinEvaluationButtonProps {
  checkinId: string;
  currentEvaluation?: "valid" | "invalid" | null;
  onEvaluate?: (status: "valid" | "invalid", pointsModifier: number) => void;
}

export default function CheckinEvaluationButton({
  checkinId,
  currentEvaluation,
  onEvaluate,
}: CheckinEvaluationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const handleEvaluate = async (status: "valid" | "invalid") => {
    setLoading(true);
    try {
      const result = await evaluateCheckin(checkinId, status);
      if (result.success) {
        setFeedback(
          status === "valid"
            ? "✓ Check-in validado (+10 pontos)"
            : "✗ Check-in invalidado (-5 pontos)"
        );
        onEvaluate?.(status, result.points_modifier || 0);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (error) {
      setFeedback("Erro ao avaliar check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={currentEvaluation === "valid" ? "default" : "outline"}
          onClick={() => handleEvaluate("valid")}
          disabled={loading}
          className="gap-1"
          title="Validar check-in (+10 pontos)"
        >
          <ThumbsUp size={16} />
          <span className="hidden sm:inline">Válido</span>
        </Button>
        <Button
          size="sm"
          variant={currentEvaluation === "invalid" ? "destructive" : "outline"}
          onClick={() => handleEvaluate("invalid")}
          disabled={loading}
          className="gap-1"
          title="Invalidar check-in (-5 pontos)"
        >
          <ThumbsDown size={16} />
          <span className="hidden sm:inline">Inválido</span>
        </Button>
      </div>
      {feedback && (
        <span className="text-xs text-muted-foreground ml-2">{feedback}</span>
      )}
    </div>
  );
}
