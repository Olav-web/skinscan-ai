import { defineStore } from 'pinia';
import { getInheritedConfiguration } from '@/_common/helpers/configuration/configuration';
 
/* wwFront:start */
// eslint-disable-next-line no-undef
import plugin1fa0dd685069436c9a7d3b54c340f1fa from '@weweb-internal/ext-plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa/config';
import section99586bd32b154d6ba0256a50d07ca845 from '@weweb-internal/ext-section-99586bd3-2b15-4d6b-a025-6a50d07ca845/config';
import wwobjecta823467cbdc74ceca38c71875c4c214a from '@weweb-internal/ext-element-a823467c-bdc7-4cec-a38c-71875c4c214a/config';
import wwobjectaa27b26f06864c2998c58217044045b7 from '@weweb-internal/ext-element-aa27b26f-0686-4c29-98c5-8217044045b7/config';
import wwobject97a634605c254d74ac1f86693c2e4a08 from '@weweb-internal/ext-element-97a63460-5c25-4d74-ac1f-86693c2e4a08/config';
import wwobjectaa29a66107ce484e8abb456186211282 from '@weweb-internal/ext-element-aa29a661-07ce-484e-8abb-456186211282/config';
import wwobjectdeb10a015eef4aa190171b51c2ad6fd0 from '@weweb-internal/ext-element-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0/config';
import wwobjectd7904e9dfc9a4d809e32728e097879ad from '@weweb-internal/ext-element-d7904e9d-fc9a-4d80-9e32-728e097879ad/config';
import wwobject3a7d637912d3438798ffb332bb492a63 from '@weweb-internal/ext-element-3a7d6379-12d3-4387-98ff-b332bb492a63/config';
import wwobject1b1e21739b7842cca8eea6167caea340 from '@weweb-internal/ext-element-1b1e2173-9b78-42cc-a8ee-a6167caea340/config';
import wwobject59dca300db7842e4a7a60cbf22d3cc82 from '@weweb-internal/ext-element-59dca300-db78-42e4-a7a6-0cbf22d3cc82/config';
import wwobjectb783dc65d5284f748c14e27c934c39b1 from '@weweb-internal/ext-element-b783dc65-d528-4f74-8c14-e27c934c39b1/config';
import wwobject9ecb2cfccef74be8b7363e17a3b7e9ff from '@weweb-internal/ext-element-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff/config';
/* wwFront:end */

export const useComponentBasesStore = defineStore('componentBases', () => {
    let configurations;
    /* wwFront:start */
    // eslint-disable-next-line no-undef
    configurations = {'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa': getInheritedConfiguration({ ...plugin1fa0dd685069436c9a7d3b54c340f1fa, name: 'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa' }),
'section-99586bd3-2b15-4d6b-a025-6a50d07ca845': getInheritedConfiguration({ ...section99586bd32b154d6ba0256a50d07ca845, name: 'section-99586bd3-2b15-4d6b-a025-6a50d07ca845' }),
'wwobject-a823467c-bdc7-4cec-a38c-71875c4c214a': getInheritedConfiguration({ ...wwobjecta823467cbdc74ceca38c71875c4c214a, name: 'wwobject-a823467c-bdc7-4cec-a38c-71875c4c214a' }),
'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7': getInheritedConfiguration({ ...wwobjectaa27b26f06864c2998c58217044045b7, name: 'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7' }),
'wwobject-97a63460-5c25-4d74-ac1f-86693c2e4a08': getInheritedConfiguration({ ...wwobject97a634605c254d74ac1f86693c2e4a08, name: 'wwobject-97a63460-5c25-4d74-ac1f-86693c2e4a08' }),
'wwobject-aa29a661-07ce-484e-8abb-456186211282': getInheritedConfiguration({ ...wwobjectaa29a66107ce484e8abb456186211282, name: 'wwobject-aa29a661-07ce-484e-8abb-456186211282' }),
'wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0': getInheritedConfiguration({ ...wwobjectdeb10a015eef4aa190171b51c2ad6fd0, name: 'wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0' }),
'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad': getInheritedConfiguration({ ...wwobjectd7904e9dfc9a4d809e32728e097879ad, name: 'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad' }),
'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63': getInheritedConfiguration({ ...wwobject3a7d637912d3438798ffb332bb492a63, name: 'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63' }),
'wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340': getInheritedConfiguration({ ...wwobject1b1e21739b7842cca8eea6167caea340, name: 'wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340' }),
'wwobject-59dca300-db78-42e4-a7a6-0cbf22d3cc82': getInheritedConfiguration({ ...wwobject59dca300db7842e4a7a60cbf22d3cc82, name: 'wwobject-59dca300-db78-42e4-a7a6-0cbf22d3cc82' }),
'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1': getInheritedConfiguration({ ...wwobjectb783dc65d5284f748c14e27c934c39b1, name: 'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1' }),
'wwobject-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff': getInheritedConfiguration({ ...wwobject9ecb2cfccef74be8b7363e17a3b7e9ff, name: 'wwobject-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff' })};
    /* wwFront:end */
 
    return {
        configurations,
     };
});
