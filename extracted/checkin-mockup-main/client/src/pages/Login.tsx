import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Card from "@/components/Card";
import { requestOtp, verifyOtp } from "@/lib/api";

export default function Login() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const result = await requestOtp(email);
      if (result.success) {
        setStep("otp");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erro ao solicitar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        setLocation("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erro ao verificar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src="/logo-asbz.png" alt="ASBZ" className="h-32 mx-auto mb-6 object-contain" />
          <p className="text-muted-foreground text-sm">Desenvolvimento Contínuo de Pessoas</p>
        </div>

        {/* Login Card */}
        <Card>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Bem-vindo</h2>
                <p className="text-sm text-muted-foreground">
                  Insira seu e-mail corporativo para acessar a plataforma.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  E-mail Corporativo
                </label>
                <Input
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={!email || loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Enviando..." : "Receber Código"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Você receberá um código de acesso por e-mail. Este código é válido por 15 minutos.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Verificar Código</h2>
                <p className="text-sm text-muted-foreground">
                  Insira o código de 6 dígitos enviado para <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Código de Acesso
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-widest"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Verificando..." : "Acessar"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Voltar
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Não recebeu o código? Verifique sua pasta de spam ou solicite um novo código.
              </p>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <p className="font-semibold text-blue-900 mb-2">Modo MOCK (Teste)</p>
            <div className="space-y-1 text-blue-800 mb-2">
              <p><strong>joao@company.com</strong> - RH</p>
              <p><strong>maria@company.com</strong> - Sócio</p>
              <p><strong>carlos@company.com</strong> - Gestor</p>
              <p><strong>ana@company.com</strong> - Colaborador</p>
            </div>
            <p className="text-blue-800">
              OTP: <strong>123456</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
