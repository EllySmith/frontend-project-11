import fetchInfo from './fetchers.js';

async function updateFeeds(state, render) {
  const { feedLinks } = state;
  let currentEntriesCount = 0;

  for (const feed of feedLinks) {
    try {
      const entries = await fetchInfo(feed, 'entries');
      currentEntriesCount += entries.length;
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  }

  if (currentEntriesCount !== state.entriesCount) {
    render(state);
    console.log('update, add');
  }
  console.log('update');
}

export default updateFeeds;
