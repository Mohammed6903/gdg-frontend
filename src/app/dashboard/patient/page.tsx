"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Users,
    Activity,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle,
    UserPlus,
    Search,
    X,
    Filter,
    ArrowRight,
    Phone,
    PhoneCall,
    PhoneOff,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Video,
    VideoOff,
    MessageSquare,
    Settings,
    Signal,
    Pause,
    Play,
    PhoneMissed,
    PhoneIncoming,
    PhoneOutgoing,
    User,
    Shield,
    Zap,
    Timer,
    Circle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import axios from "axios";

export default function PatientDashboard() {
  // Call system state management
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [volume, setVolume] = useState(80);
  const [isRecording, setIsRecording] = useState(false);

  // Emergency and contact data
  const [emergencyContacts] = useState([
    { id: 1, name: "Dr. Sarah Wilson", role: "Emergency Physician", phone: "+1-555-0123", status: "available", priority: "high" },
    { id: 2, name: "Metro Blood Bank", role: "Blood Bank", phone: "+1-555-0124", status: "available", priority: "high" },
    { id: 3, name: "Emergency Response", role: "Emergency Services", phone: "911", status: "available", priority: "critical" },
    { id: 4, name: "Nurse Johnson", role: "Primary Nurse", phone: "+1-555-0125", status: "busy", priority: "medium" },
    { id: 5, name: "Dr. Martinez", role: "Hematologist", phone: "+1-555-0126", status: "available", priority: "high" },
  ]);

  // Call history
  const [callHistory] = useState([
    { id: 1, contact: "Dr. Sarah Wilson", type: "outgoing", duration: "5:32", time: "2 minutes ago", status: "completed" },
    { id: 2, contact: "Metro Blood Bank", type: "incoming", duration: "12:45", time: "1 hour ago", status: "completed" },
    { id: 3, contact: "Emergency Response", type: "outgoing", duration: "3:21", time: "3 hours ago", status: "completed" },
    { id: 4, contact: "Dr. Martinez", type: "missed", duration: "0:00", time: "5 hours ago", status: "missed" },
    { id: 5, contact: "Nurse Johnson", type: "incoming", duration: "8:15", time: "Yesterday", status: "completed" },
  ]);

  // User state
  const [user, setUser] = useState<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // SDK Integration placeholder - replace with actual SDK
  const sdkRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SDK when component mounts
    initializeCallSDK();
    
    // Simulate incoming call after 10 seconds for demo
    const demoTimer = setTimeout(() => {
      simulateIncomingCall();
    }, 10000);

    return () => {
      clearTimeout(demoTimer);
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      // Cleanup SDK
      if (sdkRef.current) {
        sdkRef.current.disconnect?.();
      }
    };
  }, []);

  // SDK initialization
  const initializeCallSDK = () => {
    // Replace with actual SDK initialization
    console.log("Initializing Call SDK...");
    sdkRef.current = {
      // SDK methods would go here
      connect: () => console.log("SDK Connected"),
      disconnect: () => console.log("SDK Disconnected"),
      makeCall: (number: string) => console.log(`Making call to ${number}`),
      endCall: () => console.log("Ending call"),
      mute: () => console.log("Muting call"),
      unmute: () => console.log("Unmuting call"),
    };
  };

  // Call timer effect
  useEffect(() => {
    if (isInCall && callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isInCall, callStatus]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Call functions
  const makeCall = (contact: any) => {
    setCallStatus('calling');
    setIsInCall(true);
    setCallDuration(0);
    
    // SDK integration
    sdkRef.current?.makeCall(contact.phone);
    
    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
      toast.success(`Connected to ${contact.name}`);
    }, 3000);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallStatus('ended');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOn(false);
    setIsRecording(false);
    
    // SDK integration
    sdkRef.current?.endCall();
    
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  };

  const answerCall = () => {
    if (incomingCall) {
      setIsInCall(true);
      setCallStatus('connected');
      setCallDuration(0);
      setIncomingCall(null);
      toast.success(`Call answered from ${incomingCall.name}`);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    toast.info("Call rejected");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      sdkRef.current?.unmute();
      toast.info("Microphone unmuted");
    } else {
      sdkRef.current?.mute();
      toast.info("Microphone muted");
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.info(isVideoOn ? "Video turned off" : "Video turned on");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  };

  const simulateIncomingCall = () => {
    const randomContact = emergencyContacts[Math.floor(Math.random() * emergencyContacts.length)];
    setIncomingCall(randomContact);
  };

  const getCallQualityColor = () => {
    switch (callQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-red-100 text-red-800';
      case 'away': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Circle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="animate-pulse mb-4">
                <PhoneIncoming className="h-16 w-16 mx-auto text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Incoming Call</h3>
              <p className="text-lg font-semibold text-gray-800">{incomingCall.name}</p>
              <p className="text-sm text-gray-600 mb-6">{incomingCall.role}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={answerCall}
                  className="bg-green-600 hover:bg-green-700 rounded-full p-4"
                >
                  <Phone className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={rejectCall}
                  className="bg-red-600 hover:bg-red-700 rounded-full p-4"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Call Center</h1>
          <p className="text-gray-600">
            Emergency communication and medical support system
          </p>
        </div>
        
        {/* Live Status Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 ${isInCall ? 'text-red-600 animate-pulse' : 'text-green-600'} fill-current`} />
            <span className="text-sm font-medium">
              {isInCall ? `On Call - ${formatDuration(callDuration)}` : 'Available'}
            </span>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Signal className="h-3 w-3 mr-1" />
            SDK Connected
          </Badge>
        </div>
      </div>

      {/* Active Call Interface */}
      {isInCall && (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                  {callStatus === 'calling' ? 'Calling...' : 'Connected'}
                </CardTitle>
                <p className="text-sm text-gray-600">Dr. Sarah Wilson - Emergency Physician</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatDuration(callDuration)}</div>
                <div className={`text-sm flex items-center gap-1 ${getCallQualityColor()}`}>
                  <Signal className="h-3 w-3" />
                  {callQuality} quality
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Call Controls */}
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full p-4"
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "outline"}
                size="lg"
                className="rounded-full p-4"
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>

              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="rounded-full p-6"
              >
                <PhoneOff className="h-8 w-8" />
              </Button>

              <Button
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                className="rounded-full p-4"
              >
                {isRecording ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full p-4"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="mt-4 flex items-center gap-3 justify-center">
              <VolumeX className="h-4 w-4 text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32"
              />
              <Volume2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 w-8">{volume}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Quick Dial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Quick access to medical professionals and emergency services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(contact.priority)}
                      <div>
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        <p className="text-xs text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getContactStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                    <Button
                      onClick={() => makeCall(contact)}
                      disabled={isInCall || contact.status === 'busy'}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Calls
            </CardTitle>
            <CardDescription>
              History of your medical consultations and emergency calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">
                      {call.type === 'outgoing' && <PhoneOutgoing className="h-4 w-4" />}
                      {call.type === 'incoming' && <PhoneIncoming className="h-4 w-4" />}
                      {call.type === 'missed' && <PhoneMissed className="h-4 w-4 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{call.contact}</p>
                      <p className="text-sm text-gray-600">{call.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{call.duration}</p>
                    <Badge 
                      variant="outline" 
                      className={call.status === 'missed' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'}
                    >
                      {call.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Profile & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-gray-600">Patient ID: P-2024-001</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">AB-</div>
                  <div className="text-xs text-gray-500">Blood Type</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Critical</div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">SDK Connection</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Call Quality</span>
                <Badge className={`${getCallQualityColor()} bg-opacity-10`}>{callQuality}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Emergency Mode</span>
                <Badge className="bg-red-100 text-red-800">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recording</span>
                <Badge className={isRecording ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                  {isRecording ? "Recording" : "Standby"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => makeCall(emergencyContacts[2])}
                disabled={isInCall}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Call
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => makeCall(emergencyContacts[1])}
                disabled={isInCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Blood Bank
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIncomingCall(emergencyContacts[0])}
              >
                <PhoneIncoming className="h-4 w-4 mr-2" />
                Test Incoming Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
