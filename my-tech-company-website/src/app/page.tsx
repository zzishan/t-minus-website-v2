'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const BOOT_SEQUENCE = [
  'Initializing T-Minus mission control...',
  'Loading core systems...',
  'Establishing secure connection...',
  'Calibrating quantum processors...',
  'Systems nominal...',
  'Welcome to T-Minus Mission Control',
];

const SERVICES = [
  {
    title: 'Custom Software Development',
    description: 'Precision-engineered solutions tailored to your mission requirements',
    icon: '🛰️'
  },
  {
    title: 'Cloud Architecture',
    description: 'Scalable infrastructure designed for mission-critical operations',
    icon: '☁️'
  },
  {
    title: 'Data Analytics',
    description: 'Transform raw data into actionable intelligence',
    icon: '📊'
  },
  {
    title: 'AI Integration',
    description: 'Next-gen artificial intelligence solutions for your enterprise',
    icon: '🤖'
  },
  {
    title: 'Cybersecurity',
    description: 'Fortify your digital assets with military-grade protection',
    icon: '🛡️'
  },
  {
    title: 'Digital Transformation',
    description: 'Guide your business into the digital future',
    icon: '🚀'
  }
];

const COMMANDS = {
  help: {
    description: 'Show available commands',
    usage: '/help'
  },
  services: {
    description: 'Navigate to services section',
    usage: '/services'
  },
  contact: {
    description: 'Navigate to contact page',
    usage: '/contact'
  },
  clear: {
    description: 'Clear terminal output',
    usage: '/clear'
  },
  about: {
    description: 'Show information about T-Minus',
    usage: '/about'
  },
  status: {
    description: 'Show system status',
    usage: '/status'
  }
};

export default function Home() {
  const [bootStep, setBootStep] = useState(0);
  const [command, setCommand] = useState('');
  const [isBooted, setIsBooted] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [terminalOutput, setTerminalOutput] = useState<Array<{type: 'command' | 'response', content: string}>>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Boot sequence animation
    if (bootStep < BOOT_SEQUENCE.length) {
      const timer = setTimeout(() => {
        setBootStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsBooted(true);
    }
  }, [bootStep]);

  useEffect(() => {
    // Scroll terminal to bottom when output changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const addToTerminal = (content: string, type: 'command' | 'response') => {
    setTerminalOutput(prev => [...prev, { type, content }]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.toLowerCase().trim();

    switch (cmd) {
      case '/services':
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case '/contact':
        window.location.href = '/contact';
        break;
    }
    
    // Don't clear command if it's /help so the help menu stays visible
    if (cmd !== '/help') {
      setCommand('');
    }
  };

  return (
    <main className="min-h-screen">
      {/* Boot Sequence */}
      {!isBooted ? (
        <div className="h-screen flex items-center justify-center">
          <div className="console max-w-2xl w-full mx-4">
            {BOOT_SEQUENCE.slice(0, bootStep).map((line, index) => (
              <div key={index} className="cli">
                <span className="cli-prompt">{line}</span>
              </div>
            ))}
            <div className="loading-bar mt-4"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="container mx-auto px-4 py-20">
            {/* Hero Section */}
            <div className="crt-screen console mb-20">
              <h1 className="text-4xl md:text-6xl mb-6">
                Mission Control for Digital Transformation
              </h1>
              <p className="text-crt-green text-xl mb-8">
                Guiding your business through the digital frontier
              </p>
              <div className="flex gap-4">
                <Link href="/contact" className="btn-retro">
                  Initialize Mission
                </Link>
                <button className="btn-retro">
                  View Flight Log
                </button>
              </div>
            </div>

            {/* Command Line Interface */}
            <div className="console mb-20">
              <form onSubmit={handleCommand} className="flex items-center">
                <span className="cli-prompt">mission_control</span>
                <input
                  ref={commandInputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 ml-2 cli"
                  placeholder="Type /help for available commands"
                  autoComplete="off"
                />
              </form>
              {command === '/help' && (
                <div className="mt-4 text-crt-green">
                  Available commands:
                  <br />
                  /help - Show this help message
                  <br />
                  /services - View our services
                  <br />
                  /contact - Get in touch
                </div>
              )}
            </div>

            {/* Services Grid */}
            <section id="services" className="mb-20">
              <h2 className="text-3xl mb-12 text-center">Mission Capabilities</h2>
              <div className="hex-grid">
                {SERVICES.map((service, index) => (
                  <div key={index} className="hex">
                    <div className="hex-content">
                      <div className="text-4xl mb-6">{service.icon}</div>
                      <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                      <p className="text-gray-300">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="console text-center py-12">
              <h2 className="text-3xl mb-6">Ready to Launch?</h2>
              <p className="text-xl mb-8 text-crt-green">
                Join us on a journey to transform your business
              </p>
              <Link href="/contact" className="btn-retro">
                Begin Transmission
              </Link>
            </section>
          </div>

          {/* Footer */}
          <footer className="border-t border-retro-amber/20 py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-neutral-gray">
                  © 2024 T Minus Tech Solutions
                </div>
                <div className="flex gap-6">
                  <a href="mailto:info@tminustech.co" className="text-neutral-gray hover:text-retro-amber transition-colors">
                    info@tminustech.co
                  </a>
                  <a href="tel:+919826098717" className="text-neutral-gray hover:text-retro-amber transition-colors">
                    +91 9826098717
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </main>
  );
} 