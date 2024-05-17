
document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('url-input');
    const targetUrl = urlInput.value.trim();

    if (targetUrl) {
        await fetchAndDisplayRSSLinks(targetUrl);
    } else {
        console.error('Please enter a valid URL.');
    }
});

// Fetch and display RSS links from the provided URL
async function fetchAndDisplayRSSLinks(url) {
    const proxyUrls = ['https://cors-anywhere.herokuapp.com/', 'https://cors.bridged.cc/', 'http://localhost:8080/proxy?url='];
    for (const proxyUrl of proxyUrls) {
        try {
            const fullUrl = proxyUrl + encodeURIComponent(url);
            const html = await fetchHTML(fullUrl);
            const rssUrls = extractRSSUrls(html, url);
            displayRSSUrls(rssUrls);
            break; // Exit loop if successful
        } catch (error) {
            console.error(`Error fetching RSS links with proxy ${proxyUrl}:`, error);
        }
    }
}

// Fetch HTML content from the provided URL
async function fetchHTML(url) {
    const headers = new Headers({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    });
    const response = await fetch(url, { headers });
    return await response.text();
}

// Extract RSS URLs from the provided HTML content
function extractRSSUrls(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const linkTags = doc.querySelectorAll('link[type="application/rss+xml"], link[type="application/atom+xml"], link[rel="alternate"][type="application/rss+xml"], link[rel="alternate"][type="application/atom+xml"]');
    const rssUrls = new Set();

    linkTags.forEach(linkTag => {
        let rssUrl = linkTag.getAttribute('href') || '';
        if (rssUrl) {
            // Check if the URL is relative and prepend the base URL
            if (rssUrl.startsWith('/')) {
                const urlObj = new URL(baseUrl);
                rssUrl = `${urlObj.protocol}//${urlObj.host}${rssUrl}`;
            }
            rssUrls.add(rssUrl);
        }
    });

    return rssUrls;
}

// Display RSS URLs in the output textarea
function displayRSSUrls(rssUrls) {
    const outputArea = document.getElementById('output-area');
    outputArea.value = Array.from(rssUrls).join('\n');

    if (rssUrls.size > 0) {
        showAddFeedModal(rssUrls);
    } else {
        alert('No RSS feeds found.');
    }
}

// Show modal with options to add RSS feeds to the feed list
function showAddFeedModal(rssUrls) {
    const feedOptions = document.getElementById('feedOptions');
    feedOptions.innerHTML = '';

    rssUrls.forEach(url => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = url;

        const label = document.createElement('label');
        label.textContent = url;

        feedOptions.appendChild(checkbox);
        feedOptions.appendChild(label);
        feedOptions.appendChild(document.createElement('br'));
    });

    const modal = document.getElementById('addFeedModal');
    modal.style.display = 'block';

    document.getElementById('addFeedsBtn').onclick = () => {
        const selectedUrls = Array.from(feedOptions.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
        addFeedsToList(selectedUrls);
        modal.style.display = 'none';
    };
}

// Add selected RSS feeds to the feed list
function addFeedsToList(urls) {
    const sidebarFeedsList = document.getElementById('sidebar-feeds-list');

    urls.forEach(url => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = url;
        link.onclick = async () => {
            await fetchAndDisplayRSSPosts(url);
        };

        listItem.appendChild(link);
        sidebarFeedsList.appendChild(listItem);

        // Fetch and display posts from the RSS feed
        fetchAndDisplayRSSPosts(url);
    });
}

// Fetch RSS posts from the provided URL and display them
async function fetchAndDisplayRSSPosts(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        const items = parseRSSFeed(data);
        displayRSSPosts(items);
    } catch (error) {
        console.error('Error fetching RSS posts:', error);
    }
}

// Parse the RSS feed data and return the items
function parseRSSFeed(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    return xmlDoc.querySelectorAll('item');
}

// Display RSS posts in the DOM
function displayRSSPosts(items) {
    const rssFeedContainer = document.getElementById('rssPostsFeed');
    rssFeedContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        const pubDate = item.querySelector('pubDate').textContent;

        const postElement = createPostElement(title, description, link, pubDate);
        fragment.appendChild(postElement);
    });

    rssFeedContainer.appendChild(fragment);
}

// Create a DOM element for an RSS post
function createPostElement(title, description, link, pubDate) {
    const postElement = document.createElement('div');
    postElement.classList.add('rssPost');
    postElement.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <p><strong>Published on:</strong> ${pubDate}</p>
        <a href="${link}" target="_blank">Read More</a>
    `;
    return postElement;
}

// Display all posts from all feeds when "All Feeds" is clicked
document.getElementById('sidebar-all-feeds').addEventListener('click', async () => {
    const urls = Array.from(document.querySelectorAll('#sidebar-feeds-list a')).map(a => a.textContent);
    const allPosts = [];
    for (const url of urls) {
        const response = await fetch(url);
        const data = await response.text();
        const items = parseRSSFeed(data);
        allPosts.push(...items);
    }
    displayRSSPosts(allPosts);
});