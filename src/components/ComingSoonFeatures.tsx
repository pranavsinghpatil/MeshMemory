import React from 'react';
import { Brain, Share2, Mic, Lightbulb, BarChart3, Globe } from 'lucide-react';
import { ComingSoonBadge } from './FeatureFlag';

export default function ComingSoonFeatures() {
  const features = [
    {
      icon: Brain,
      title: 'Global Mood Analysis',
      description: 'AI-powered sentiment analysis across all your conversations to track emotional patterns and insights.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: '3D Thread Visualization',
      description: 'Interactive 3D graph showing relationships between conversation threads and topics.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Share2,
      title: 'Collaborative Threads',
      description: 'Share and collaborate on conversation threads with team members in real-time.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Mic,
      title: 'Voice Notes Integration',
      description: 'Record voice notes and automatically transcribe them into searchable conversation chunks.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Lightbulb,
      title: 'Smart Suggestions',
      description: 'AI-powered suggestions for follow-up questions and related topics based on your conversation history.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your learning patterns, knowledge gaps, and conversation effectiveness.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exciting Features Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We're working on amazing new features to enhance your AI conversation experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
          >
            {/* Coming Soon Badge */}
            <div className="absolute top-4 right-4">
              <ComingSoonBadge feature={feature.title} />
            </div>

            {/* Icon with gradient background */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {feature.description}
            </p>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full border border-indigo-200 dark:border-indigo-800">
          <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            Want early access? Join our beta program!
          </span>
        </div>
      </div>
    </div>
  );
}