import emitter from 'tiny-emitter/instance';
import services from './services/index.js';

 /* wwFront:start */
// eslint-disable-next-line no-undef
import plugin_1fa0dd68_5069_436c_9a7d_3b54c340f1fa from '@weweb-internal/ext-plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa';
// The token maps of the newer types: `typeof` keeps an empty map when a publisher older than this code leaves the
// placeholder in place.
// eslint-disable-next-line no-undef
const LIBRARY_RADIUS = typeof {"59d06f8d-d332-4e67-90e3-30b24fa95691":"999px","c6ce0ea3-f1e2-454f-94f0-e766dd241fd3":"24px","b6795026-5de4-4279-8377-fdec03415048":"32px","4bd5383c-3c4f-4654-b93a-1995df25c66e":"12px","4fd6aab5-2698-4820-b8fc-6a7d7c82af77":"16px"} === 'undefined' ? {} : {"59d06f8d-d332-4e67-90e3-30b24fa95691":"999px","c6ce0ea3-f1e2-454f-94f0-e766dd241fd3":"24px","b6795026-5de4-4279-8377-fdec03415048":"32px","4bd5383c-3c4f-4654-b93a-1995df25c66e":"12px","4fd6aab5-2698-4820-b8fc-6a7d7c82af77":"16px"};
// eslint-disable-next-line no-undef
const LIBRARY_SHADOWS = typeof {"e819a6e6-29b6-4a16-896e-93b10b3cf0ca":"0 20px 60px var(--c4aebb02-d681-4528-99a9-d8809cfb8056, #5B3CC42E)","b1fb8950-bb0b-4e94-a3f6-27a9fd9516c9":"0 12px 32px var(--c4aebb02-d681-4528-99a9-d8809cfb8056, #5B3CC42E)","66ef84a3-7ce4-4adc-8fcd-7c92bd0639ba":"0 8px 24px var(--ab71964a-3677-4189-8c35-67b7fdcda45c, #5B3CC41A)"} === 'undefined' ? {} : {"e819a6e6-29b6-4a16-896e-93b10b3cf0ca":"0 20px 60px var(--c4aebb02-d681-4528-99a9-d8809cfb8056, #5B3CC42E)","b1fb8950-bb0b-4e94-a3f6-27a9fd9516c9":"0 12px 32px var(--c4aebb02-d681-4528-99a9-d8809cfb8056, #5B3CC42E)","66ef84a3-7ce4-4adc-8fcd-7c92bd0639ba":"0 8px 24px var(--ab71964a-3677-4189-8c35-67b7fdcda45c, #5B3CC41A)"};
// eslint-disable-next-line no-undef
const LIBRARY_BORDERS = typeof {"cbb2afad-0e97-421c-b568-fcc9097b2779":"var(--29fabdc3-d700-4131-908a-8b18451c4188, 1px) solid var(--2126af61-73cd-4e10-8a01-84b8d92493a0, #E9DDFC)","02a2e532-3b4d-44d2-a8aa-9a1102bdad29":"var(--29fabdc3-d700-4131-908a-8b18451c4188, 1px) solid var(--cafd438e-e9c3-4748-8300-c8fc3070d962, #7C5CE6)"} === 'undefined' ? {} : {"cbb2afad-0e97-421c-b568-fcc9097b2779":"var(--29fabdc3-d700-4131-908a-8b18451c4188, 1px) solid var(--2126af61-73cd-4e10-8a01-84b8d92493a0, #E9DDFC)","02a2e532-3b4d-44d2-a8aa-9a1102bdad29":"var(--29fabdc3-d700-4131-908a-8b18451c4188, 1px) solid var(--cafd438e-e9c3-4748-8300-c8fc3070d962, #7C5CE6)"};
/* wwFront:end */

import { computed, reactive } from 'vue';

import { getRuntimeEnvironment } from '@/helpers/frontEnv.js';

