import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../../pages/SearchPage';

// Mock the API
jest.mock('../../lib/api', () => ({
  searchAPI: {
    search: jest.fn(),
    getSuggestions: jest.fn(),
  },
}));

const { searchAPI } = require('../../lib/api');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SearchPage', () => {
  beforeEach(() => {
    searchAPI.search.mockClear();
    searchAPI.getSuggestions.mockClear();
  });

  test('renders search page correctly', () => {
    renderWithRouter(<SearchPage />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask across all your AI conversations...')).toBeInTheDocument();
    expect(screen.getByText('Start searching')).toBeInTheDocument();
  });

  test('performs search when form is submitted', async () => {
    const mockResults = [
      {
        id: 'chunk-1',
        text_chunk: 'Test result',
        similarity: 0.85,
        source: { id: 'source-1', title: 'Test Source' },
        participant_label: 'Assistant',
        timestamp: '2024-01-01T00:00:00Z'
      }
    ];

    searchAPI.search.mockResolvedValue({
      results: mockResults,
      aiResponse: 'Test AI response',
      totalResults: 1
    });

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(searchAPI.search).toHaveBeenCalledWith('test query', 10, 0.7);
    });

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Test result')).toBeInTheDocument();
      expect(screen.getByText('Test AI response')).toBeInTheDocument();
    });
  });

  test('shows error message when search fails', async () => {
    searchAPI.search.mockRejectedValue(new Error('Search failed'));

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText('An error occurred while searching. Please try again.')).toBeInTheDocument();
    });
  });

  test('prevents search with empty query', () => {
    renderWithRouter(<SearchPage />);

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(searchAPI.search).not.toHaveBeenCalled();
  });

  test('shows loading state during search', async () => {
    searchAPI.search.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    // Should show loading spinner
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  test('displays suggestions when typing', async () => {
    searchAPI.getSuggestions.mockResolvedValue({
      suggestions: ['What did I learn about React?', 'Show me discussions about AI']
    });

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(searchAPI.getSuggestions).toHaveBeenCalledWith('React', 5);
    });

    await waitFor(() => {
      expect(screen.getByText('What did I learn about React?')).toBeInTheDocument();
      expect(screen.getByText('Show me discussions about AI')).toBeInTheDocument();
    });
  });

  test('handles suggestion click', async () => {
    searchAPI.getSuggestions.mockResolvedValue({
      suggestions: ['What did I learn about React?']
    });

    searchAPI.search.mockResolvedValue({
      results: [],
      aiResponse: '',
      totalResults: 0
    });

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('What did I learn about React?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('What did I learn about React?'));

    expect(searchInput).toHaveValue('What did I learn about React?');
  });

  test('shows no results message when search returns empty', async () => {
    searchAPI.search.mockResolvedValue({
      results: [],
      aiResponse: '',
      totalResults: 0
    });

    renderWithRouter(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Ask across all your AI conversations...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search query or import more content to search through.')).toBeInTheDocument();
    });
  });
});