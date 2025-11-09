import { useState } from 'react';
import EventPage from './components/EventPage';
import RecruiterDashboard from './components/RecruiterDashboard';

function App() {
  const [view, setView] = useState<'recruiter' | 'event'>('recruiter');

  return (
    <div>
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setView('recruiter')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'recruiter'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Recruiter
        </button>
        <button
          onClick={() => setView('event')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'event'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Candidate View
        </button>
      </div>

      {view === 'recruiter' ? <RecruiterDashboard /> : <EventPage />}
    </div>
  );
}

export default App;
