import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { sendEventInvitation } from '../services/emailService';

export default function EmailDemo() {
  const [email, setEmail] = useState('marc@farm360.ai');
  const [name, setName] = useState('KUSSAIYNBEKOV MUKHTAR');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendInvite = async () => {
    setSending(true);
    setResult(null);

    const inviteLink = window.location.origin;

    const response = await sendEventInvitation({
      to: email,
      name: name,
      eventTitle: 'zerohouse launch party',
      eventDate: 'Saturday, December 30',
      eventTime: '2:00 PM - 5:00 PM',
      inviteLink: inviteLink
    });

    setResult(response);
    setSending(false);
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl max-w-sm z-50">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-white">Send Email Invitation</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Recipient Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleSendInvite}
          disabled={sending || !email || !name}
          className="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-2 px-4 rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
        >
          {sending ? 'Sending...' : 'Send Invitation'}
        </button>

        {result && (
          <div className={`flex items-start gap-2 p-3 rounded text-sm ${
            result.success
              ? 'bg-green-900/30 border border-green-700 text-green-300'
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
