import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import domtoimage from 'dom-to-image';

jest.mock('dom-to-image', () => ({
  toPng: jest.fn(),
}));

const originalFetch = global.fetch;
const originalScrollTo = window.scrollTo;

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { memes: [] } }),
  });
  window.scrollTo = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  window.scrollTo = originalScrollTo;
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

test('generates and displays a card image', async () => {
  domtoimage.toPng.mockResolvedValue('data:image/png;base64,generated');
  const { container } = render(<App />);

  await act(async () => {
    fireEvent.click(container.querySelector('#buttonCopy'));
  });

  const image = container.querySelector('img[alt="Generated holiday card 1"]');
  expect(image).toHaveAttribute('src', 'data:image/png;base64,generated');
});

test('shows an error when card image generation fails', async () => {
  domtoimage.toPng.mockRejectedValue(new Error('render failed'));
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = render(<App />);

  await act(async () => {
    fireEvent.click(container.querySelector('#buttonCopy'));
  });

  expect(container.querySelector('[role="alert"]')).toHaveTextContent(
    'The image could not be generated. Please try again.'
  );
  expect(consoleError).toHaveBeenCalled();
});
