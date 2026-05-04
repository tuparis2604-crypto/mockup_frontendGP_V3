import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Lock, User, LogOut, Award } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [userName] = useState("João Silva");
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [faixa, setFaixa] = useState("ciclo-ii");

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <DashboardLayout
      userName={userName}
      userRole="Gestor"
      onLogout={handleLogout}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações de conta.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <User size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome Completo
              </label>
              <Input
                type="text"
                value={userName}
                disabled
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-mail Corporativo
              </label>
              <Input
                type="email"
                value="joao.silva@empresa.com"
                disabled
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Departamento
              </label>
              <Input
                type="text"
                value="Tecnologia"
                disabled
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Faixa (Ciclo de Desenvolvimento)
              </label>
              <Select value={faixa} onValueChange={setFaixa}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ciclo-i">Ciclo I - Faixas Branca, Amarelo e Roxo</SelectItem>
                  <SelectItem value="ciclo-ii">Ciclo II - Faixas Verde, Azul e Marrom</SelectItem>
                  <SelectItem value="ciclo-iii">Ciclo III - Faixa Preto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                A faixa influencia as competências prioritárias e expectativas de desenvolvimento.
              </p>
            </div>
          </div>
        </Card>

        {/* Development Level */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <Award size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Nível de Desenvolvimento</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="font-medium text-foreground mb-2">Faixa Atual: Ciclo II - Intermediário</p>
              <div className="w-full bg-border rounded-full h-2 mb-3">
                <div className="bg-accent h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Você está progredindo bem. Continue registrando seus desenvolvimentos para avançar.
              </p>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <Bell size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Notificações no Sistema</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receba alertas sobre novos registros e comentários
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Atualizações por E-mail</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receba resumos semanais de atividades
                </p>
              </div>
              <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <Lock size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Segurança</h2>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Gerenciar Sessões Ativas
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ativar Autenticação de Dois Fatores
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-4 mb-6">
            <LogOut size={24} className="text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Zona de Risco</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-red-800">
              Estas ações são irreversíveis. Tenha cuidado ao prosseguir.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Fazer Logout
            </Button>
            <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
              Desativar Conta
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
