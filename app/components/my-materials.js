/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import SortableTable from 'ilios-common/mixins/sortable-table';

export default Component.extend(SortableTable, {
  classNames: ['my-materials'],
  filter: null,
  courseIdFilter: null,
  filteredMaterials: computed('materials.[]', 'filter', 'courseIdFilter', function(){
    let materials = this.materials;
    const filter = this.filter;
    const courseIdFilter = this.courseIdFilter;
    if (isPresent(courseIdFilter)) {
      materials = materials.filterBy('course', courseIdFilter);
    }
    if (isPresent(filter)) {

      materials = materials.filter(material => {
        let searchString = material.title + ' ' + material.courseTitle + ' ' + material.sessionTitle + ' ';
        if (isPresent(material.instructors)) {
          searchString += material.instructors.join(' ');
        }
        return searchString.toLowerCase().includes(filter.toLowerCase());
      });
    }

    return materials;
  }),
  courses: computed('materials.[]', function(){
    const materials = this.materials;
    return materials.map(material => {
      return {
        id: material.course,
        title: material.courseTitle
      };
    }).uniqBy('id').sortBy('title');
  }),
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
