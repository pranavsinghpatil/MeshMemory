import React from 'react';
import { 
  HelpCircle, 
  FileText, 
  Book, 
  MessageSquare, 
  GitBranch, 
  Upload, 
  Layers, 
  Lock, 
  ExternalLink 
} from 'lucide-react';

export default function HelpPanel() {
  const helpGuides = [
    {
      id: 'import',
      title: 'How to Import',
      icon: Upload,
      description: 'Learn how to import conversations from ChatGPT, Claude, Gemini, and YouTube.',
      link: '/help/import'
    },
    {
      id: 'threadgroups',
      title: 'Managing ThreadGroups',
      icon: Layers,
      description: 'Create, organize, and get the most out of thread groups.',
      link: '/help/threadgroups'
    },
    {
      id: 'parallel',
      title: 'Using Parallel Chats',
      icon: GitBranch,
      description: 'Explore alternative approaches with parallel conversations.',
      link: '/help/parallel-chats'
    },
    {
      id: 'export',
      title: 'Exporting to IPFS',
      icon: FileText,
      description: 'Export your conversations to IPFS for permanent storage.',
      link: '/help/export-ipfs'
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: Lock,
      description: 'Understand how your data is stored and protected.',
      link: '/help/privacy'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help & Documentation</h2>
      </div>

      <div className="space-y-6">
        {/* Quick Guides */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Guides</h3>
          <div className="space-y-3">
            {helpGuides.map(guide => (
              <a 
                key={guide.id}
                href={guide.link}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <guide.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{guide.title}</h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{guide.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Documentation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="/docs/getting-started"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Book className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">Getting Started</span>
            </a>
            
            <a 
              href="/docs/api"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">API Reference</span>
            </a>
            
            <a 
              href="/docs/faq"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">FAQ</span>
            </a>
            
            <a 
              href="/docs/tutorials"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">Tutorials</span>
            </a>
          </div>
        </div>

        {/* Community & Support */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Community & Support</h3>
          <div className="space-y-3">
            <a 
              href="https://discord.gg/knitter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.874-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Discord Community</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Join our Discord server for help and discussions</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </a>
            
            <a 
              href="https://github.com/knitter/knitter/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">GitHub Issues</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Report bugs or request features</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </a>
            
            <a 
              href="mailto:support@knitter.app"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Support</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">support@knitter.app</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}