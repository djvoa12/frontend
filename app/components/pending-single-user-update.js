import Ember from 'ember';

const { Component, computed, RSVP } = Ember;
const { reads } = computed;

export default Component.extend({
  user: null,
  isSaving: false,
  updates: reads('user.pendingUserUpdates'),
  classNames: ['pending-single-user-updates'],

  actions: {
    updateEmailAddress(update){
      this.set('isSaving', true);
      let user = this.get('user');
      user.set('email', update.get('value'));
      user.save().then(() => {
        update.deleteRecord();
        update.save().then(() => {
          this.set('isSaving', false);
          this.get('flashMessages').success('general.savedSuccessfully');
        });
      });
    },
    disableUser(update){
      this.set('isSaving', true);
      let user = this.get('user');
      user.set('enabled', false);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.get('flashMessages').success('general.savedSuccessfully');
          });
        });
      });

    },
    excludeFromSync(update){
      this.set('isSaving', true);
      let user = this.get('user');
      user.set('userSyncIgnore', true);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.get('flashMessages').success('general.savedSuccessfully');
          });
        });
      });
    }
  }
});
