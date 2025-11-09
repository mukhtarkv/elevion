import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Room, RemoteTrack, RemoteTrackPublication, createLocalAudioTrack, LocalAudioTrack } from 'livekit-client';

interface StreamingAvatarProps {
  eventTitle: string;
  showCalendar: boolean;
}

interface TranscriptItem {
  role: 'user' | 'avatar';
  text: string;
  timestamp: Date;
}

export default function StreamingAvatar({ eventTitle, showCalendar }: StreamingAvatarProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [message, setMessage] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalAudioTrack | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const addToTranscript = (role: 'user' | 'avatar', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
  };

  const cleanupSession = async () => {
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsMicOn(false);
  };

  const createNewSession = async () => {
    const avatarId = import.meta.env.VITE_HEYGEN_AVATAR_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('Creating new HeyGen session with avatar:', avatarId);
    console.log('Supabase URL:', supabaseUrl);

    if (!avatarId) {
      throw new Error('Please configure VITE_HEYGEN_AVATAR_ID in your .env file');
    }

    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not configured');
    }

    const url = `${supabaseUrl}/functions/v1/heygen-new-session`;
    console.log('Calling Edge Function:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        avatarId: avatarId
      })
    });

    console.log('New session response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('New session error:', errorData);
      throw new Error(errorData.error || 'Failed to create session');
    }

    const data = await response.json();
    console.log('New session response:', data);

    if (!data.sessionId || !data.livekitUrl || !data.roomToken) {
      throw new Error('Invalid session data received');
    }

    return {
      sessionId: data.sessionId,
      livekitUrl: data.livekitUrl,
      roomToken: data.roomToken
    };
  };

  const joinLiveKit = async (livekitUrl: string, roomToken: string) => {
    const room = new Room();
    roomRef.current = room;

    room.on('trackSubscribed', (track: RemoteTrack, publication: RemoteTrackPublication) => {
      if (publication.kind === 'video' && videoRef.current) {
        track.attach(videoRef.current);
      }
    });

    room.on('disconnected', () => {
      addToTranscript('avatar', 'Session ended.');
      setIsStarted(false);
    });

    await room.connect(livekitUrl, roomToken);

    const localTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    });
    localTrackRef.current = localTrack;
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { sessionId, livekitUrl, roomToken } = await createNewSession();
      sessionIdRef.current = sessionId;

      await joinLiveKit(livekitUrl, roomToken);

      setIsStarted(true);
      addToTranscript('avatar', `Hi! I'm here to answer your questions about ${eventTitle}. How can I help you?`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start avatar session';
      setError(errorMessage);
      console.error('Error starting avatar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current || !localTrackRef.current) return;

    try {
      if (isMicOn) {
        await roomRef.current.localParticipant.unpublishTrack(localTrackRef.current);
        setIsMicOn(false);
      } else {
        await roomRef.current.localParticipant.publishTrack(localTrackRef.current);
        setIsMicOn(true);
        addToTranscript('avatar', 'I can hear you now. Feel free to ask your question!');
      }
    } catch (err) {
      console.error('Error toggling mic:', err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !sessionIdRef.current) return;

    const textToSend = message.trim();
    setMessage('');
    addToTranscript('user', textToSend);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/heygen-send-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          text: textToSend,
          taskType: 'repeat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          addToTranscript('avatar', data.reply);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      addToTranscript('avatar', 'Sorry, I had trouble processing that. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAddToCalendar = () => {
    const event = {
      title: eventTitle,
      description: `Event invitation for ${eventTitle}`,
      location: 'To be announced',
      startDate: '2025-01-15T14:00:00',
      endDate: '2025-01-15T17:00:00'
    };

    const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
          <h3 className="font-semibold text-white">Chat with AI Assistant</h3>
          <p className="text-sm text-white/80 mt-1">
            Ask questions about {eventTitle}
          </p>
        </div>

        <div className="aspect-video bg-gray-950 flex items-center justify-center relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    'Start Avatar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border-t border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        {isStarted && (
          <div className="p-4 space-y-3 border-t border-gray-800">
            <div className="flex gap-2">
              <button
                onClick={toggleMic}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isMicOn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isMicOn ? 'Mic On' : 'Mic Off'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-950 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="text-xs text-gray-400 mb-2 font-semibold">Transcript</div>
              <div className="space-y-2">
                {transcript.map((item, i) => (
                  <div key={i} className={`text-sm ${item.role === 'user' ? 'text-purple-300' : 'text-gray-300'}`}>
                    <span className="font-semibold">
                      {item.role === 'user' ? 'You' : 'Assistant'}:
                    </span>{' '}
                    {item.text}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showCalendar && (
        <button
          onClick={handleAddToCalendar}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          Add to Calendar
        </button>
      )}
    </div>
  );
}
