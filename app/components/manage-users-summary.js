import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  router: service(),
  search: service(),
  store: service(),

  classNames: ['manage-users-summary', 'large-component'],
  tagName: 'section',

  canCreate: false,
  searchValue: null,

  /**
   * Find users using the user API
   * @param {string} q
   */
  async apiSearch(q) {
    let params = {
      q,
      limit: 100,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
    };

    return await this.store.query('user', params);
  },

  /**
   * Find users using the search index API
   * @param {string} q
   */
  async indexSearch(q) {
    return this.search.forUsers(q);
  },

  searchForUsers: task(function * (query) {
    const intl = this.intl;

    let q = cleanQuery(query);
    if (isBlank(q)) {
      yield timeout(1);
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: intl.t('general.moreInputRequiredPrompt')
      }];
    }
    const searchEnabled = yield this.iliosConfig.searchEnabled;
    const searchResults = searchEnabled ? yield this.indexSearch(q) : yield this.apiSearch(q);

    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: intl.t('general.noSearchResultsPrompt')
      }];
    }
    let mappedResults = searchResults.map(user => {
      return {
        type: 'user',
        user
      };
    });
    let results = [
      {
        type: 'summary',
        text: intl.t('general.resultsCount', {count: mappedResults.length})
      }
    ];
    results.pushObjects(mappedResults);

    return results;
  }).restartable(),

  clickUser: task(function* ({ id }) {
    yield this.router.transitionTo('user', id);
    this.set('searchValue', null);
    yield this.searchForUsers.perform(null);
  }).drop(),
});
