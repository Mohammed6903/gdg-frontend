import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  Stethoscope, 
  Truck, 
  Navigation,
  FileText
} from "lucide-react";
import { EmergencyCall } from "@/types/emergency";

interface CallDetailsModalProps {
  call: EmergencyCall | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallDetailsModal({ call, open, onOpenChange }: CallDetailsModalProps) {
  if (!call) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-emergency" />
            Emergency Call Details - #{call.id}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Status and Priority */}
            <div className="flex items-center gap-4">
              <Badge className={getPriorityColor(call.priority)} variant="default">
                {call.priority} Priority
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  call.status === 'active' ? 'bg-status-active' :
                  call.status === 'pending' ? 'bg-status-pending' : 'bg-primary'
                }`} />
                <span className="capitalize font-medium">{call.status}</span>
              </div>
            </div>

            <Separator />

            {/* Patient Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{call.patientName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <p className="font-medium">{call.patientAge} years</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium">{call.patientGender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Medical ID</label>
                  <p className="font-medium">{call.medicalId || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Call Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <p className="font-medium">{call.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Call Time</label>
                  <p className="font-medium">{call.callTime}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium">{call.duration}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Caller</label>
                  <p className="font-medium">{call.callerName || 'Self'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </h3>
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <p className="font-medium">{call.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Coordinates</label>
                  <p className="font-medium">{call.coordinates || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nearest Hospital</label>
                  <p className="font-medium">{call.nearestHospital || 'General Hospital (2.1 km)'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Details */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Medical Information
              </h3>
              <div>
                <label className="text-sm text-muted-foreground">Chief Complaint</label>
                <p className="font-medium">{call.complaint}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Symptoms</label>
                <p className="font-medium">{call.symptoms || 'Chest pain, shortness of breath, nausea'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Vitals</label>
                  <p className="font-medium">{call.vitals || 'BP: 160/95, HR: 110'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Allergies</label>
                  <p className="font-medium">{call.allergies || 'Penicillin'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Response Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Response Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Assigned Responder</label>
                  <p className="font-medium">{call.responder || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Unit ID</label>
                  <p className="font-medium">{call.unitId || 'AMB-001'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">ETA</label>
                  <p className="font-medium">{call.eta || '8 minutes'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dispatch Time</label>
                  <p className="font-medium">{call.dispatchTime || '14:23:15'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-gradient-medical">
                <Navigation className="h-4 w-4 mr-2" />
                Track Ambulance
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Medical Records
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}