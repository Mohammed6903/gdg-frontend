import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Truck, 
  Clock, 
  Users, 
  AlertTriangle, 
  Activity,
  Shield,
  TrendingUp
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'critical' | 'warning' | 'success' | 'default';
}

function MetricCard({ title, value, subtitle, icon, trend, status = 'default' }: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'border-critical shadow-emergency';
      case 'warning': return 'border-warning';
      case 'success': return 'border-success';
      default: return 'border-border shadow-card';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-all duration-200 hover:shadow-medical`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center text-xs ${
              trend.isPositive ? 'text-success' : 'text-emergency'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Calls"
        value={12}
        subtitle="2 critical, 4 high priority"
        icon={<Phone className="h-4 w-4" />}
        status="critical"
        trend={{ value: "+3 from last hour", isPositive: false }}
      />
      <MetricCard
        title="Critical Patients"
        value={3}
        subtitle="Requires immediate attention"
        icon={<AlertTriangle className="h-4 w-4" />}
        status="critical"
      />
    
      <MetricCard
        title="Calls Today"
        value={127}
        subtitle="Peak hours: 2-4 PM"
        icon={<Activity className="h-4 w-4" />}
        trend={{ value: "+15% vs yesterday", isPositive: true }}
      />
      
      <MetricCard
        title="Satisfaction"
        value="4.8/5"
        subtitle="Based on 89 responses"
        icon={<TrendingUp className="h-4 w-4" />}
        status="success"
        trend={{ value: "+0.2 this week", isPositive: true }}
      />
    </div>
  );
}