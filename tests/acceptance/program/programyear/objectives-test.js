/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var url = '/program/1/programyear/1';
module('Acceptance: Program Year - Objectives', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school', {
      owningSchool: 1,
      programYears: [1],
      competencies: [1,2]
    });
    server.create('program', {
      owningSchool: 1,
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      competencies: [2,3],
      objectives: [1,2]
    });
    server.create('competency', {
      owningSchool: 1,
      children: [2,3]
    });
    server.create('competency', {
      parent: 1,
      owningSchool: 1,
      programYears: [1],
      objectives: [1]
    });
    server.create('competency', {
      parent: 1,
      owningSchool: 1,
      programYears: [1],
    });
    server.createList('meshDescriptor', 2, {
      objectives: [1]
    });
    server.createList('meshDescriptor', 2);

    server.create('objective', {
      programYears: [1],
      competency: 2,
      meshDescriptors: [1,2]
    });
    server.create('objective', {
      programYears: [1]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list', function(assert) {
  visit(url);
  andThen(function() {
    let objectiveRows = find('.programyear-objective-list tbody tr');
    assert.equal(objectiveRows.length, 2);
    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(0))), getText('objective 0'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(0))), getText('competency 1'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(0))), getText('descriptor 0 descriptor 1'));

    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(1))), getText('objective 1'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(1))), getText('Add New'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(1))), getText('Add New'));
  });
});

test('manage terms', function(assert) {
  assert.expect(21);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives).then(function(){
      assert.equal(getElementText(find('.detail-specific-title', detailObjectives)), 'SelectMeSHDescriptors');
    });

    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 2);
      assert.equal(getElementText(removableItems.eq(0)), getText('descriptor 0'));
      assert.equal(getElementText(removableItems.eq(1)), getText('descriptor 1'));

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, 4);

        assert.equal(getElementText($(searchResults[0])), getText('descriptor 0'));
        assert.equal(getElementText($(searchResults[1])), getText('descriptor 1'));
        assert.equal(getElementText($(searchResults[2])), getText('descriptor 2'));
        assert.equal(getElementText($(searchResults[3])), getText('descriptor 3'));
        assert.ok($(searchResults[0]).hasClass('disabled'));
        assert.ok($(searchResults[1]).hasClass('disabled'));
        assert.ok(!$(searchResults[2]).hasClass('disabled'));
        assert.ok(!$(searchResults[3]).hasClass('disabled'));
        click('.removable-list li:eq(0)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[2]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          assert.equal(getElementText(removableItems.eq(0)), getText('descriptor 1'));
          assert.equal(getElementText(removableItems.eq(1)), getText('descriptor 2'));
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click('button.bigadd', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 1 descriptor 2'));
        });
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click(searchResults[3]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 0 descriptor 1'));
        });
      });
    });
  });
});

test('manage competencies', function(assert) {
  assert.expect(11);
  visit(url);
  andThen(function() {
    let tds = find('.programyear-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 3);
    click('a', tds.eq(1));
    andThen(function() {
      assert.equal(getElementText(find('.detail-specific-title')), 'SelectObjectiveCompetency');
      let objectiveManager = find('.objective-manage-competency').eq(0);
      assert.equal(getElementText(find('h2', objectiveManager)), getText('objective 0'));
      assert.equal(getElementText(find('h4', objectiveManager)), getText('Current Competency: competency 1'));
      assert.equal(getElementText(find('.tree-list.selectable', objectiveManager)), getText('competency0competency2'));

      click('h4 span', objectiveManager).then(function(){
        assert.equal(getElementText(find('h4', objectiveManager)), getText('Current Competency: None'));
        assert.equal(getElementText(find('.tree-list.selectable', objectiveManager)), getText('competency0 competency1 competency2'));
      });
      andThen(function(){
        click('.tree-list li ul li:eq(1)', objectiveManager).then(function(){
          assert.equal(getElementText(find('h4', objectiveManager)), getText('Current Competency: competency 2'));
          assert.equal(getElementText(find('.tree-list.selectable', objectiveManager)), getText('competency0 competency1'));
        });
      });
      andThen(function(){
        click('.tree-list li ul li:eq(0)', objectiveManager).then(function(){
          assert.equal(getElementText(find('h4', objectiveManager)), getText('Current Competency: competency 1'));
          assert.equal(getElementText(find('.tree-list.selectable', objectiveManager)), getText('competency0 competency2'));
        });
      });
    });
  });
});

test('save competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.tree-list li ul li:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 2'));
      });
    });
  });
});

test('save no competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('h4 .clickable', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('Add New'));
      });
    });
  });
});

test('cancel competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.tree-list li ul li:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1'));
      });
    });
  });
});

test('cancel remove competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('h4 .clickable', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1'));
      });
    });
  });
});
