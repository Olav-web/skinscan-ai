import './styleCompiler/ww-style-page-5e1ab57f-8a7e-480e-a03b-63bfbe179f8a.css';
/*__WW_PAGE_COMPONENT_IMPORTS_START__*/

// eslint-disable-next-line no-undef
import element_1b1e2173_9b78_42cc_a8ee_a6167caea340 from "@weweb-internal/ext-element-1b1e2173-9b78-42cc-a8ee-a6167caea340";
import element_aa27b26f_0686_4c29_98c5_8217044045b7 from "@weweb-internal/ext-element-aa27b26f-0686-4c29-98c5-8217044045b7";
import element_b783dc65_d528_4f74_8c14_e27c934c39b1 from "@weweb-internal/ext-element-b783dc65-d528-4f74-8c14-e27c934c39b1";
import element_d7904e9d_fc9a_4d80_9e32_728e097879ad from "@weweb-internal/ext-element-d7904e9d-fc9a-4d80-9e32-728e097879ad";
import element_deb10a01_5eef_4aa1_9017_1b51c2ad6fd0 from "@weweb-internal/ext-element-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0";

// eslint-disable-next-line no-undef
import section_99586bd3_2b15_4d6b_a025_6a50d07ca845 from "@weweb-internal/ext-section-99586bd3-2b15-4d6b-a025-6a50d07ca845";

/*__WW_PAGE_COMPONENT_IMPORTS_END__*/

import { registerSsrPageComponents } from '@/_front/rendering/ssrPageComponents';

let isRegistered = false;

export default async function registerPageComponents(app) {
    if (isRegistered) return;

    if (import.meta.env.SSR) {
        await registerSsrPageComponents(
            app,
            // eslint-disable-next-line no-undef
            /*__WW_SSR_PAGE_COMPONENT_DESCRIPTORS_START__*/
[
    {
        "baseId": "1b1e2173-9b78-42cc-a8ee-a6167caea340",
        "importPath": "@weweb-internal/ext-element-1b1e2173-9b78-42cc-a8ee-a6167caea340",
        "name": "wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340",
        "type": "element"
    },
    {
        "baseId": "aa27b26f-0686-4c29-98c5-8217044045b7",
        "importPath": "@weweb-internal/ext-element-aa27b26f-0686-4c29-98c5-8217044045b7",
        "name": "wwobject-aa27b26f-0686-4c29-98c5-8217044045b7",
        "type": "element"
    },
    {
        "baseId": "b783dc65-d528-4f74-8c14-e27c934c39b1",
        "importPath": "@weweb-internal/ext-element-b783dc65-d528-4f74-8c14-e27c934c39b1",
        "name": "wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1",
        "type": "element"
    },
    {
        "baseId": "d7904e9d-fc9a-4d80-9e32-728e097879ad",
        "importPath": "@weweb-internal/ext-element-d7904e9d-fc9a-4d80-9e32-728e097879ad",
        "name": "wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad",
        "type": "element"
    },
    {
        "baseId": "deb10a01-5eef-4aa1-9017-1b51c2ad6fd0",
        "importPath": "@weweb-internal/ext-element-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0",
        "name": "wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0",
        "type": "element"
    },
    {
        "baseId": "99586bd3-2b15-4d6b-a025-6a50d07ca845",
        "importPath": "@weweb-internal/ext-section-99586bd3-2b15-4d6b-a025-6a50d07ca845",
        "name": "section-99586bd3-2b15-4d6b-a025-6a50d07ca845",
        "type": "section"
    }
]
/*__WW_SSR_PAGE_COMPONENT_DESCRIPTORS_END__*/
        );
    } else {
        // eslint-disable-next-line no-undef
        app.component("wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340", element_1b1e2173_9b78_42cc_a8ee_a6167caea340);
app.component("wwobject-aa27b26f-0686-4c29-98c5-8217044045b7", element_aa27b26f_0686_4c29_98c5_8217044045b7);
app.component("wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1", element_b783dc65_d528_4f74_8c14_e27c934c39b1);
app.component("wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad", element_d7904e9d_fc9a_4d80_9e32_728e097879ad);
app.component("wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0", element_deb10a01_5eef_4aa1_9017_1b51c2ad6fd0);

        // eslint-disable-next-line no-undef
        app.component("section-99586bd3-2b15-4d6b-a025-6a50d07ca845", section_99586bd3_2b15_4d6b_a025_6a50d07ca845);
    }

    isRegistered = true;
}