import { createEnvironmentVariablesContext } from './services/environmentVariables';
import { createStoreRegistry } from '@/pinia/storeRegistry';
import { disposePinia } from 'pinia';

let runtimeActivationError;

export default {
    /** @type {import('@/pinia/storeRegistry').StoreRegistry} */
    store: undefined,
    /** @internal Install native store references for this application instance. */
    initializeStores(pinia) {
        this.$pinia = pinia;
        this.store = createStoreRegistry(pinia);
    },
    /** @internal Dispose the runtime after its pending operations have completed. */
    disposeStores() {
         if (this.$pinia) disposePinia(this.$pinia);
        this.$pinia = undefined;
        this.store = undefined;
    },
    ...services,
     $on(event, fn) {
        emitter.on(event, fn);
    },
    $once(event, fn) {
        emitter.once(event, fn);
    },
    $emit(event, ...args) {
        if (!event) {
            return;
        }
        emitter.emit(event, ...args);
    },
    $off(event, fn) {
        emitter.off(event, fn);
    },
     front: {},
    $focus: null,
    env: process.env.NODE_ENV,
    runtimeActivated: false,
    async initFront({ router, store, staticRendering = false }) {
 
        this.front.router = router;
        /* wwFront:start */
        this.$store = store;
        /* wwFront:end */

        //Init services
        this.wwLog.init();

 
        await this.wwWebsiteData.init();
        this.wwLang.init(router);

        /* wwFront:start */
        // eslint-disable-next-line no-undef
        wwLib.wwPluginHelper.registerPlugin('plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa', plugin_1fa0dd68_5069_436c_9a7d_3b54c340f1fa);
        /* wwFront:end */

 
        if (!staticRendering) this.activateRuntime();
    },
    activateRuntime() {
        if (this.runtimeActivated) return;
        if (runtimeActivationError) throw runtimeActivationError;

        try {
            void this.wwPluginHelper.activatePlugins();
            services.scrollStore.start();
            services.keyboardEventStore.start();
            services.pwaStore.start();
            this.runtimeActivated = true;
        } catch (error) {
            runtimeActivationError = error;
            throw error;
        }
    },
     // TODO: Verify with Alexis, still uses wwImageMultiLang
    /** @PUBLIC_API The active responsive breakpoint name. */
    get currentBreakpoint() {
        return wwLib.store.front.activeScreenSize;
    },
    /** @PUBLIC_API Reactive breakpoint definitions. */
    get breakpoints() {
        return wwLib.store.front.screenSizes;
    },
    /** @PUBLIC_API Historical method retained for distributed components. */
    getCurrentBreakpoint() {
        return wwLib.currentBreakpoint;
    },
    /** @PUBLIC_API Reactive definitions of the project's responsive breakpoints. */
    getBreakpoints() {
        return wwLib.breakpoints;
    },
    getResponsiveStyleProp({ style, uid, states = [], prop }) {
        if (!style && uid) {
            const wwObject = wwLib.store.websiteData.wwObjects[uid];
            if (!wwObject) return '';
            style = (wwObject._state || {}).style || {};
        }

        const screenSizes = wwLib.store.front.screenSizes;
        const screenSize = wwLib.store.front.activeScreenSize;

        let value = '';

        for (const media in screenSizes) {
            if (style[media] && typeof style[media][prop] !== 'undefined') {
                value = style[media][prop];
            }
            if (media === screenSize) {
                break;
            }
        }
        for (const state of states) {
            for (const media in screenSizes) {
                if (style[`${state}_${media}`] && style[`${state}_${media}`][prop]) {
                    value = style[`${state}_${media}`][prop];
                }
                if (media === screenSize) {
                    break;
                }
            }
        }

        return value;
    },
    globalContext: reactive({
        auth: computed(() => {
            const backAuthStore = wwLib.store.backAuth;
            return {
                user: backAuthStore.user,
                session: backAuthStore.session,
                isAuthenticated: backAuthStore.isAuthenticated,
            };
        }),
        env: computed(() => {
            const envVariablesStore = wwLib.store.envVariables;
            let env = wwLib.getEnvironment();
            if (env === 'preview') env = 'production';
            return createEnvironmentVariablesContext(Object.values(envVariablesStore.values), env);
        }),
        tableViews: computed(() => {
            const backTableViewsStore = wwLib.store.backTableViews;
            return backTableViewsStore?.data;
        }),
        page: computed(() => {
            const page = wwLib.store.websiteData.page;
            if (!page) return {};
            else if (!page.cmsDataSetPath) return { ...pageSanitizer(page) };
            return { ...pageSanitizer(page), data: wwLib.store.data.pageCollectionData };
        }),
        pageParameters: computed(() => {
            const pageParameters = Object.values(wwLib.store.data.pageParameterVariables);
            const pageParametersValueMap = {};
            for (const pageParameter of pageParameters) pageParametersValueMap[pageParameter.id] = pageParameter.value;
            return pageParametersValueMap;
        }),
        pages: computed(() => {
            const pages = wwLib.store.websiteData.pages;
            const pagesValueMap = {};
            for (const page of pages) pagesValueMap[page.id] = pageSanitizer(page);
            return pagesValueMap;
        }),
        colors: computed(() => {
            const theme = wwLib.store.front.resolvedTheme;
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable, no-undef
            return theme === 'dark' ? {"72570547-2d96-4208-ac83-6cf8f613fbca":"#B8AED0","cafd438e-e9c3-4748-8300-c8fc3070d962":"#A78BFA","6eff671f-ab69-4018-907b-45949a1c55e9":"#120D1F","a911ea5a-1070-4b74-9b6d-4bda78cfe93f":"#181226","2126af61-73cd-4e10-8a01-84b8d92493a0":"#2E2445","7e70b56f-c2ac-4bd1-b700-d7719d1fab4f":"#F6F2FF","6f4ad8ea-a88f-4d10-8b90-040ca451304f":"#DDD0FF","d72bdfc8-3fce-4cea-bc6e-3a954afd9877":"#382A14","c4aebb02-d681-4528-99a9-d8809cfb8056":"#00000073","c22e3e7c-a6df-4463-aedc-fc419dbaece8":"#1B3B39","8c114e31-33d8-44e8-a205-eb8781c13c8a":"#3D2447","2fd7c473-bc43-4a89-948c-f11b3365f60e":"#FFD580","ab71964a-3677-4189-8c35-67b7fdcda45c":"#0000004D","d9c1b7c0-845c-433e-84ce-d6ef63acb164":"#221A35","31bbd6f7-da32-4d90-811c-baeafc48ea39":"#2D2247","8c518d57-1dda-4413-9d27-896443a8ebca":"#B9A0FF","2316e123-6fc6-437a-bac1-1f6810a8ed0b":"#232E52","d9a31661-d2d6-466b-978f-30273dc9075c":"#221A35D9","08667dc5-c818-4b53-87ab-406d6e4fc4d7":"#100B1C","ec926f3a-92b9-47a8-a9f1-b5f73e1ec662":"#FFFFFF","93168414-8edd-450e-8caa-9d5ef773e4af":"#4A3780","76d17703-1f76-4af7-af47-0ba8a578d9fe":"#5A4499","8a80fb2f-6a5c-4c38-a55a-2e5f2c08e501":"#E4DAFF","24ae97fd-0db8-4e82-959a-a2de36ac56ef":"#472E20"} : {"72570547-2d96-4208-ac83-6cf8f613fbca":"#5E5277","cafd438e-e9c3-4748-8300-c8fc3070d962":"#7C5CE6","6eff671f-ab69-4018-907b-45949a1c55e9":"#FFFFFF","a911ea5a-1070-4b74-9b6d-4bda78cfe93f":"#F7F2FF","2126af61-73cd-4e10-8a01-84b8d92493a0":"#E9DDFC","7e70b56f-c2ac-4bd1-b700-d7719d1fab4f":"#1E1633","6f4ad8ea-a88f-4d10-8b90-040ca451304f":"#5B3CC4","d72bdfc8-3fce-4cea-bc6e-3a954afd9877":"#FFF7E6","c4aebb02-d681-4528-99a9-d8809cfb8056":"#5B3CC42E","c22e3e7c-a6df-4463-aedc-fc419dbaece8":"#D9F5F0","8c114e31-33d8-44e8-a205-eb8781c13c8a":"#F6E2FA","2fd7c473-bc43-4a89-948c-f11b3365f60e":"#8A5300","ab71964a-3677-4189-8c35-67b7fdcda45c":"#5B3CC41A","d9c1b7c0-845c-433e-84ce-d6ef63acb164":"#FFFFFF","31bbd6f7-da32-4d90-811c-baeafc48ea39":"#E8DCFF","8c518d57-1dda-4413-9d27-896443a8ebca":"#6845D4","2316e123-6fc6-437a-bac1-1f6810a8ed0b":"#E3EAFF","d9a31661-d2d6-466b-978f-30273dc9075c":"#FFFFFFD9","08667dc5-c818-4b53-87ab-406d6e4fc4d7":"#EFE7FA","ec926f3a-92b9-47a8-a9f1-b5f73e1ec662":"#FFFFFF","93168414-8edd-450e-8caa-9d5ef773e4af":"#D8C7FF","76d17703-1f76-4af7-af47-0ba8a578d9fe":"#C6AEFF","8a80fb2f-6a5c-4c38-a55a-2e5f2c08e501":"#F1EAFF","24ae97fd-0db8-4e82-959a-a2de36ac56ef":"#FFEADA"};
            /* wwFront:end */
        }),
        spacings:
         /* wwFront:start */
        // eslint-disable-next-line no-unreachable, no-undef
        {"8469f746-7ac5-44ec-90d9-c9131952ae45":"32px","657b6a48-1259-4548-b7cd-38dd3396395b":"10px","dc1bb879-c150-4649-af0b-05e48dcfcfda":"9999px","bf66aa79-d564-4016-8af7-426d2bf9544f":"4px","ffdf652e-e0c5-4a1c-b9fc-fc62cdc51541":"24px","f877b352-50d0-4644-9c3f-1450810c9e0d":"40px","12b9b3bb-fc1a-406d-956b-c825ddbf9a70":"8px","9ddddd64-a946-425b-845d-2a279cf3a9dc":"16px","16486b73-c919-4795-9735-3d762db735d9":"20px","29fabdc3-d700-4131-908a-8b18451c4188":"1px","0d2652b1-e8e1-48d8-95e1-15099ccaea26":"12px"},
        /* wwFront:end */
        typographies:
         /* wwFront:start */
        // eslint-disable-next-line no-unreachable, no-undef
        {"e683a02d-16e2-4f37-95c7-01f7a93d426d":"700 32px/1.25 var(--ww-default-font-family, sans-serif)","8a59e0ca-b392-4367-b3be-efbf06eae986":"400 14px/1.5 var(--ww-default-font-family, sans-serif)","f380bc6f-a059-49e1-b685-6f09211d5f2b":"600 12px/1.4 var(--ww-default-font-family, sans-serif)","d85b09ce-9e68-433a-8798-ec59aa846216":"700 26px/1.2 var(--ww-default-font-family, sans-serif)","ef42bd1c-96b7-4f22-90fa-5d5fc04f3a5f":"600 16px/1.2 var(--ww-default-font-family, sans-serif)","59ac0229-4cf4-40c4-8445-c14484dc6b20":"700 18px/1.3 var(--ww-default-font-family, sans-serif)","82820ced-95f2-4f85-9f18-e92158401732":"500 11px/1.2 var(--ww-default-font-family, sans-serif)","bce4de82-95a5-449b-9b87-8963d21d1518":"700 16px/1.3 var(--ww-default-font-family, sans-serif)","8f529328-a971-4bff-bee8-23488213bf8f":"400 15px/1.5 var(--ww-default-font-family, sans-serif)","7ba32911-065e-4c23-afda-6131e0e428b2":"700 28px/1.2 var(--ww-default-font-family, sans-serif)","3058653c-b260-4107-bbce-ec1fd4f28b99":"400 12px/1.4 var(--ww-default-font-family, sans-serif)"},
        /* wwFront:end */
        // The newer token types (see LIBRARY_RADIUS). Shadows and borders keep their var(--color): the CSS resolves it.
        radius:
         /* wwFront:start */
        LIBRARY_RADIUS,
        /* wwFront:end */
        shadows:
         /* wwFront:start */
        LIBRARY_SHADOWS,
        /* wwFront:end */
        borders:
         /* wwFront:start */
        LIBRARY_BORDERS,
        /* wwFront:end */
        browser: computed(() => {
            const router = wwLib.manager ? wwLib.getEditorRouter() : wwLib.getFrontRouter();
            const currentRoute = router.currentRoute.value;
            let currentQueries = currentRoute.query;
             return {
                url: window.location.origin + currentRoute.fullPath,
                path: currentRoute.path,
                // verify if auth plugin
                 /* wwFront:start */
                // eslint-disable-next-line no-dupe-keys
                source: currentQueries._source,
                /* wwFront:end */
                query: currentQueries,
                domain: window.location.hostname,
                baseUrl: window.location.origin,
                breakpoint: wwLib.store.front.activeScreenSize,
                environment: wwLib.getEnvironment(),
                theme: wwLib.store.front.resolvedTheme,
            };
        }),
        pwa: services.pwaStore.pwa,
        screen: services.scrollStore.screen,
        componentPositionInfo: services.scrollStore.componentPositionInfo,
    }),

    pageData: computed(() => {
        const lang = wwLib.store.front.lang;
        const cmsDataSetPath = wwLib.store.websiteData.page.cmsDataSetPath;
        if (!cmsDataSetPath) {
            return { lang };
        }

        return { lang, data: wwLib.store.data.pageCollectionData };
    }),

    getEnvironment() {
        return getRuntimeEnvironment();
    },

    useBaseTag() {
        return (
            wwLib.getEnvironment() === 'production' &&
            window.wwg_designInfo.baseTag &&
            window.wwg_designInfo.baseTag.href
        );
    },

    getBaseTag() {
        let baseTag = window.wwg_designInfo.baseTag?.href || '';
        if (!baseTag.startsWith('/')) {
            baseTag = '/' + baseTag;
        }
        if (!baseTag.endsWith('/')) {
            baseTag += '/';
        }
        return baseTag;
    },

    /**
     * @PUBLIC_API
     */
    getFrontWindow() {
        // This is called for every compiled CSS declaration and Vue timing measurement.
        // In the canvas document there is no nested editor iframe: a class selector would
        // scan the entire rendered page on every call. The editor iframe has a fixed ID.
        return document.getElementById('ww-manager-iframe')?.contentWindow || window;
    },

    /**
     * @PUBLIC_API
     */
    getFrontDocument() {
        return this.getFrontWindow().document;
    },

    /**
     * @PUBLIC_API
     */
    getFrontRouter() {
        return this.front.router;
    },

    /**
     * @PUBLIC_API
     */
    getEditorWindow() {
         // eslint-disable-next-line no-unreachable
        return null;
    },

    /**
     * @PUBLIC_API
     */
    getEditorDocument() {
         // eslint-disable-next-line no-unreachable
        return null;
    },

    /**
     * @PUBLIC_API
     */
    getEditorRouter() {
        return this.editor.router;
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwApp.goTo
     */
    goTo(...args) {
        wwLib.wwLog.warn('wwLib.goTo is DEPRECATED, use wwLib.wwApp.goTo instead');
        wwLib.wwApp.goTo(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.getStyleFromToken
     */
    getStyleFromToken(...args) {
        // wwLib.wwLog.warn('wwLib.getStyleFromToken is DEPRECATED, use wwLib.wwUtils.getStyleFromToken instead');
        return wwLib.wwUtils.getStyleFromToken(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.getTypoFromToken
     */
    getTypoFromToken(...args) {
        // wwLib.wwLog.warn('wwLib.getTypoFromToken is DEPRECATED, use wwLib.wwUtils.getTypoFromToken instead');
        return wwLib.wwUtils.getTypoFromToken(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED
     */
    element(value) {
        wwLib.wwLog.warn('wwLib.element is DEPRECATED');
        if (typeof value === 'object') {
            return { isWwObject: true, ...value };
        } else {
            return { isWwObject: true, type: value };
        }
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwUtils.resolveObjectPropertyPath
     */
    resolveObjectPropertyPath(...args) {
        // wwLib.wwLog.warn(
        //     'wwLib.resolveObjectPropertyPath is DEPRECATED, use wwLib.wwUtils.resolveObjectPropertyPath instead'
        // );
        return wwLib.wwUtils.resolveObjectPropertyPath(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwWorkflow.executeGlobal
     */
    async executeWorkflow(...args) {
        wwLib.wwLog.warn('wwLib.executeWorkflow is DEPRECATED, use wwLib.wwWorkflow.executeGlobal instead');
        return wwLib.wwWorkflow.executeGlobal(...args);
    },

    /**
     * @PUBLIC_API
     * @EDITOR
     * @DEPRECATED wwLib.wwEditor.findParentUidByFlag
     */
    findParentUidByFlag(...args) {
        wwLib.wwLog.warn('wwLib.wwEditor.findParentUidByFlag is DEPRECATED, use wwLib.findParentUidByFlag instead');
        return wwLib.wwEditor.findParentUidByFlag(...args);
    },

    /**
     * @PUBLIC_API
     * @EDITOR
     * @DEPRECATED wwLib.wwEditor.selectParentByFlag
     */
    selectParentByFlag(...args) {
        wwLib.wwLog.warn('wwLib.wwEditor.selectParentByFlag is DEPRECATED, use wwLib.selectParentByFlag instead');
        return wwLib.wwEditor.selectParentByFlag(...args);
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwElement.useCreate
     */
    useCreateElement() {
        wwLib.wwLog.warn('wwLib.useCreateElement is DEPRECATED, use wwLib.wwElement.useCreate instead');
        return this.wwElement.useCreate();
    },

    /**
     * @PUBLIC_API
     * @DEPRECATED wwLib.wwElement.useLayoutStyle
     */
    useLayoutStyle() {
        wwLib.wwLog.warn('wwLib.useLayoutStyle is DEPRECATED, use wwLib.wwElement.useLayoutStyle instead');
        return wwLib.wwElement.useLayoutStyle();
    },

    /**
     * @PUBLIC_API
     */
    useIcons() {
        const store = wwLib.store.icons;
        return {
            getIcon: store.getIcon,
        };
    },
};

 
function pageSanitizer(page) {
    const keysToInclude = [
        'id',
        'name',
        'folder',
        'metaImage',
        'pageLoaded',
        'paths',
        'langs',
        'meta',
        'title',
        'sections',
        'pageUserGroups',
    ];

    const _page = {};
    keysToInclude.forEach(key => {
        _page[key] = page[key];
    });

    _page.meta && delete _page.meta.__typename;
    for (const section of _page.sections || []) {
        delete section.__typename;
    }

    const lang = wwLib.store.front.lang;
    if (_page.paths) _page.path = _page.paths[lang] || _page.paths.default;
    else _page.path = null;

    _page.lang = lang;

    return _page;
}
