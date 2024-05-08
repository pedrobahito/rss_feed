document.getElementById('hamburger').addEventListener('click', function() {
    var aside = document.querySelector('aside');
    var hamburger = document.getElementById('hamburger');

    if (aside.style.display === 'none') {
        aside.style.display = 'block';
        hamburger.innerHTML = 'X';
    } else {
        aside.style.display = 'none';
        hamburger.innerHTML = '&#9776;'
    }
});

function displayRSSFeed(feedUrl) {
    fetch(feedUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'application/xml');

            const items = doc.querySelectorAll('item');
            const feedContainer = document.getElementById('feedItems');
            feedContainer.innerHTML = '';

            items.forEach(item => {
                const title = item.querySelector('title').textContent;
                const link = item.querySelector('link').textContent;
                const description = item.querySelector('description').textContent;

                const feedItem = document.createElement('div');
                feedItem.classList.add('feed-item');

                const titleElement = document.createElement('h3');
                titleElement.textContent = title;

                const linkElement = document.createElement('a');
                linkElement.href = link;
                linkElement.textContent = 'Read More';

                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = description;

                feedItem.appendChild(titleElement);
                feedItem.appendChild(descriptionElement);
                feedItem.appendChild(linkElement);

                feedContainer.appendChild(feedItem);
            });
        })
        .catch(error => {
            console.error('Error fetching RSS feed:', error);
        });
}

// Example usage: Display the RSS feed from a specific URL
displayRSSFeed('https://example.com/rss.xml');