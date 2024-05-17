// Import necessary testing libraries and the function to be tested
import { fetchAndDisplayRSSLinks } from '/Users/bahito/Library/Mobile Documents/com~apple~CloudDocs/Developer/rss_feed/script.js';
import { jest } from '@jest/globals';

// Mock the dependencies
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('node-fetch');

// Helper functions
const mockFetchHTML = (url, html) => {
    fetchMock.mock(url, { body: html, status: 200 });
};

const mockFetchHTMLError = (url, statusCode) => {
    fetchMock.mock(url, { status: statusCode });
};

// Test: Successful RSS link fetch and display using the first proxy
test('fetchAndDisplayRSSLinks successfully fetches and displays RSS links using the first proxy', async () => {
    // Arrange
    const url = 'https://example.com';
    const encodedUrl = encodeURIComponent(url);
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const fullUrl = proxyUrl + encodedUrl;
    const htmlContent = '<html><head><link rel="alternate" type="application/rss+xml" href="https://example.com/feed.xml"></head></html>';
    const expectedRSSUrls = ['https://example.com/feed.xml'];

    mockFetchHTML(fullUrl, htmlContent);
    const displayRSSUrls = jest.fn();

    // Act
    await fetchAndDisplayRSSLinks(url);

    // Assert
    expect(displayRSSUrls).toHaveBeenCalledWith(expectedRSSUrls);
});

// Test: Handling fetch errors and trying next proxy
test('fetchAndDisplayRSSLinks handles fetch error and tries the next proxy', async () => {
    // Arrange
    const url = 'https://example.com';
    const encodedUrl = encodeURIComponent(url);
    const firstProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const secondProxyUrl = 'https://cors.bridged.cc/';
    const firstFullUrl = firstProxyUrl + encodedUrl;
    const secondFullUrl = secondProxyUrl + encodedUrl;
    const htmlContent = '<html><head><link rel="alternate" type="application/rss+xml" href="https://example.com/feed.xml"></head></html>';
    const expectedRSSUrls = ['https://example.com/feed.xml'];

    mockFetchHTMLError(firstFullUrl, 500);
    mockFetchHTML(secondFullUrl, htmlContent);
    const displayRSSUrls = jest.fn();

    // Act
    await fetchAndDisplayRSSLinks(url);

    // Assert
    expect(displayRSSUrls).toHaveBeenCalledWith(expectedRSSUrls);
});

// Test: All proxies fail
test('fetchAndDisplayRSSLinks logs error when all proxies fail', async () => {
    // Arrange
    const url = 'https://example.com';
    const encodedUrl = encodeURIComponent(url);
    const proxyUrls = [
        'https://cors-anywhere.herokuapp.com/',
        'https://cors.bridged.cc/',
        'http://localhost:8080/proxy?url='
    ];
    proxyUrls.forEach(proxyUrl => {
        const fullUrl = proxyUrl + encodedUrl;
        mockFetchHTMLError(fullUrl, 500);
    });
    const consoleError = jest.spyOn(console, 'error');

    // Act
    await fetchAndDisplayRSSLinks(url);

    // Assert
    expect(consoleError).toHaveBeenCalledTimes(proxyUrls.length);
});

// Reset fetch mocks after each test
afterEach(() => {
    fetchMock.reset();
});
