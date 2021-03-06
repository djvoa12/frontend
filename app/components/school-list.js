/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { sort } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    }),
  ],
  iliosAdministratorEmail: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    }),
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  currentUser: service(),
  store: service(),
  init(){
    this._super(...arguments);
    this.set('sortSchoolsBy', ['title']);
  },
  classNames: ['school-list'],
  tagName: 'section',
  schools: null,
  newSchool: null,
  title: null,
  iliosAdministratorEmail: null,
  isSavingNewSchool: false,

  sortSchoolsBy: null,
  sortedSchools: sort('schools', 'sortSchoolsBy'),
  showNewSchoolForm: false,

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('createNewSchool');
      return;
    }

    if(27 === keyCode) {
      this.send('hideNewSchoolForm');
    }
  },
  actions: {
    toggleNewSchoolForm(){
      this.set('showNewSchoolForm', !this.showNewSchoolForm);
      this.set('newSchool', null);
      this.set('title', null);
      this.set('iliosAdministratorEmail', null);
    },
    hideNewSchoolForm(){
      this.set('showNewSchoolForm', false);
      this.set('title', null);
      this.set('iliosAdministratorEmail', null);
    },
    createNewSchool() {
      this.set('isSavingNewSchool', true);
      this.send('addErrorDisplayFor', 'title');
      this.send('addErrorDisplayFor', 'iliosAdministratorEmail');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.title;
          const iliosAdministratorEmail = this.iliosAdministratorEmail;
          let newSchool = this.store.createRecord('school', {title, iliosAdministratorEmail});
          newSchool.save().then(school => {
            this.set('newSchool', school);
          }).finally(() => {
            this.send('clearErrorDisplay');
            this.set('title', null);
            this.set('iliosAdministratorEmail', null);
            this.set('showNewSchoolForm', false);
            this.set('isSavingNewSchool', false);
          });
        } else {
          this.set('isSavingNewSchool', false);
        }
      });
    },
  }
});
