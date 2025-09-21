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
  Clock,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Activity,
  Heart,
  Shield,
  UserCheck,
  Calendar,
  Mail,
  Home,
  Bot,
  Loader2,
} from "lucide-react"

// == INTERFACES ==
interface TranscriptMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

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
  lastUpdated: Date | null
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

// Initial empty state for user details
const initialUserDetails: UserDetails = {
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
  lastUpdated: null,
}

export default function LiveCallAgentPage() {
  // == STATE MANAGEMENT ==

  // Call State from LiveCallSystem
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended" | "failed">("idle")
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null)
  const [callHistory, setCallHistory] = useState<CallSession[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callType, setCallType] = useState<"emergency" | "support" | "consultation">("support")

  // WebSocket & Audio State from ChatPage
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)

  // User Details & Reports State
  const [userDetails, setUserDetails] = useState<UserDetails>(initialUserDetails)
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [newReport, setNewReport] = useState({
    serviceType: "",
    priority: "medium" as const,
    description: "",
    assignedTo: "",
  })
  const [userLocation, setUserLocation] = useState<string>("")

  // == REFS ==
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptScrollAreaRef = useRef<HTMLDivElement>(null)

  // Refs from ChatPage for WebSocket and Audio
  const wsRef = useRef<WebSocket | null>(null)
  const audioPlayerNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioPlayerContextRef = useRef<AudioContext | null>(null)
  const audioRecorderNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioRecorderContextRef = useRef<AudioContext | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioBufferRef = useRef<Uint8Array[]>([])
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentMessageIdRef = useRef<string | null>(null)

  // == EFFECTS ==

  // Call Timer Effect
  useEffect(() => {
    if (isCallActive && callStatus === "active") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [isCallActive, callStatus])

  // Transcript Auto-scroll Effect
  useEffect(() => {
    if (transcriptScrollAreaRef.current) {
      transcriptScrollAreaRef.current.scrollTop = transcriptScrollAreaRef.current.scrollHeight
    }
  }, [transcript, isAiThinking])

  // Component Cleanup Effect
  useEffect(() => {
    return () => {
      stopVoiceConversation() // Ensure everything is cleaned up on unmount
    }
  }, [])

  // == AUDIO & WEBSOCKET CORE LOGIC (from ChatPage) ==

  const base64ToArray = (base64: string) => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  const convertFloat32ToPCM = (inputData: Float32Array) => {
    const pcm16 = new Int16Array(inputData.length)
    for (let i = 0; i < inputData.length; i++) {
      pcm16[i] = inputData[i] * 0x7fff
    }
    return pcm16.buffer
  }

  const startAudioPlayerWorklet = async () => {
    const audioContext = new AudioContext({ sampleRate: 24000 })
    await audioContext.audioWorklet.addModule("/pcm-player-processor.js")
    const audioPlayerNode = new AudioWorkletNode(audioContext, "pcm-player-processor")
    audioPlayerNode.connect(audioContext.destination)
    return [audioPlayerNode, audioContext] as const
  }

  const startAudioRecorderWorklet = async (audioRecorderHandler: (pcmData: ArrayBuffer) => void) => {
    const audioRecorderContext = new AudioContext({ sampleRate: 16000 })
    await audioRecorderContext.audioWorklet.addModule("/pcm-recorder-processor.js")
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } })
    const source = audioRecorderContext.createMediaStreamSource(micStream)
    const audioRecorderNode = new AudioWorkletNode(audioRecorderContext, "pcm-recorder-processor")
    source.connect(audioRecorderNode)
    audioRecorderNode.port.onmessage = (event) => {
      const pcmData = convertFloat32ToPCM(event.data)
      audioRecorderHandler(pcmData)
    }
    return [audioRecorderNode, audioRecorderContext, micStream] as const
  }

  const audioRecorderHandler = (pcmData: ArrayBuffer) => {
    audioBufferRef.current.push(new Uint8Array(pcmData))
    if (!bufferTimerRef.current) {
      bufferTimerRef.current = setInterval(sendBufferedAudio, 200)
    }
  }

  const sendBufferedAudio = () => {
    if (audioBufferRef.current.length === 0) return
    const totalLength = audioBufferRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
    const combinedBuffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of audioBufferRef.current) {
      combinedBuffer.set(chunk, offset)
      offset += chunk.length
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = { mime_type: "audio/pcm", data: arrayBufferToBase64(combinedBuffer.buffer) }
      wsRef.current.send(JSON.stringify(message))
    }
    audioBufferRef.current = []
  }

  const connectWebSocket = () => {
    return new Promise<void>((resolve, reject) => {
      if (wsRef.current) wsRef.current.close()

      const userId = Math.floor(Math.random() * 10000)
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, "ws")}/ws/${userId}?is_audio=true`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setCallStatus("active")
        console.log("Connected to AI Agent")
        resolve()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.turn_complete) {
          setIsAiThinking(false)
          currentMessageIdRef.current = null
          return
        }

        if (data.mime_type === "audio/pcm" && audioPlayerNodeRef.current && !isMuted) {
          audioPlayerNodeRef.current.port.postMessage(base64ToArray(data.data))
        }

        if (data.mime_type === "text/plain") {
          setIsAiThinking(true)
          if (currentMessageIdRef.current === null) {
            const newId = Math.random().toString(36).substring(7)
            currentMessageIdRef.current = newId
            const newMessage: TranscriptMessage = {
              id: newId,
              content: data.data,
              sender: "ai",
              timestamp: new Date(),
            }
            setTranscript((prev) => [...prev, newMessage])
          } else {
            setTranscript((prev) =>
              prev.map((msg) =>
                msg.id === currentMessageIdRef.current ? { ...msg, content: msg.content + data.data } : msg,
              ),
            )
          }
        }
        
        if (data.mime_type === "user_transcription") {
          const newMessage: TranscriptMessage = {
            id: Math.random().toString(36).substring(7),
            content: data.data,
            sender: "user",
            timestamp: new Date()
          }
          setTranscript((prev) => [...prev, newMessage]);
        }

        if (data.mime_type === "application/json" && data.event === "update_user_details") {
          updateUserDetailsFromSDK(data.payload)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log("Disconnected from AI Agent")
        if (callStatus === "active" || callStatus === "connecting") {
          endCall(true) 
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsConnected(false)
        setCallStatus("failed")
        reject(error)
      }
    })
  }

  const startVoiceConversation = async () => {
    const [playerNode, playerContext] = await startAudioPlayerWorklet()
    audioPlayerNodeRef.current = playerNode
    audioPlayerContextRef.current = playerContext

    const [recorderNode, recorderContext, micStream] = await startAudioRecorderWorklet(audioRecorderHandler)
    audioRecorderNodeRef.current = recorderNode
    audioRecorderContextRef.current = recorderContext
    micStreamRef.current = micStream

    await connectWebSocket()
  }

  const stopVoiceConversation = () => {
    if (bufferTimerRef.current) clearInterval(bufferTimerRef.current)
    bufferTimerRef.current = null
    if (audioBufferRef.current.length > 0) sendBufferedAudio()

    micStreamRef.current?.getTracks().forEach((track) => track.stop())
    audioPlayerContextRef.current?.close()
    audioRecorderContextRef.current?.close()
    wsRef.current?.close()

    audioPlayerNodeRef.current = null
    audioRecorderNodeRef.current = null
    micStreamRef.current = null
    wsRef.current = null
  }

  // == CALL MANAGEMENT LOGIC ==

  const startCall = async () => {
    if (!phoneNumber.trim()) {
      alert("Please enter a phone number")
      return
    }
    setCallStatus("connecting")
    setTranscript([])
    setUserDetails({ ...initialUserDetails, phoneNumber })
    setCallDuration(0)

    try {
      await startVoiceConversation()
      const newCall: CallSession = {
        id: Math.random().toString(36).substring(7),
        startTime: new Date(),
        phoneNumber,
        callType,
        status: "active",
        location: userLocation || "Unknown",
      }
      setCurrentCall(newCall)
      setIsCallActive(true)
    } catch (error) {
      console.error("Failed to start call:", error)
      setCallStatus("failed")
      setTimeout(() => setCallStatus("idle"), 3000)
    }
  }

  const endCall = (unexpected = false) => {
    stopVoiceConversation()

    if (currentCall) {
      const endedCall: CallSession = {
        ...currentCall,
        endTime: new Date(),
        duration: formatDuration(callDuration),
        status: unexpected ? "failed" : "ended",
      }
      setCallHistory((prev) => [endedCall, ...prev])
      setCurrentCall(null)
    }

    setIsCallActive(false)
    setCallStatus(unexpected ? "failed" : "ended")
    if (unexpected) {
        setTimeout(() => setCallStatus("idle"), 3000);
    }
  }

  const toggleMute = () => {
    if (audioPlayerContextRef.current && audioPlayerNodeRef.current) {
        setIsMuted(prev => {
            const nextMuted = !prev;
            if (nextMuted) {
                audioPlayerNodeRef.current?.disconnect();
            } else {
                audioPlayerNodeRef.current?.connect(audioPlayerContextRef.current!.destination);
            }
            return nextMuted;
        });
    }
  }

  // == HELPER & UTILITY FUNCTIONS ==

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const updateUserDetailsFromSDK = (details: Partial<UserDetails>) => {
    setUserDetails((prev) => ({
      ...prev,
      ...details,
      lastUpdated: new Date(),
    }))
  }

  // MODIFIED: This function now sends location to AI and updates the transcript
  const sendLocation = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Cannot send location: Not connected to the call.")
      return
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude
        const locationString = `${lat.toFixed(4)}, ${long.toFixed(4)}`
        const locationMessageForAI = `My current location is latitude: ${lat}, longitude: ${long}. Please acknowledge.`

        // 1. Update local UI state for the agent's view
        setUserLocation(locationString)

        // 2. Create the WebSocket message for the AI
        const messageToSend = {
          mime_type: "text/plain",
          data: locationMessageForAI,
        }
        wsRef.current?.send(JSON.stringify(messageToSend))

        // 3. Append a message to the local transcript for the agent's record
        const transcriptMessage: TranscriptMessage = {
          id: Date.now().toString(),
          content: `📍 Location sent: ${locationString}`,
          sender: "user", // The "user" is the agent in this context
          timestamp: new Date(),
        }
        setTranscript((prev) => [...prev, transcriptMessage])
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to retrieve your location.")
        setUserLocation("Failed to get location")
      },
    )
  }

  const createReport = () => {
    if (!newReport.serviceType || !newReport.description) return
    const report: ServiceReport = {
      id: Math.random().toString(36).substring(7),
      callId: currentCall?.id || "standalone",
      ...newReport,
      status: "pending",
      createdAt: new Date(),
    }
    setReports((prev) => [report, ...prev])
    setNewReport({ serviceType: "", priority: "medium", description: "", assignedTo: "" })
  }

  const emergencyNumbers = [
    { label: "Emergency Services", number: "911", type: "emergency" as const },
    { label: "Police", number: "100", type: "emergency" as const },
  ]

  // == RENDER ==
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Call Interface & Transcript */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-full ring-2 ring-primary/20">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-xl">Live Call Agent</CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                callStatus === "active"
                                  ? "bg-green-500 animate-pulse"
                                  : callStatus === "connecting"
                                    ? "bg-yellow-500 animate-pulse"
                                    : callStatus === "ended" || callStatus === "failed"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                              }`}
                            />
                            <span className="text-sm text-muted-foreground font-medium capitalize">
                              {callStatus === "idle" ? "Ready" : callStatus}
                            </span>
                          </div>
                          {isCallActive && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-accent" />
                              <span className="text-sm text-accent font-medium">{formatDuration(callDuration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center min-h-[150px]">
                    {/* Call Status Display */}
                    {callStatus === "idle" && (
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">Ready to Connect</h3>
                        <p className="text-muted-foreground">Enter a phone number to start a call</p>
                      </div>
                    )}
                    {callStatus === "connecting" && (
                        <div className="text-center space-y-2">
                            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto"/>
                            <h3 className="text-xl font-semibold">Connecting...</h3>
                            <p className="text-muted-foreground">Dialing {phoneNumber}</p>
                        </div>
                    )}
                    {callStatus === "active" && currentCall && (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">Call Active with AI</h3>
                            <p className="text-muted-foreground mb-2">{currentCall.phoneNumber}</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {currentCall.callType.toUpperCase()}
                            </Badge>
                        </div>
                    )}
                    {callStatus === "ended" && (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">Call Ended</h3>
                            <p className="text-muted-foreground">Duration: {formatDuration(callDuration)}</p>
                        </div>
                    )}
                    {callStatus === "failed" && (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-destructive">Call Failed</h3>
                            <p className="text-muted-foreground">Connection was lost.</p>
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
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {emergencyNumbers.map((em, i) => (
                            <Button key={i} variant="outline" size="sm" onClick={() => { setPhoneNumber(em.number); setCallType(em.type); }} className="text-red-600 border-red-200 hover:bg-red-50">
                              <AlertTriangle className="h-4 w-4 mr-2" /> {em.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-4">
                        <Button onClick={toggleMute} variant="outline" size="lg" className={isMuted ? "bg-red-50 border-red-200" : ""}>
                          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        <Button onClick={() => endCall(false)} variant="destructive" size="lg" className="px-8">
                          <PhoneOff className="h-5 w-5 mr-2" /> End Call
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Live Transcript */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" /> Live Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full p-4 border rounded-lg bg-muted/20" ref={transcriptScrollAreaRef}>
                    {transcript.length === 0 && !isCallActive && <p className="text-center text-muted-foreground">Transcript will appear here...</p>}
                    <div className="space-y-4">
                      {transcript.map((message) => (
                        <div key={message.id} className={`flex items-start gap-3 max-w-[85%] ${message.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                          <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-primary/10" : "bg-muted"}`}>
                            {message.sender === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                      {isAiThinking && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-muted"><Bot className="h-4 w-4 text-muted-foreground" /></div>
                          <div className="p-3 rounded-lg bg-background border flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}/>
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg flex items-center">
                      <UserCheck className="h-5 w-5 mr-2 text-primary" /> User Details
                    </CardTitle>
                    {isCallActive && userDetails.lastUpdated && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Live Feed</Badge>}
                  </div>
                  {userDetails.lastUpdated && <p className="text-xs text-muted-foreground">Last updated: {userDetails.lastUpdated.toLocaleTimeString()}</p>}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">{userDetails.name || "Waiting..."}</p>
                      </div>
                       <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">{userDetails.age || "Waiting..."}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">{userDetails.phoneNumber || "Waiting..."}</p>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center"><Heart className="h-4 w-4 mr-1 text-red-500" />Medical Info</h4>
                        <p className="text-xs text-muted-foreground">Conditions: {userDetails.medicalConditions || "Waiting..."}</p>
                        <p className="text-xs text-muted-foreground">Medications: {userDetails.medications || "Waiting..."}</p>
                      </div>
                       <div className="border-t pt-3 mt-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center"><Shield className="h-4 w-4 mr-1 text-blue-500" />Emergency</h4>
                        <p className="text-xs text-muted-foreground">Contact: {userDetails.emergencyContact || "Waiting..."}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* <Card className="shadow-md">
                <CardHeader className="pb-4"><CardTitle className="font-serif text-lg flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" /> Service Report</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Service Type" value={newReport.serviceType} onChange={(e) => setNewReport(prev => ({...prev, serviceType: e.target.value}))}/>
                  <Select value={newReport.priority} onValueChange={(value: any) => setNewReport(prev => ({...prev, priority: value}))}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Description" value={newReport.description} onChange={(e) => setNewReport(prev => ({...prev, description: e.target.value}))} rows={3}/>
                  <Button onClick={createReport} className="w-full">Create Report</Button>
                </CardContent>
              </Card> */}

              {/* MODIFIED: Location Services Card */}
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" /> Location Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={sendLocation}
                    variant="outline"
                    className="w-full"
                    disabled={!isCallActive}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Send Location to AI
                  </Button>
                  {userLocation && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <strong>Last Sent:</strong> {userLocation}
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