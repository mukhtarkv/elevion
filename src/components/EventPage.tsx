import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { Event, getEvent, submitRSVP } from '../services/mockApi';
import StreamingAvatar from './StreamingAvatar';

export default function EventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const data = await getEvent('1');
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (response: 'accept' | 'decline') => {
    if (!event) return;

    setSubmitting(true);
    try {
      await submitRSVP(event.id, response);
      setRsvpStatus(response === 'accept' ? 'accepted' : 'declined');
    } catch (error) {
      console.error('Failed to submit RSVP:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {event.promoImage ? (
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src={event.promoImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="rounded-2xl p-8 sm:p-12 aspect-[4/3] flex flex-col justify-between"
                style={{ background: event.coverImage }}
              >
                <div className="text-white">
                  <div className="text-sm font-medium mb-2">ZEROHOUSE</div>
                  <div className="text-xs opacity-75">ZEROBASE</div>
                </div>
              </div>
            )}

            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{event.title}</h1>

              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">{event.date}</div>
                    <div className="text-sm">{event.time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div className="text-sm">{event.location}</div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm">Starting in 41d 20h</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-2">
                        {event.attendees.avatars.map((avatar, i) => (
                          <img
                            key={i}
                            src={avatar}
                            alt=""
                            className="w-8 h-8 rounded-full border-2 border-black"
                          />
                        ))}
                      </div>
                      <span className="text-sm">
                        Filicia Salam, Robert Zhuang and {event.attendees.count} others
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-semibold mb-2">Hosted By</h3>
              <div className="flex items-center gap-3">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{event.host.name}</span>
              </div>
              <div className="mt-3 text-sm text-gray-400">
                <div>80 Going</div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-xl font-semibold mb-4">About Event</h3>
              <div className="space-y-4">
                <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                  {event.description}
                </div>

                <ul className="space-y-2">
                  {event.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400">✓</span>
                      <span className="text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {rsvpStatus === 'pending' && (
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => handleRSVP('accept')}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept Invitation
                </button>
                <button
                  onClick={() => handleRSVP('decline')}
                  disabled={submitting}
                  className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Decline
                </button>
              </div>
            )}

            {rsvpStatus === 'accepted' && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">You're attending!</div>
                  <div className="text-sm text-gray-300">Add to calendar to get reminders</div>
                </div>
              </div>
            )}

            {rsvpStatus === 'declined' && (
              <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <div className="text-gray-300">
                  You've declined this invitation
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <StreamingAvatar
              eventTitle={event.title}
              showCalendar={rsvpStatus === 'accepted'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
