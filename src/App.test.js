import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import domtoimage from 'dom-to-image';

jest.mock('dom-to-image', () => ({
  toBlob: jest.fn(),
}));

const originalClipboard = navigator.clipboard;
const originalClipboardItem = window.ClipboardItem;
const originalShare = navigator.share;
const originalCanShare = navigator.canShare;

const cardBlob = () => new Blob(['image'], { type: 'image/png' });

const click = async (container, selector) => {
  await act(async () => {
    fireEvent.click(container.querySelector(selector));
  });
};

beforeEach(() => {
  domtoimage.toBlob.mockResolvedValue(cardBlob());
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { write: jest.fn().mockResolvedValue(undefined) },
  });
  window.ClipboardItem = class ClipboardItem {
    constructor(items) {
      this.items = items;
    }
  };
  navigator.share = undefined;
  navigator.canShare = undefined;
});

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: originalClipboard,
  });
  window.ClipboardItem = originalClipboardItem;
  navigator.share = originalShare;
  navigator.canShare = originalCanShare;
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

test('offers sharing actions straight away, without a separate create step', () => {
  const { container, getByText } = render(<App />);

  expect(container.querySelector('#buttonCopy')).toBeNull();
  expect(getByText('Copy image')).toBeInTheDocument();
  expect(getByText('Download')).toBeInTheDocument();
  expect(getByText('Share')).toBeInTheDocument();
  expect(getByText('Copy & email it')).toBeInTheDocument();
  expect(container.querySelector('.social-links')).toBeNull();
  expect(container.querySelector('a[href*="facebook"], a[href*="twitter"], a[href*="wa.me"]')).toBeNull();
  expect(container.querySelector('.card-art')).toBeInTheDocument();
  expect(container.querySelector('#meme img')).toBeNull();
});

test('copy image generates the card and writes it to the clipboard', async () => {
  const { container } = render(<App />);

  await click(container, '.primary-action');

  expect(domtoimage.toBlob).toHaveBeenCalledWith(container.querySelector('#meme'));
  expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="status"]')).toHaveTextContent('Card copied!');
});

test('shows an error when card image generation fails', async () => {
  domtoimage.toBlob.mockRejectedValue(new Error('render failed'));
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = render(<App />);

  await click(container, '.primary-action');

  expect(container.querySelector('[role="alert"]')).toHaveTextContent(
    "We couldn't create your card. Please try again."
  );
  expect(consoleError).toHaveBeenCalled();
});

test('reports when image copying is unavailable', async () => {
  window.ClipboardItem = undefined;
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = render(<App />);

  await click(container, '.primary-action');

  expect(container.querySelector('[role="alert"]')).toHaveTextContent('Download your card instead.');
  expect(consoleError).toHaveBeenCalled();
});

test('download generates the card and saves it as a PNG', async () => {
  URL.createObjectURL = jest.fn(() => 'blob:card');
  URL.revokeObjectURL = jest.fn();
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const { container } = render(<App />);

  await click(container, '.action-grid button:nth-child(2)');

  expect(domtoimage.toBlob).toHaveBeenCalledTimes(1);
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(clickSpy).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="status"]')).toHaveTextContent('Card downloaded!');
  delete URL.createObjectURL;
  delete URL.revokeObjectURL;
});

test('share generates the card and opens the share sheet with the image', async () => {
  navigator.share = jest.fn().mockResolvedValue(undefined);
  navigator.canShare = jest.fn().mockReturnValue(true);
  const { container } = render(<App />);

  await click(container, '.action-grid button:nth-child(3)');

  expect(navigator.share).toHaveBeenCalledTimes(1);
  const [{ files }] = navigator.share.mock.calls[0];
  expect(files[0].name).toBe('holiday-card.png');
});

test('share explains the fallback when the browser cannot share images', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = render(<App />);

  await click(container, '.action-grid button:nth-child(3)');

  expect(container.querySelector('[role="alert"]')).toHaveTextContent("Image sharing isn't available here.");
  expect(consoleError).toHaveBeenCalled();
});

test('copy & email generates the card, copies it, and opens a mail tab with paste instructions', async () => {
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  const { container } = render(<App />);

  await click(container, '.email-action');

  expect(domtoimage.toBlob).toHaveBeenCalledTimes(1);
  expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
  expect(openSpy).toHaveBeenCalledTimes(1);
  const [url, target] = openSpy.mock.calls[0];
  expect(url).toMatch(/^mailto:\?subject=/);
  expect(decodeURIComponent(url)).toContain('paste the image');
  expect(target).toBe('_blank');
  expect(container.querySelector('[role="status"]')).toHaveTextContent('Card copied!');
});

test('copy & email still opens the mail tab when image copying is unsupported', async () => {
  window.ClipboardItem = undefined;
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  const { container } = render(<App />);

  await click(container, '.email-action');

  expect(openSpy).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="alert"]')).toHaveTextContent('attach it to your email');
  expect(consoleError).toHaveBeenCalled();
});
