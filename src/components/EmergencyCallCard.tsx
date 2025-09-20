import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, User, AlertTriangle } from "lucide-react";
import { EmergencyCall } from "@/types/emergency";

interface EmergencyCallCardProps {
  call: EmergencyCall;
  onViewDetails: (call: EmergencyCall) => void;
}

export function EmergencyCallCard({ call, onViewDetails }: EmergencyCallCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-critical text-critical-foreground';
      case 'high':
        return 'bg-emergency text-emergency-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-status-active';
      case 'pending':
        return 'bg-status-pending';
      case 'responding':
        return 'bg-primary';
      default:
        return 'bg-status-offline';
    }
  };

  return (
    <Card className="shadow-card hover:shadow-medical transition-all duration-200 border-l-4" 
          style={{ borderLeftColor: `hsl(var(--${call.priority === 'Critical' ? 'critical' : call.priority === 'High' ? 'emergency' : 'warning'}))` }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {call.priority === 'Critical' && <AlertTriangle className="h-4 w-4 text-critical" />}
            <Badge className={getPriorityColor(call.priority)}>
              {call.priority}
            </Badge>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(call.status)}`} />
            <span className="text-sm text-muted-foreground capitalize">{call.status}</span>
          </div>
          <span className="text-xs text-muted-foreground">#{call.id}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{call.patientName}</span>
          <span className="text-sm text-muted-foreground">({call.patientAge}y)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{call.phoneNumber}</span>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-sm">{call.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{call.callTime}</span>
          <span className="text-xs text-muted-foreground">({call.duration})</span>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-foreground mb-2">{call.complaint}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Responder: {call.responder || 'Unassigned'}
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails(call)}
              className="h-7"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}