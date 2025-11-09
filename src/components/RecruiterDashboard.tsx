import { useState, useRef } from 'react';
import { Upload, Calendar, Mail, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { updateEvent } from '../services/mockApi';
import { sendEventInvitation } from '../services/emailService';

export default function RecruiterDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    time: '',
    location: '',
    description: '',
    hostName: '',
  });

  const [promoImage, setPromoImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const [emailData, setEmailData] = useState({
    email: 'marc@farm360.ai',
    name: 'KUSSAIYNBEKOV MUKHTAR',
  });
  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const promoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const handlePromoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPromoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setKnowledgeFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleUploadEvent = async () => {
    setUploading(true);
    setUploadResult(null);

    try {
      await updateEvent({
        title: formData.title || 'zerohouse launch party.',
        subtitle: formData.subtitle || 'founders world launch party.',
        date: formData.date || 'Saturday, December 30',
        time: formData.time || '2:00 PM - 5:00 PM',
        location: formData.location || 'zerohouse - to be announced',
        description: formData.description || 'Event description coming soon...',
        host: {
          name: formData.hostName || 'Event Host',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host'
        },
        promoImage: promoImage || undefined,
        avatarUrl: avatarImage || 'https://share.heygen.com/embeds/example',
        avatarKnowledgeFiles: knowledgeFiles.length > 0 ? knowledgeFiles : undefined,
      });

      setUploadResult({
        success: true,
        message: 'Event created successfully! You can now send invitations.'
      });
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Failed to create event. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendInvite = async () => {
    setSending(true);
    setEmailResult(null);

    const inviteLink = `${window.location.origin}/event`;

    const response = await sendEventInvitation({
      to: emailData.email,
      name: emailData.name,
      eventTitle: formData.title || 'zerohouse launch party',
      eventDate: formData.date || 'Saturday, December 30',
      eventTime: formData.time || '2:00 PM - 5:00 PM',
      inviteLink: inviteLink
    });

    setEmailResult(response);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-400">Create and manage your event invitations</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-400" />
              Upload Promo Photo
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => promoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 hover:border-purple-500 transition-colors flex flex-col items-center gap-2"
              >
                {promoImage ? (
                  <img src={promoImage} alt="Promo" className="max-h-32 rounded" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400">Click to upload promo image</span>
                  </>
                )}
              </button>
              <input
                ref={promoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePromoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Event Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., zerohouse launch party"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., founders world launch party"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g., Saturday, December 30"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Time</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 2:00 PM - 5:00 PM"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., zerohouse - to be announced"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Host Name</label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  placeholder="e.g., Sam Kim"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description..."
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-400" />
              Virtual Avatar Setup
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Avatar Photo</label>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors flex flex-col items-center gap-2"
                >
                  {avatarImage ? (
                    <img src={avatarImage} alt="Avatar" className="max-h-32 rounded" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-400">Click to upload avatar image</span>
                    </>
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Knowledge Base Files
                </label>
                <button
                  onClick={() => filesInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400">Upload text files for avatar knowledge</span>
                  {knowledgeFiles.length > 0 && (
                    <div className="text-sm text-purple-400 mt-2">
                      {knowledgeFiles.length} file(s) uploaded
                    </div>
                  )}
                </button>
                <input
                  ref={filesInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFilesUpload}
                  className="hidden"
                />
                {knowledgeFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {knowledgeFiles.map((file, i) => (
                      <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {file}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleUploadEvent}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Creating Event...' : 'Create Event'}
          </button>

          {uploadResult && (
            <div className={`flex items-start gap-2 p-4 rounded-lg ${
              uploadResult.success
                ? 'bg-green-900/30 border border-green-700 text-green-300'
                : 'bg-red-900/30 border border-red-700 text-red-300'
            }`}>
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <span>{uploadResult.message}</span>
            </div>
          )}

          {uploadResult?.success && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Send Email Invitations
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={emailData.name}
                    onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={handleSendInvite}
                  disabled={sending || !emailData.email || !emailData.name}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Invitation'}
                </button>
                {emailResult && (
                  <div className={`flex items-start gap-2 p-3 rounded text-sm ${
                    emailResult.success
                      ? 'bg-green-900/30 border border-green-700 text-green-300'
                      : 'bg-red-900/30 border border-red-700 text-red-300'
                  }`}>
                    {emailResult.success ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{emailResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
