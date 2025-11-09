export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  host: {
    name: string;
    avatar: string;
  };
  attendees: {
    count: number;
    avatars: string[];
  };
  description: string;
  highlights: string[];
  avatarUrl: string;
  coverImage: string;
  promoImage?: string;
  avatarKnowledgeFiles?: string[];
}

let currentEvent: Event = {
  id: "1",
  title: "zerohouse launch party.",
  subtitle: "founders world launch party.",
  date: "Saturday, December 30",
  time: "2:00 PM - 5:00 PM",
  location: "zerohouse - to be announced",
  host: {
    name: "Sam Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
  },
  attendees: {
    count: 78,
    avatars: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    ]
  },
  description: `zerohouse is launching korea's first real silicon valley style founders space right in the heart of seoul.

this is not a normal co-working space in korea.

zerohouse is built entirely for founders, especially those who are serious about going global with resources.

most co-working spaces in korea offer a nice desk and pretty interiors but this is not what founders need trying to go global lol.

they need to learn directly from founders at YC, a16z, founders inc. and buildspace, plus experience real san francisco trips and friday night demo day sessions.

so here's what zerohouse offers.`,
  highlights: [
    "san francisco trip.",
    "english only culture.",
    "online / offline 1 on 1 memberships.",
    "home for top ambitious founders"
  ],
  avatarUrl: "https://share.heygen.com/embeds/example",
  coverImage: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #8b5cf6 100%)"
};

export const getEvent = async (eventId: string): Promise<Event> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentEvent);
    }, 300);
  });
};

export const updateEvent = async (eventData: Partial<Event>): Promise<Event> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentEvent = { ...currentEvent, ...eventData };
      resolve(currentEvent);
    }, 300);
  });
};

export const submitRSVP = async (eventId: string, response: 'accept' | 'decline'): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`RSVP ${response} for event ${eventId}`);
      resolve({ success: true });
    }, 500);
  });
};
