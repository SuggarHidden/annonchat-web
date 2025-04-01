import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="py-4 px-6 bg-gray-700 flex justify-between items-center border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-gray-200">
          <h3 className="text-lg font-semibold mb-3">Privacy Policy for AnnonChat</h3>
          <p className="mb-4">
            This Privacy Policy describes how AnnonChat collects, uses, and handles your information when you use our service.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Information Collection and Usage</h4>
          <p className="mb-4">
            AnnonChat uses WebSockets solely for the purpose of sending messages to the server and receiving messages from other users. We do not store any user data on our servers. Only WebSocket connection information and chat IDs are temporarily maintained WHILE you are connected to the site. Once you disconnect, this information is immediately deleted.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Message Privacy</h4>
          <p className="mb-4">
            The statistical &ldquo;data&ldquo; shown represents raw data quantities received by the server. Due to our end-to-end encryption system, we cannot access or view the content of messages exchanged between users. We have no ability to read, monitor, or store the actual content of any communications.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Third-Party Advertising</h4>
          <p className="mb-4">
            AnnonChat uses AdsTerra for advertising purposes. AdsTerra may have its own privacy policies regarding data collection and usage. We encourage you to review AdsTerra&apos;s privacy policy to understand how they may collect or process your information. We do not share any of your personal information with AdsTerra beyond what is automatically collected through their ad serving technology.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Cookies and Tracking</h4>
          <p className="mb-4">
            Our service itself does not use cookies or tracking technologies to collect information about you. However, third-party advertisers like AdsTerra may use cookies or similar technologies to collect information about your browsing activities.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Data Security</h4>
          <p className="mb-4">
            We implement appropriate technical measures to protect against unauthorized access to or unauthorized alteration, disclosure, or destruction of data. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>

          <h4 className="font-semibold mt-4 mb-2">Changes to This Privacy Policy</h4>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <p className="mt-6 text-sm text-gray-400">
            By using AnnonChat, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>

        <div className="py-4 px-6 bg-gray-700 border-t border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;