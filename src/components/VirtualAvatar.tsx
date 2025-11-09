import { Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

interface VirtualAvatarProps {
  avatarUrl: string;
  eventTitle: string;
  showCalendar: boolean;
}

export default function VirtualAvatar({ avatarUrl, eventTitle, showCalendar }: VirtualAvatarProps) {
  const handleAddToCalendar = () => {
    const event = {
      title: 'zerohouse launch party',
      description: 'founders world launch party - zerohouse is launching korea\'s first real silicon valley style founders space',
      location: 'zerohouse - to be announced',
      startDate: '2024-12-30T14:00:00',
      endDate: '2024-12-30T17:00:00'
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
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-semibold">Chat with Sam's AI Assistant</h3>
          </div>
          <p className="text-sm text-white/80 mt-1">
            Ask questions about zerohouse, culture, and opportunities
          </p>
        </div>

        <div className="aspect-video bg-gray-950 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">Virtual Avatar Demo</p>
                <p className="text-sm text-gray-400">
                  In production, this will be an embedded HeyGen avatar
                </p>
                <p className="text-xs text-gray-500">
                  Avatar URL: {avatarUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">
              What is zerohouse?
            </button>
            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">
              Company culture?
            </button>
            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">
              Membership benefits?
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Ask
            </button>
          </div>
        </div>
      </div>

      {showCalendar && (
        <button
          onClick={handleAddToCalendar}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          Add to Google Calendar
        </button>
      )}

      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h4 className="text-sm font-semibold mb-2">Get Ready for the Event</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            Profile Complete
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            Reminder Email
          </li>
        </ul>
      </div>
    </div>
  );
}
