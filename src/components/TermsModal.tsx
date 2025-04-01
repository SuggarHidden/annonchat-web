import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="py-4 px-6 bg-gray-700 flex justify-between items-center border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">Terms of Service</h2>
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
          <h3 className="text-lg font-semibold mb-3">Disclaimer of Responsibility</h3>
          <p className="mb-4">
            AnnonChat is provided for educational, practical, and study purposes only. By using this service, you acknowledge and agree to the following terms:
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">Content Responsibility</h4>
          <p className="mb-4">
            The user is solely responsible for any content transmitted through AnnonChat. We do not monitor, review, or endorse any content shared through our platform. Users are expected to comply with all applicable laws and regulations when using this service.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">End-to-End Encryption</h4>
          <p className="mb-4">
            All messages sent through AnnonChat are end-to-end encrypted. This means that only the sender and intended recipient(s) can read the messages. As the service provider, we cannot access, read, or decrypt any content transmitted through our platform, even if requested by authorities.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">No Liability</h4>
          <p className="mb-4">
            We expressly disclaim all liability for any direct, indirect, incidental, special, or consequential damages arising from the use of AnnonChat, including but not limited to damages for loss of profits, goodwill, data, or other intangible losses.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">No Warranty</h4>
          <p className="mb-4">
            AnnonChat is provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">Prohibited Content</h4>
          <p className="mb-4">
            Users are prohibited from using AnnonChat to transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. We reserve the right to terminate access to users who violate these terms, although due to the encrypted nature of communications, our ability to enforce this is limited.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">Changes to Terms</h4>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Continued use of AnnonChat after any such changes constitutes your acceptance of the new terms.
          </p>
          
          <h4 className="font-semibold mt-4 mb-2">Governing Law</h4>
          <p className="mb-4">
            These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service provider operates, without regard to its conflict of law provisions.
          </p>
          
          <p className="mt-6 text-sm text-gray-400">
            By using AnnonChat, you acknowledge that you have read, understood, and agree to be bound by these terms.
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

export default TermsModal;