'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TRANSMISSION_SEQUENCE = [
  'Establishing secure transmission channel...',
  'Initializing quantum encryption...',
  'Channel secure. Ready for transmission.',
  '',
  'T-Minus Mission Control - Communications Interface',
  'Status: Online and ready to receive',
];

export default function Contact() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    priority: 'standard'
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    setIsVisible(true);

    // Transmission sequence animation
    if (currentLine < TRANSMISSION_SEQUENCE.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentLine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Initiating transmission...');
    
    // Simulate transmission
    setTimeout(() => {
      setStatus('Transmission successful. Message received.');
      setFormState({
        name: '',
        email: '',
        message: '',
        priority: 'standard'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="container mx-auto px-4 py-20">
          <Link href="/" className="inline-block mb-8 text-retro-amber hover:text-crt-green transition-colors">
            <span className="mr-2">›</span>
            Return to Mission Control
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Transmission Display */}
            <div className="space-y-8">
              <div className="console">
                {TRANSMISSION_SEQUENCE.slice(0, currentLine + 1).map((line, index) => (
                  <div key={index} className="cli">
                    {line}
                  </div>
                ))}
                <span className="cli-prompt"></span>
              </div>
              
              <div className="console space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Mission Control Center</h2>
                  <p className="text-gray-300">
                    142 - Manushree Nagar, Airport Road
                    <br />
                    Indore, Madhya Pradesh - 452005
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-2">Operation Hours</h2>
                  <p className="text-gray-300">0900 - 1800 hrs, Mon to Fri</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-2">Communication Channels</h2>
                  <div className="space-y-2">
                    <a href="mailto:info@tminustech.co" className="block text-gray-300 hover:text-retro-amber transition-colors">
                      <span className="mr-2">›</span>
                      info@tminustech.co
                    </a>
                    <a href="tel:+919826098717" className="block text-gray-300 hover:text-retro-amber transition-colors">
                      <span className="mr-2">›</span>
                      +91 9826098717
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Transmission Form */}
            <form onSubmit={handleSubmit} className="console space-y-6">
              <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
                <span className="w-3 h-3 rounded-full bg-warning-red"></span>
                <span className="w-3 h-3 rounded-full bg-retro-amber"></span>
                <span className="w-3 h-3 rounded-full bg-crt-green"></span>
                <span className="ml-2">new_transmission.log</span>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-retro-amber">
                  <span className="mr-2">›</span>
                  Identification
                </label>
                <input
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-deep-space border border-retro-amber focus:ring-2 focus:ring-retro-amber cli"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-retro-amber">
                  <span className="mr-2">›</span>
                  Communication Frequency
                </label>
                <input
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-deep-space border border-retro-amber focus:ring-2 focus:ring-retro-amber cli"
                  required
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-2 text-retro-amber">
                  <span className="mr-2">›</span>
                  Transmission Priority
                </label>
                <select
                  id="priority"
                  value={formState.priority}
                  onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 bg-deep-space border border-retro-amber focus:ring-2 focus:ring-retro-amber cli"
                >
                  <option value="standard">Standard Protocol</option>
                  <option value="urgent">Urgent - Priority Channel</option>
                  <option value="consultation">Request Consultation</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-retro-amber">
                  <span className="mr-2">›</span>
                  Transmission Content
                </label>
                <textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) => setFormState(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 bg-deep-space border border-retro-amber focus:ring-2 focus:ring-retro-amber cli"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="btn-retro w-full"
              >
                Initiate Transmission
              </button>

              {status && (
                <div className="text-center text-crt-green">
                  <span className="mr-2">›</span>
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-retro-amber/20 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-neutral-gray">
            © 2024 T Minus Tech Solutions Private Limited
          </div>
        </div>
      </footer>
    </div>
  );
} 