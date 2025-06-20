import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { mergeChats } from '../lib/api';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface ChatMergeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  onMergeComplete: (newChatId: string) => void;
}

export default function ChatMergeDialog({
  isOpen,
  onClose,
  chats,
  onMergeComplete,
}: ChatMergeDialogProps) {
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedChats(new Set());
      setTitle('');
      setError('');
    }
  }, [isOpen]);

  const toggleChatSelection = (chatId: string) => {
    const newSelection = new Set(selectedChats);
    if (newSelection.has(chatId)) {
      newSelection.delete(chatId);
    } else {
      newSelection.add(chatId);
    }
    setSelectedChats(newSelection);
    
    // Auto-generate title if empty or using default
    if (!title || title.startsWith('Merged: ')) {
      const selectedChatTitles = chats
        .filter(chat => newSelection.has(chat.id))
        .map(chat => chat.title);
      
      if (selectedChatTitles.length > 0) {
        const baseTitle = selectedChatTitles.slice(0, 2).join(', ');
        const suffix = selectedChatTitles.length > 2 ? ` and ${selectedChatTitles.length - 2} more` : '';
        setTitle(`Merged: ${baseTitle}${suffix}`);
      } else {
        setTitle('');
      }
    }
  };

  const handleMerge = async () => {
    if (selectedChats.size < 2) {
      setError('Please select at least 2 chats to merge');
      return;
    }

    setIsMerging(true);
    setError('');

    try {
      const result = await mergeChats({
        chatIds: Array.from(selectedChats),
        title: title || undefined,
      });

      if (result.success) {
        onMergeComplete(result.data.id);
        onClose();
      } else {
        setError(result.message || 'Failed to merge chats');
      }
    } catch (err) {
      setError('An error occurred while merging chats');
      console.error('Merge error:', err);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Merge Chats
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title for merged chat
                      </label>
                      <input
                        type="text"
                        id="title"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for the merged chat"
                      />
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select chats to merge (select at least 2):
                      </p>
                      <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                        {chats.map((chat) => (
                          <div
                            key={chat.id}
                            className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                              selectedChats.has(chat.id)
                                ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => toggleChatSelection(chat.id)}
                          >
                            <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                              selectedChats.has(chat.id)
                                ? 'bg-indigo-600 border-transparent'
                                : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                            }`}>
                              {selectedChats.has(chat.id) && (
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {chat.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {chat.messageCount} messages • {new Date(chat.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${
                          selectedChats.size < 2 || isMerging
                            ? 'bg-indigo-300 dark:bg-indigo-800 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                        }`}
                        onClick={handleMerge}
                        disabled={selectedChats.size < 2 || isMerging}
                      >
                        {isMerging ? (
                          <>
                            <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Merging...
                          </>
                        ) : (
                          `Merge ${selectedChats.size} chats`
                        )}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
