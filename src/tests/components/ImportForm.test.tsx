import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImportForm from '../../components/ImportForm';

// Mock the API
const mockOnSubmit = jest.fn();

describe('ImportForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders import form with tabs', () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={false} 
        progress="" 
      />
    );

    // Check if tabs are rendered
    expect(screen.getByText('ChatGPT Link')).toBeInTheDocument();
    expect(screen.getByText('Claude Screenshot')).toBeInTheDocument();
    expect(screen.getByText('Gemini PDF')).toBeInTheDocument();
    expect(screen.getByText('YouTube Link')).toBeInTheDocument();
  });

  test('switches between tabs correctly', () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={false} 
        progress="" 
      />
    );

    // Click on Claude tab
    fireEvent.click(screen.getByText('Claude Screenshot'));
    
    // Should show file input for Claude
    expect(screen.getByText('Upload a screenshot of your Claude conversation')).toBeInTheDocument();
  });

  test('shows loading state correctly', () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={true} 
        progress="Processing your import..." 
      />
    );

    expect(screen.getByText('Ingesting...')).toBeInTheDocument();
    expect(screen.getByText('Processing your import...')).toBeInTheDocument();
  });

  test('submits ChatGPT form with URL', async () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={false} 
        progress="" 
      />
    );

    // Fill in URL
    const urlInput = screen.getByPlaceholderText('https://chat.openai.com/share/...');
    fireEvent.change(urlInput, { target: { value: 'https://chat.openai.com/share/test' } });

    // Submit form
    const submitButton = screen.getByText('Import');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  test('validates required fields', () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={false} 
        progress="" 
      />
    );

    // Try to submit without URL
    const submitButton = screen.getByText('Import');
    fireEvent.click(submitButton);

    // Form should not submit (browser validation)
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('handles file upload for Claude tab', async () => {
    render(
      <ImportForm 
        onSubmit={mockOnSubmit} 
        loading={false} 
        progress="" 
      />
    );

    // Switch to Claude tab
    fireEvent.click(screen.getByText('Claude Screenshot'));

    // Upload file
    const fileInput = screen.getByLabelText('Claude Screenshot');
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitButton = screen.getByText('Import');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(FormData));
    });
  });
});