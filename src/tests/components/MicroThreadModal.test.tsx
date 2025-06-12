import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MicroThreadModal from '../../components/MicroThreadModal';

// Mock the API
jest.mock('../../lib/api', () => ({
  microThreadsAPI: {
    createMicroThread: jest.fn(),
  },
}));

const { microThreadsAPI } = require('../../lib/api');

const mockChunk = {
  id: 'chunk-1',
  text_chunk: 'This is a test chunk about React hooks',
  participant_label: 'Assistant',
  timestamp: '2024-01-01T00:00:00Z'
};

const mockOnClose = jest.fn();
const mockOnMicroThreadCreated = jest.fn();

describe('MicroThreadModal', () => {
  beforeEach(() => {
    microThreadsAPI.createMicroThread.mockClear();
    mockOnClose.mockClear();
    mockOnMicroThreadCreated.mockClear();
  });

  test('renders modal when open', () => {
    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    expect(screen.getByText('Follow-up Question')).toBeInTheDocument();
    expect(screen.getByText('This is a test chunk about React hooks')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask a follow-up question about this content...')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <MicroThreadModal
        isOpen={false}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    expect(screen.queryByText('Follow-up Question')).not.toBeInTheDocument();
  });

  test('submits question and shows response', async () => {
    const mockResponse = {
      threadId: 'thread-1',
      answer: 'React hooks are functions that let you use state and other React features.',
      modelUsed: 'gpt-4',
      timestamp: '2024-01-01T00:00:00Z'
    };

    microThreadsAPI.createMicroThread.mockResolvedValue(mockResponse);

    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    const textarea = screen.getByPlaceholderText('Ask a follow-up question about this content...');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'What are React hooks?' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(microThreadsAPI.createMicroThread).toHaveBeenCalledWith(
        'chunk-1',
        'What are React hooks?'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('React hooks are functions that let you use state and other React features.')).toBeInTheDocument();
      expect(screen.getByText('AI (gpt-4)')).toBeInTheDocument();
    });

    expect(mockOnMicroThreadCreated).toHaveBeenCalled();
  });

  test('shows loading state during submission', async () => {
    microThreadsAPI.createMicroThread.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    const textarea = screen.getByPlaceholderText('Ask a follow-up question about this content...');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'What are React hooks?' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  test('handles submission error gracefully', async () => {
    microThreadsAPI.createMicroThread.mockRejectedValue(new Error('API Error'));

    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    const textarea = screen.getByPlaceholderText('Ask a follow-up question about this content...');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'What are React hooks?' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Should not crash and should allow retry
    expect(screen.getByPlaceholderText('Ask a follow-up question about this content...')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', () => {
    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('prevents submission with empty question', () => {
    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);

    expect(microThreadsAPI.createMicroThread).not.toHaveBeenCalled();
  });

  test('shows participant label in context', () => {
    render(
      <MicroThreadModal
        isOpen={true}
        onClose={mockOnClose}
        chunk={mockChunk}
        onMicroThreadCreated={mockOnMicroThreadCreated}
      />
    );

    expect(screen.getByText('— Assistant')).toBeInTheDocument();
  });
});