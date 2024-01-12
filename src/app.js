import i18n from 'i18next';
import onChange from 'on-change';
import rus from './locales/rus.js';
import {
  renderForm, renderFeeds, renderEntries, renderModal,
} from './renders.js';
import fetchData from './fetchers.js';
import {
  validateURL, parseData,
} from './utils.js';
import updateFeeds from './updatefeeds.js';

const app = () => {
  const state = {
    feeds: [],
    feedLinks: [],
    entries: [],
    currentEntryId: '0',
    viewedPosts: [],
    loadingStatus: 'success',
    form: {
      error: null,
      valid: true,
    },
  };

  i18n.init({
    lng: 'ru',
    resources: {
      ru: {
        translation: rus.translation,
      },
    },
  });

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form':
        renderForm(state);
        break;
      case 'entries':
        renderEntries(state);
        break;
      case 'feeds':
        renderFeeds(state);
        break;
      case 'viewedPosts':
        renderEntries(state);
        break;
      case 'currentEntryId':
        renderModal(state);
        break;
      case 'loadingStatus':
        renderForm(state);
        break;
      default:
        break;
    }
  });

  const render = () => {
    renderForm(state);
    if (state.feeds.length > 0) {
      renderFeeds(state);
      renderEntries(state);
    }
    if (state.currentEntryId !== '0') {
      renderModal(state);
    }
  };

  const postsContainer = document.getElementById('posts');
  postsContainer.addEventListener('click', (e) => {
    if (!e.target.dataset.id) {
      return;
    }
    watchedState.currentEntryId = e.target.dataset.id;
    if (!watchedState.viewedPosts.includes(e.target.dataset.id)) {
      watchedState.viewedPosts.push(e.target.dataset.id);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssLink = formData.get('url');
    watchedState.loadingStatus = 'loading';
    validateURL(rssLink, state.feedLinks)
      .then(() => fetchData(rssLink))
      .then((data) => {
        const newFeed = parseData(data);
        console.log('newFeed', newFeed);
        watchedState.feeds = [...state.feeds, newFeed];
        watchedState.entries = [...state.entries, ...newFeed.entries];
        watchedState.feedLinks = [...state.feedLinks, ...newFeed.link];
        watchedState.currentEntryId = '0';
        watchedState.loadingStatus = 'success';
        watchedState.form = { error: 'rssloaded', valid: true };
      })
      .catch((error) => {
        console.error('Error:', error);
        watchedState.form.error = 'notanrss';
        watchedState.loadingStatus = 'error';
      });
  };

  const form = document.getElementById('input-form');
  form.addEventListener('submit', handleSubmit);

  render();
};

export default app;
