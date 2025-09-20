"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Activity,
  Heart,
  Shield,
  Zap,
  Settings,
  UserCheck,
  Calendar,
  Hash,
  Mail,
  Home,
  Edit
} from "lucide-react"

interface CallSession {
  id: string
  startTime: Date
  endTime?: Date
  duration?: string
  phoneNumber: string
  callType: "emergency" | "support" | "consultation"
  status: "active" | "ended" | "failed"
  location?: string
}

interface UserDetails {
  name: string
  age: string
  phoneNumber: string
  email: string
  address: string
  emergencyContact: string
  medicalConditions: string
  allergies: string
  medications: string
  bloodType: string
  insuranceNumber: string
  additionalNotes: string
  lastUpdated: Date
}

interface ServiceReport {
  id: string
  callId: string
  serviceType: string
  priority: "low" | "medium" | "high" | "critical"
  description: string
  status: "pending" | "in-progress" | "completed"
  assignedTo?: string
  createdAt: Date
}

export default function LiveCallSystem() {
  // Call State
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle")
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null)
  const [callHistory, setCallHistory] = useState<CallSession[]>([])
  const [callDuration, setCallDuration] = useState(0)
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Phone Input
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callType, setCallType] = useState<"emergency" | "support" | "consultation">("support")
  
  // User Details State - This gets populated during call via SDK
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    age: "",
    phoneNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
    bloodType: "",
    insuranceNumber: "",
    additionalNotes: "",
    lastUpdated: new Date()
  })
  
  // Service Reports
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [newReport, setNewReport] = useState({
    serviceType: "",
    priority: "medium" as const,
    description: "",
    assignedTo: ""
  })
  
  // Location
  const [userLocation, setUserLocation] = useState<string>("")
  
  // Refs for SDK integration
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Simulate call timer
  useEffect(() => {
    if (isCallActive && callStatus === "active") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
        // Simulate receiving user details during call (replace with actual SDK integration)
        simulateSDKDataReceival()
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isCallActive, callStatus])

  // Simulate SDK receiving user details during call
  const simulateSDKDataReceival = () => {
    // This simulates how your SDK would feed user details during the call
    // Replace this with actual SDK integration
    if (callDuration === 5) {
      setUserDetails(prev => ({
        ...prev,
        name: "John Doe",
        phoneNumber: phoneNumber,
        lastUpdated: new Date()
      }))
    }
    if (callDuration === 10) {
      setUserDetails(prev => ({
        ...prev,
        age: "32",
        lastUpdated: new Date()
      }))
    }
    if (callDuration === 15) {
      setUserDetails(prev => ({
        ...prev,
        address: "123 Main St, City, State",
        lastUpdated: new Date()
      }))
    }
    if (callDuration === 20) {
      setUserDetails(prev => ({
        ...prev,
        medicalConditions: "Diabetes Type 2",
        bloodType: "O+",
        lastUpdated: new Date()
      }))
    }
  }

  // SDK Integration Function - Call this when SDK receives user data
  const updateUserDetailsFromSDK = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date()
    }))
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start Call Function
  const startCall = async () => {
    if (!phoneNumber.trim()) {
      alert("Please enter a phone number")
      return
    }

    setCallStatus("connecting")
    
    // Clear previous user details
    setUserDetails({
      name: "",
      age: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      medicalConditions: "",
      allergies: "",
      medications: "",
      bloodType: "",
      insuranceNumber: "",
      additionalNotes: "",
      lastUpdated: new Date()
    })
    
    // Simulate connection delay
    setTimeout(() => {
      const newCall: CallSession = {
        id: Math.random().toString(36).substring(7),
        startTime: new Date(),
        phoneNumber,
        callType,
        status: "active",
        location: userLocation || "Unknown"
      }
      
      setCurrentCall(newCall)
      setIsCallActive(true)
      setCallStatus("active")
      setCallDuration(0)
      setIsRecording(true)
      
      // Initialize audio context for SDK integration
      initializeAudio()
    }, 2000)
  }

  // End Call Function
  const endCall = () => {
    if (currentCall) {
      const endedCall: CallSession = {
        ...currentCall,
        endTime: new Date(),
        duration: formatDuration(callDuration),
        status: "ended"
      }
      
      setCallHistory(prev => [endedCall, ...prev])
      setCurrentCall(null)
    }
    
    setIsCallActive(false)
    setCallStatus("ended")
    setIsRecording(false)
    setCallDuration(0)
    
    // Clean up audio
    cleanupAudio()
    
    // Reset to idle after 2 seconds
    setTimeout(() => {
      setCallStatus("idle")
    }, 2000)
  }

  // Initialize Audio (for SDK integration)
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      audioContextRef.current = new AudioContext()
      
      // Here you would integrate with your actual SDK
      console.log("Audio initialized for SDK integration")
    } catch (error) {
      console.error("Failed to initialize audio:", error)
    }
  }

  // Cleanup Audio
  const cleanupAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Here you would integrate with your SDK to mute/unmute
    console.log("Mute toggled:", !isMuted)
  }

  // Get Location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          setUserLocation(location)
        },
        (error) => {
          console.error("Error getting location:", error)
          setUserLocation("Location unavailable")
        }
      )
    } else {
      setUserLocation("Geolocation not supported")
    }
  }

  // Create Service Report
  const createReport = () => {
    if (!newReport.serviceType || !newReport.description) {
      alert("Please fill in all required fields")
      return
    }

    const report: ServiceReport = {
      id: Math.random().toString(36).substring(7),
      callId: currentCall?.id || "standalone",
      ...newReport,
      status: "pending",
      createdAt: new Date()
    }

    setReports(prev => [report, ...prev])
    setNewReport({
      serviceType: "",
      priority: "medium",
      description: "",
      assignedTo: ""
    })
  }

  // Emergency numbers
  const emergencyNumbers = [
    { label: "Emergency Services", number: "911", type: "emergency" as const },
    { label: "Medical Emergency", number: "112", type: "emergency" as const },
    { label: "Fire Department", number: "101", type: "emergency" as const },
    { label: "Police", number: "100", type: "emergency" as const },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Call Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-full ring-2 ring-primary/20">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-xl">Live Call System</CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              callStatus === "active" ? "bg-green-500 animate-pulse" : 
                              callStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                              callStatus === "ended" ? "bg-red-500" : "bg-gray-400"
                            }`} />
                            <span className="text-sm text-muted-foreground font-medium capitalize">
                              {callStatus === "idle" ? "Ready" : callStatus}
                            </span>
                          </div>
                          {isCallActive && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-accent" />
                              <span className="text-sm text-accent font-medium">
                                {formatDuration(callDuration)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex flex-col h-full">
                  {/* Call Status Display */}
                  <div className="flex-1 flex items-center justify-center">
                    {callStatus === "idle" && (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-16 w-16 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Ready to Connect</h3>
                          <p className="text-muted-foreground">Enter a phone number to start a call</p>
                        </div>
                      </div>
                    )}

                    {callStatus === "connecting" && (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center animate-pulse">
                          <PhoneCall className="h-16 w-16 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
                          <p className="text-muted-foreground">Dialing {phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    {callStatus === "active" && currentCall && (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                          <Activity className="h-16 w-16 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Call Active</h3>
                          <p className="text-muted-foreground mb-2">{currentCall.phoneNumber}</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {currentCall.callType.toUpperCase()}
                          </Badge>
                          <div className="mt-4 text-2xl font-mono font-bold text-primary">
                            {formatDuration(callDuration)}
                          </div>
                        </div>
                        
                        {/* Audio Level Indicator */}
                        <div className="flex justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-8 rounded-full transition-all duration-200 ${
                                i < audioLevel ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              style={{
                                height: `${20 + (i * 8)}px`,
                                animationDelay: `${i * 100}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {callStatus === "ended" && (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                          <PhoneOff className="h-16 w-16 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Call Ended</h3>
                          <p className="text-muted-foreground">Duration: {formatDuration(callDuration)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Call Controls */}
                  <div className="border-t pt-6">
                    {!isCallActive ? (
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <Input
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="flex-1"
                          />
                          <Select value={callType} onValueChange={(value: any) => setCallType(value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-center">
                          <Button
                            onClick={startCall}
                            disabled={callStatus === "connecting"}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                            size="lg"
                          >
                            <PhoneCall className="h-5 w-5 mr-2" />
                            Start Call
                          </Button>
                        </div>

                        {/* Emergency Quick Dial */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {emergencyNumbers.map((emergency, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPhoneNumber(emergency.number)
                                setCallType(emergency.type)
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {emergency.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={toggleMute}
                          variant="outline"
                          size="lg"
                          className={isMuted ? "bg-red-50 border-red-200" : ""}
                        >
                          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        
                        <Button
                          onClick={endCall}
                          variant="destructive"
                          size="lg"
                          className="px-8"
                        >
                          <PhoneOff className="h-5 w-5 mr-2" />
                          End Call
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              {/* User Details - Populated during call via SDK */}
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg flex items-center">
                      <UserCheck className="h-5 w-5 mr-2 text-primary" />
                      User Details
                    </CardTitle>
                    {isCallActive && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        Live Feed
                      </Badge>
                    )}
                  </div>
                  {userDetails.lastUpdated && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {userDetails.lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm font-medium">
                              {userDetails.name || "Waiting..."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="text-sm font-medium">
                              {userDetails.age || "Waiting..."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">
                              {userDetails.phoneNumber || phoneNumber || "Waiting..."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">
                              {userDetails.email || "Waiting..."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Address</p>
                            <p className="text-sm font-medium">
                              {userDetails.address || "Waiting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          Medical Information
                        </h4>
                        
                        <div className="space-y-2">
                          {/* <div>
                            <p className="text-xs text-muted-foreground">Blood Type</p>
                            <p className="text-sm font-medium">
                              {userDetails.bloodType || "Waiting..."}
                            </p>
                          </div> */}
                          
                          <div>
                            <p className="text-xs text-muted-foreground">Medical Conditions</p>
                            <p className="text-sm">
                              {userDetails.medicalConditions || "Waiting..."}
                            </p>
                          </div>
                          
                          {/* <div>
                            <p className="text-xs text-muted-foreground">Allergies</p>
                            <p className="text-sm">
                              {userDetails.allergies || "Waiting..."}
                            </p>
                          </div>
                           */}
                          <div>
                            <p className="text-xs text-muted-foreground">Current Medications</p>
                            <p className="text-sm">
                              {userDetails.medications || "Waiting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-blue-500" />
                          Emergency Contact
                        </h4>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Emergency Contact</p>
                            <p className="text-sm">
                              {userDetails.emergencyContact || "Waiting..."}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground">Insurance Number</p>
                            <p className="text-sm">
                              {userDetails.insuranceNumber || "Waiting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {userDetails.additionalNotes && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-semibold mb-2">Additional Notes</h4>
                          <p className="text-sm text-muted-foreground">
                            {userDetails.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Service Report */}
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Service Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Service Type"
                      value={newReport.serviceType}
                      onChange={(e) => setNewReport(prev => ({...prev, serviceType: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <Select 
                      value={newReport.priority} 
                      onValueChange={(value: any) => setNewReport(prev => ({...prev, priority: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Textarea
                      placeholder="Description"
                      value={newReport.description}
                      onChange={(e) => setNewReport(prev => ({...prev, description: e.target.value}))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Input
                      placeholder="Assigned To"
                      value={newReport.assignedTo}
                      onChange={(e) => setNewReport(prev => ({...prev, assignedTo: e.target.value}))}
                    />
                  </div>

                  <Button onClick={createReport} className="w-full">
                    Create Report
                  </Button>
                </CardContent>
              </Card>

              {/* Location Services */}
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Location Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Current Location
                  </Button>
                  {userLocation && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <strong>Location:</strong> {userLocation}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}