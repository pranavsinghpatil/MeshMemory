import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SearchResultCard from '../../components/SearchResultCard';

const mockResult = {
  id: 'chunk-1',
  text_chunk: 'This is a test chunk about React hooks',
  similarity: 0.85,
  source: {
    id: 'source-1',
    title: 'React Tutorial',
    type: 'chatgpt-link',
    created_at: '2024-01-01T00:00:00Z'
  },
  participant_label: 'Assistant',
  timestamp: '2024-01-01T00:00:00Z'
};

const mockOnFollowUp = jest.fn();
const mockOnViewContext = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SearchResultCard', () => {
  beforeEach(() => {
    mockOnFollowUp.mockClear();
    mockOnViewContext.mockClear();
  });

  test('renders search result correctly', () => {
    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    expect(screen.getByText('This is a test chunk about React hooks')).toBeInTheDocument();
    expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    expect(screen.getByText('85% match')).toBeInTheDocument();
    expect(screen.getByText('Result 1')).toBeInTheDocument();
  });

  test('displays correct source type icon', () => {
    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    // Should show ChatGPT icon for chatgpt-link type
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('calls onFollowUp when follow-up button is clicked', () => {
    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    const followUpButton = screen.getByTitle('Follow up');
    fireEvent.click(followUpButton);

    expect(mockOnFollowUp).toHaveBeenCalledWith(mockResult);
  });

  test('calls onViewContext when view context button is clicked', () => {
    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    const viewContextButton = screen.getByTitle('View in full context');
    fireEvent.click(viewContextButton);

    expect(mockOnViewContext).toHaveBeenCalledWith(mockResult);
  });

  test('shows similarity score with correct color coding', () => {
    const highSimilarityResult = { ...mockResult, similarity: 0.95 };
    
    renderWithRouter(
      <SearchResultCard
        result={highSimilarityResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    const similarityBadge = screen.getByText('95% match');
    expect(similarityBadge).toHaveClass('bg-green-100');
  });

  test('handles copy text functionality', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    const copyButton = screen.getByTitle('Copy text');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.text_chunk);
  });

  test('displays participant label when available', () => {
    renderWithRouter(
      <SearchResultCard
        result={mockResult}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    expect(screen.getByText(/from Assistant/)).toBeInTheDocument();
  });

  test('handles missing participant label gracefully', () => {
    const resultWithoutParticipant = { ...mockResult, participant_label: null };
    
    renderWithRouter(
      <SearchResultCard
        result={resultWithoutParticipant}
        index={0}
        onFollowUp={mockOnFollowUp}
        onViewContext={mockOnViewContext}
      />
    );

    // Should not crash and should still render the result
    expect(screen.getByText('This is a test chunk about React hooks')).toBeInTheDocument();
  });
});