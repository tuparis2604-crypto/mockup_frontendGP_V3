import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Progress from "@/pages/Progress";
import NewRecord from "@/pages/NewRecord";
import MyTeam from "@/pages/MyTeam";
import ManagedProgress from "@/pages/ManagedProgress";
import Dashboards from "@/pages/Dashboards";
import Summary from "@/pages/Summary";
import Settings from "@/pages/Settings";
import PersonalDashboard from "@/pages/PersonalDashboard";
import DevelopmentMap from "@/pages/DevelopmentMap";
import PeriodStart from "@/pages/PeriodStart";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Home} />
      <Route path={"/?from_webdev=1"} component={Home} />
      <Route path={"/avisos"} component={Alerts} />
      <Route path={"/progresso"} component={Progress} />
      <Route path={"/novo-registro"} component={NewRecord} />
      <Route path={"/meu-time"} component={MyTeam} />
      <Route path={"/gerido/:id"} component={ManagedProgress} />
      <Route path={"/dashboards"} component={Dashboards} />
      <Route path={"/resumo"} component={Summary} />
      <Route path={"/configuracoes"} component={Settings} />
      <Route path={"/dashboard-pessoal"} component={PersonalDashboard} />
      <Route path={"/mapa-desenvolvimento"} component={DevelopmentMap} />
      <Route path={"/inicio-periodo/:userId"} component={PeriodStart} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
