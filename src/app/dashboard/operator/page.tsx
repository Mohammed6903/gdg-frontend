"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  Bell, 
  Settings, 
  Activity,
  Stethoscope,
  Shield
} from "lucide-react";
import { EmergencyCallCard } from "@/components/EmergencyCallCard";
import { CallDetailsModal } from "@/components/CallModal";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { mockEmergencyCalls } from "@/types/mockData";
import { EmergencyCall } from "@/types/emergency";

const Index = () => {
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const handleViewDetails = (call: EmergencyCall) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  };

  const filteredCalls = mockEmergencyCalls.filter(call => {
    const matchesSearch = call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === "all" || 
                           call.priority.toLowerCase() === filterPriority.toLowerCase();
    
    return matchesSearch && matchesPriority;
  });

  const activeCriticalCalls = mockEmergencyCalls.filter(
    call => call.priority === 'Critical' && call.status === 'active'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <header className="sticky top-0 z-50 bg-card border-b shadow-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-medical rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediCare Emergency</h1>
                <p className="text-xs text-muted-foreground">Healthcare Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-gradient-status text-success-foreground border-success">
              <Shield className="h-3 w-3 mr-1" />
              System Online
            </Badge>
            
            {activeCriticalCalls > 0 && (
              <Badge className="bg-critical text-critical-foreground animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {activeCriticalCalls} Critical
              </Badge>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Metrics Dashboard */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Emergency Response Dashboard</h2>
          </div>
          <DashboardMetrics />
        </section>

        {/* Emergency Calls Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-foreground">Active Emergency Calls</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search calls, patients, locations..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterPriority === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterPriority === "critical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("critical")}
                  className={filterPriority === "critical" ? "bg-critical text-critical-foreground" : ""}
                >
                  Critical
                </Button>
                <Button
                  variant={filterPriority === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("high")}
                >
                  High
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-gradient-medical">
                  <Plus className="h-4 w-4 mr-1" />
                  New Call
                </Button>
              </div>
            </div>
          </div>

          {/* Emergency Calls Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCalls.map((call) => (
              <EmergencyCallCard 
                key={call.id} 
                call={call} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredCalls.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No emergency calls match your current filters.</p>
            </div>
          )}
        </section>
      </main>

      {/* Call Details Modal */}
      <CallDetailsModal 
        call={selectedCall}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Index;