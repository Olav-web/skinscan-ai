import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router';

import wwPage from './views/wwPage.vue';

import {
    initializeData,
    initializePlugins,
    initializeIntegrationInstances,
    onPageUnload,
} from '@/_common/helpers/data';
import { convertPathToRouterFormat } from '@/_common/helpers/urlParametersParsing';
import { getRuntimeEnvironment } from '@/helpers/frontEnv.js';

/* wwFront:start */
import { isStaticRenderingActive } from '@/_front/rendering/staticRenderingContext';
import { redirectToAppAccessSignIn } from '@/_common/helpers/code/appAccessRedirects';
/* wwFront:end */

/**
 * @typedef {import('vue-router').Router} Router
 * @typedef {import('vue-router').RouteRecordRaw} RouteRecordRaw
 * @typedef {import('vue-router').RouterOptions} RouterOptions
 * @typedef {import('vue-router').RouterScrollBehavior} RouterScrollBehavior
 */

/**
 * @typedef {Object} Lang
 * @property {string} lang
 * @property {boolean} [default]
 * @property {boolean} [isDefaultPath]
 */

/**
 * @typedef {Object} PageSecurity
 * @property {'authenticated' | string} [accessRule]
 * @property {string[]} [accessRoles]
 * @property {'AND' | 'OR'} [accessRolesCondition]
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {Record<string, string> & { default: string }} paths
 * @property {string[]} langs
 * @property {PageSecurity} [security]
 * @property {{ userGroup: string }[]} [pageUserGroups]
 */

/**
 * @typedef {Object} DesignInfo
 * @property {string} homePageId
 * @property {Page[]} pages
 * @property {Lang[]} langs
 * @property {unknown} [auth]
 * @property {{ href?: string }} [baseTag]
 */

/** @type {Router} */
let router;
/** @type {RouteRecordRaw[]} */
const routes = [];

/** @type {RouterScrollBehavior} */
const scrollBehavior = to => {
    if (to.hash) {
        return {
            el: to.hash,
            behavior: 'smooth',
        };
    } else {
        return { top: 0 };
    }
};

 
/* wwFront:start */
import pluginsSettings from '../../plugins-settings.json';

window.wwg_designInfo = {"id":"ec750c20-3660-4cb0-98db-7a40a85ee50d","runtimeStyleIdStart":555,"homePageId":"7deff766-424b-468f-965f-2a9f0961811d","authPluginId":"1fa0dd68-5069-436c-9a7d-3b54c340f1fa","baseTag":null,"defaultTheme":"light","langs":[{"lang":"en","default":true}],"background":{},"workflows":[{"id":"ac2d254e-e97e-4140-8e85-e53d45e6bdb7","name":"SkinScan varsel om ny publisert versjon","folder":null,"actions":{"monitor":{"id":"monitor","code":"// SkinScan AI: Varsle kun når Cloudflare faktisk har publisert en nyere appversjon.\n// Påvirker ikke innlogging, navigasjon eller brukerdata.\nconst win = window;\nconst doc = document;\nif (win.location.hostname !== 'skinscan-ai.jensens-isotec.no') return;\nif (win.__skinscanUpdateCheckStarted) return;\nwin.__skinscanUpdateCheckStarted = true;\n\nconst storageKey = 'skinscan_update_ignored_version';\nconst acceptedKey = 'skinscan_update_accepted_version';\nconst bannerId = 'skinscan-update-banner';\nconst currentScripts = [...doc.querySelectorAll('script[src]')]\n  .map(el => el.getAttribute('src') || '');\nconst assetPattern = new RegExp('/assets/(?:main|index)-[a-zA-Z0-9_-]+[.]js');\nconst currentAsset = currentScripts\n  .map(src => src.match(assetPattern)?.[0])\n  .find(Boolean);\nif (!currentAsset) return;\n\nfunction showUpdate(latestAsset) {\n  if (doc.getElementById(bannerId)) return;\n  const box = doc.createElement('div');\n  box.id = bannerId;\n  box.setAttribute('role', 'status');\n  box.setAttribute('aria-live', 'polite');\n  box.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483647;box-sizing:border-box;width:min(92vw,430px);padding:17px;background:#fff;border:2px solid #d8bff2;border-radius:16px;box-shadow:0 8px 30px #29133838;color:#321e4a;font-family:system-ui,-apple-system,sans-serif;';\n  const label = doc.createElement('div');\n  label.style.cssText = 'font-size:15px;font-weight:700;margin-bottom:8px;';\n  label.textContent = '💜 En ny versjon av SkinScan AI er tilgjengelig.';\n  const explanation = doc.createElement('div');\n  explanation.style.cssText = 'font-size:13px;line-height:1.45;margin-bottom:13px;';\n  explanation.textContent = 'Vil du oppdatere nå? Lagre eller avslutt det du holder på med først.';\n  const row = doc.createElement('div');\n  row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';\n  function button(text, background, color) {\n    const b = doc.createElement('button');\n    b.type = 'button';\n    b.textContent = text;\n    b.style.cssText = 'padding:11px 14px;border:0;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;flex:1;min-width:110px;background:'+background+';color:'+color+';';\n    return b;\n  }\n  const update = button('Oppdater nå', '#8d5de3', '#fff');\n  update.addEventListener('click', () => {\n    // Husker valget dersom nettleseren beholder forrige versjon i cache.\n    try { win.localStorage.setItem(acceptedKey, latestAsset); } catch (_) {}\n    const url = new URL(win.location.href);\n    url.searchParams.set('ss_update', String(Date.now()));\n    win.location.replace(url.toString());\n  });\n  const later = button('Senere', '#eee1fb', '#432866');\n  later.addEventListener('click', () => {\n    try { win.sessionStorage.setItem(storageKey, latestAsset); } catch (_) {}\n    box.remove();\n  });\n  row.append(update, later);\n  box.append(label, explanation, row);\n  doc.body.appendChild(box);\n}\nlet busy = false;\nasync function checkPublishedVersion() {\n  if (busy || doc.visibilityState === 'hidden') return;\n  busy = true;\n  try {\n    const checkUrl = new URL('/', win.location.origin);\n    checkUrl.searchParams.set('ss_version_check', String(Date.now()));\n    const response = await win.fetch(checkUrl.toString(), {cache:'no-store', credentials:'same-origin'});\n    if (!response.ok) return;\n    const html = await response.text();\n    const remoteDoc = new DOMParser().parseFromString(html, 'text/html');\n    const remoteScripts = [...remoteDoc.querySelectorAll('script[src]')].map(el => el.getAttribute('src') || '');\n    const latestAsset = remoteScripts.map(src => src.match(assetPattern)?.[0]).find(Boolean);\n    if (!latestAsset || latestAsset === currentAsset) {\n      doc.getElementById(bannerId)?.remove();\n      return;\n    }\n    let ignored = null, accepted = null;\n    try { ignored = win.sessionStorage.getItem(storageKey); } catch (_) {}\n    try { accepted = win.localStorage.getItem(acceptedKey); } catch (_) {}\n    if (latestAsset !== ignored && latestAsset !== accepted) showUpdate(latestAsset);\n  } catch (_) {\n    // Manglende nettverk skal aldri forstyrre appen.\n  } finally {\n    busy = false;\n  }\n}\nwin.setInterval(checkPublishedVersion, 90000);\ndoc.addEventListener('visibilitychange', () => {\n  if (doc.visibilityState === 'visible') checkPublishedVersion();\n});\nwin.setTimeout(checkPublishedVersion, 15000);\nreturn true;","name":"Kontroller ny publisert versjon","next":null,"type":"custom-js","__wwdescription":"Sjekk publisert byggeversjon periodisk og vis oppdateringsvarsel bare ved endring."}},"trigger":"onload-app","description":"Sammenligner faktisk publisert Cloudflare Vite JS-fil med innlastet versjon, og varsler bare ved ekte ny versjon. Oppdater nå/Senere, ikke på hvert sidebytte. Ingen endringer i innlogging.","firstAction":"monitor"}],"back":{"isServerSetup":{"staging":false,"production":false}},"auth":{"integration":"supabase","connectionId":"841c7bc6-118b-47f5-9627-7789f31468ba","unauthenticatedPageId":"c1ff45da-3b9d-44eb-a594-143737b0e8f6","unauthorizedPageId":"7deff766-424b-468f-965f-2a9f0961811d"},"pages":[{"id":"573ae9c9-fc97-4211-b046-57455192f60e","linkId":"573ae9c9-fc97-4211-b046-57455192f60e","name":"Historikk","folder":null,"paths":{"en":"historikk","default":"historikk"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"58e480a9-086e-4394-9167-1ea9722b0fbc","sectionTitle":"Historikk Seksjon","linkId":"03783c2c-b121-43e1-8224-aac422117b85"},{"uid":"eb9eb506-e859-41cb-bcb2-43956326532a","sectionTitle":"Bunnnavigasjon Seksjon","linkId":"5e973b0c-bc79-41a1-b89b-bf75c413b324"}],"pageUserGroups":[],"title":{"en":"Tidligere analyser – SkinScan AI"},"meta":{},"metaImage":"","security":{}},{"id":"84e7b909-e46f-47e5-bdb5-b04c84544923","linkId":"84e7b909-e46f-47e5-bdb5-b04c84544923","name":"404","folder":null,"paths":{"en":"404","default":"404"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"0145af89-3087-4140-bec7-06fea401495e","sectionTitle":"404 Section","linkId":"096fd5e2-8237-4f5e-b89c-2377aef01a14"}],"pageUserGroups":[],"title":{},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"","security":{}},{"id":"7deff766-424b-468f-965f-2a9f0961811d","linkId":"7deff766-424b-468f-965f-2a9f0961811d","name":"Velkomst","folder":null,"paths":{"en":"velkomst","default":"velkomst"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"b26676ed-9a09-42fb-b50d-dd710978148b","sectionTitle":"Velkomst Seksjon","linkId":"9a68ddcb-8249-429d-965b-943723f040d2"}],"pageUserGroups":[],"title":{"en":"SkinScan AI – Din personlige hudpleieassistent"},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"","security":{}},{"id":"c1ff45da-3b9d-44eb-a594-143737b0e8f6","linkId":null,"name":"Login","folder":"Auth/","paths":{"en":"login","default":"login"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"49640b67-3113-4b1c-8355-c631e87305f4","sectionTitle":"Login Page Root","linkId":"497e4f65-b46c-4c3f-983e-81c23e39e55f"}],"pageUserGroups":[],"title":{},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"","security":{}},{"id":"877effa8-1436-42d7-8a29-3cfe2b92320c","linkId":"877effa8-1436-42d7-8a29-3cfe2b92320c","name":"Mer","folder":null,"paths":{"en":"mer","default":"mer"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"75861f7d-c97c-475d-8df1-b3744294c54b","sectionTitle":"Mer Seksjon","linkId":"e95fc76c-05e0-4c42-a51c-a4eda8fb21fd"},{"uid":"eb9eb506-e859-41cb-bcb2-43956326532a","sectionTitle":"Bunnnavigasjon Seksjon","linkId":"5e973b0c-bc79-41a1-b89b-bf75c413b324"}],"pageUserGroups":[],"title":{"en":"Mer – SkinScan AI"},"meta":{},"metaImage":"","security":{}},{"id":"5e1ab57f-8a7e-480e-a03b-63bfbe179f8a","linkId":"5e1ab57f-8a7e-480e-a03b-63bfbe179f8a","name":"Hjem","folder":null,"paths":{"en":"hjem","default":"hjem"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"2f5da828-3b9a-4b7a-a688-ccf5fdb7edda","sectionTitle":"Hjem Seksjon","linkId":"ae8ada2e-1bae-4cbc-b78e-06afec7bf09f"},{"uid":"eb9eb506-e859-41cb-bcb2-43956326532a","sectionTitle":"Bunnnavigasjon Seksjon","linkId":"5e973b0c-bc79-41a1-b89b-bf75c413b324"}],"pageUserGroups":[],"title":{"en":"Hjem – SkinScan AI"},"meta":{},"metaImage":"","security":{}},{"id":"b9084f6c-c01c-47fb-9a07-63309fd672e8","linkId":"b9084f6c-c01c-47fb-9a07-63309fd672e8","name":"Profil","folder":null,"paths":{"en":"profil","default":"profil"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"8eaa7031-8aa2-49aa-8f8a-8966de0192d0","sectionTitle":"Profil Seksjon","linkId":"5b344dc1-d73a-41ef-a034-88a47353040f"},{"uid":"eb9eb506-e859-41cb-bcb2-43956326532a","sectionTitle":"Bunnnavigasjon Seksjon","linkId":"5e973b0c-bc79-41a1-b89b-bf75c413b324"}],"pageUserGroups":[],"title":{"en":"Din hudprofil – SkinScan AI"},"meta":{},"metaImage":"","security":{}},{"id":"e2cbe640-0ea1-48bd-aa9e-e31a6135ccaf","linkId":"e2cbe640-0ea1-48bd-aa9e-e31a6135ccaf","name":"Analyse","folder":null,"paths":{"en":"analyse","default":"analyse"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"bf3cf98c-3753-4a9b-88cf-c2b8520b88e1","sectionTitle":"Analyse Seksjon","linkId":"3edbaf41-31a7-409a-a992-77f7f8a45719"},{"uid":"eb9eb506-e859-41cb-bcb2-43956326532a","sectionTitle":"Bunnnavigasjon Seksjon","linkId":"5e973b0c-bc79-41a1-b89b-bf75c413b324"}],"pageUserGroups":[],"title":{"en":"Hudanalyse – SkinScan AI"},"meta":{},"metaImage":"","security":{}}],"plugins":[{"id":"1fa0dd68-5069-436c-9a7d-3b54c340f1fa","name":"Supabase Auth","namespace":"supabaseAuth"}]};
window.wwg_cacheVersion = 7;
window.wwg_pluginsSettings = pluginsSettings;
window.wwg_disableManifest = true;

/** @type {Lang} */
const defaultLang = window.wwg_designInfo.langs.find(({ default: isDefault }) => isDefault) || {
    lang: 'en',
    default: true,
};
const isServerRendering = import.meta.env.SSR;

/**
 * @param {Page} page
 * @param {Lang} lang
 * @param {string} [forcedPath]
 */
const registerRoute = (page, lang, forcedPath) => {
    const langSlug = !lang.default || lang.isDefaultPath ? `/${lang.lang}` : '';
    let path =
        forcedPath ||
        (page.id === window.wwg_designInfo.homePageId ? '/' : `/${page.paths[lang.lang] || page.paths.default}`);

    path = convertPathToRouterFormat(path);

    routes.push({
        path: langSlug + path,
        component: wwPage,
        name: `page-${page.id}-${lang.lang}`,
        meta: {
            pageId: page.id,
            lang,
            isPrivate: !!page.pageUserGroups?.length,
        },
        async beforeEnter(to, from) {
            if (to.name === from.name) return;
            //Set page lang
            wwLib.wwLang.defaultLang = defaultLang.lang;
            wwLib.store.front.setLang(lang.lang);

            if (!isStaticRenderingActive()) {
                const canContinue = await initializePageRuntime(page, to);
                if (!canContinue) return null;
            }

            try {
                const { default: registerPageComponents } = await import(`@/pages/${page.id.split('_')[0]}.js`);
                await registerPageComponents(window.vm);
                await wwLib.wwWebsiteData.fetchPage(page.id);

                //Scroll to section or on top after page change
                if (isStaticRenderingActive()) {
                    return;
                } else if (to.hash) {
                    const targetElement = document.getElementById(to.hash.replace('#', ''));
                    if (targetElement) targetElement.scrollIntoView();
                } else {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }

                return;
            } catch (err) {
                wwLib.store.front.setPageLoadProgress(false);
                if (isStaticRenderingActive()) throw err;

                if (err.redirectUrl) {
                    return { path: err.redirectUrl || '404' };
                } else {
                    //Any other error: go to target page using window.location
                    window.location = to.fullPath;
                }
            }
        },
    });
};

for (const page of window.wwg_designInfo.pages) {
    for (const lang of window.wwg_designInfo.langs) {
        if (!page.langs.includes(lang.lang)) continue;
        registerRoute(page, lang);
    }
}

const page404 = window.wwg_designInfo.pages.find(page => page.paths.default === '404');
if (page404) {
    for (const lang of window.wwg_designInfo.langs) {
        // Create routes /:lang/:pathMatch(.*)* etc for all langs of the 404 page
        if (!page404.langs.includes(lang.lang)) continue;
        registerRoute(
            page404,
            {
                default: false,
                lang: lang.lang,
            },
            '/:pathMatch(.*)*'
        );
    }
    // Create route /:pathMatch(.*)* using default project lang
    registerRoute(page404, { default: true, isDefaultPath: false, lang: defaultLang.lang }, '/:pathMatch(.*)*');
} else {
    routes.push({
        path: '/:pathMatch(.*)*',
        redirect: null,
        async beforeEnter() {
            window.location.href = '/404';
        },
    });
}

const isProd = getRuntimeEnvironment() === 'production';

async function initializePageRuntime(page, route) {
    const backAuthStore = wwLib.store.backAuth;
    if (!wwLib.wwAuth.plugin && !backAuthStore.projectAuth && window.wwg_designInfo.auth) {
        backAuthStore.setProjectAuth(window.wwg_designInfo.auth);
    }

    await initializePlugins();
    await initializeIntegrationInstances();

    if (!wwLib.wwAuth.plugin) {
        await backAuthStore.refresh();
        const projectAuth = backAuthStore.projectAuth || {};

        // Internal apps: every page needs someone signed in and granted the app, whatever its own access rule.
        if (window.wwg_designInfo.auth?.appAccess === 'internal' && !backAuthStore.isAuthenticated) {
            redirectToAppAccessSignIn();
            return false;
        }
        if (page.security?.accessRule !== 'authenticated') return true;
        if (!backAuthStore.isAuthenticated) {
            window.location.href = `${wwLib.wwPageHelper.getPagePath(
                projectAuth.unauthenticatedPageId
            )}?_source=${route.path}`;
            return false;
        }
        if (!page.security.accessRoles?.length) return true;

        const hasAccess =
            page.security.accessRolesCondition === 'AND'
                ? backAuthStore.matchAllRoles(page.security.accessRoles)
                : backAuthStore.matchAnyRoles(page.security.accessRoles);
        if (hasAccess) return true;

        window.location.href = `${wwLib.wwPageHelper.getPagePath(
            projectAuth.unauthorizedPageId
        )}?_source=${route.path}`;
        return false;
    }

    if (!page.pageUserGroups?.length) return true;
    await wwLib.wwAuth.init();

    if (!wwLib.wwAuth.getIsAuthenticated()) {
        window.location.href = `${wwLib.wwPageHelper.getPagePath(
            wwLib.wwAuth.getUnauthenticatedPageId()
        )}?_source=${route.path}`;
        return false;
    }

    if (
        page.pageUserGroups.length > 1 &&
        !wwLib.wwAuth.matchUserGroups(page.pageUserGroups.map(({ userGroup }) => userGroup))
    ) {
        window.location.href = `${wwLib.wwPageHelper.getPagePath(
            wwLib.wwAuth.getUnauthorizedPageId()
        )}?_source=${route.path}`;
        return false;
    }

    return true;
}

/**
 * Initializes the current route's traditional runtime dependencies after Vue has
 * hydrated the static projection. Static rendering remains active until this resolves,
 * so client islands and dynamic bindings cannot run against a partial runtime.
 */
export async function initializeCurrentRouteRuntime() {
    const route = router.currentRoute.value;
    const page = window.wwg_designInfo.pages.find(candidate => candidate.id === route.meta.pageId);
    if (!page) throw new Error(`Unable to initialize runtime for route ${route.fullPath}: page is unavailable.`);

    const canContinue = await initializePageRuntime(page, route);
    if (!canContinue) return { status: 'redirected' };
    return { status: 'ready', route };
}

/**
 * Starts the data phase without delaying the mounted lifecycle, matching normal
 * navigation where collections and workflows may initialize after the first render.
 */
export function startCurrentRouteDataInitialization(route) {
    return initializeData(route);
}

function createFrontHistory(serverRendering) {
    if (serverRendering) return createMemoryHistory();

    if (isProd && window.wwg_designInfo.baseTag?.href) {
        let baseTag = window.wwg_designInfo.baseTag.href;
        if (!baseTag.startsWith('/')) {
            baseTag = '/' + baseTag;
        }
        if (!baseTag.endsWith('/')) {
            baseTag += '/';
        }
        return createWebHistory(baseTag);
    }

    return createWebHistory();
}

export function createFrontRouter({ serverRendering = false } = {}) {
    const frontRouter = createRouter({
        history: createFrontHistory(serverRendering),
        routes,
        scrollBehavior,
    });

    //Trigger on page unload
    let isFirstNavigation = true;
    frontRouter.beforeEach(async (to, from) => {
        if (to.name === from.name) return;
        if (!isFirstNavigation && !serverRendering) await onPageUnload();
        isFirstNavigation = false;
        wwLib.globalVariables._navigationId++;
        return;
    });

    //Init page
    frontRouter.afterEach((to, from, failure) => {
        wwLib.store.front.setPageLoadProgress(false);
        let fromPath = from.path;
        let toPath = to.path;
        if (!fromPath.endsWith('/')) fromPath = fromPath + '/';
        if (!toPath.endsWith('/')) toPath = toPath + '/';
        if (failure || (from.name && toPath === fromPath) || serverRendering || isStaticRenderingActive()) return;
        void initializeData(to);
    });

    return frontRouter;
}

router = createFrontRouter({ serverRendering: isServerRendering });
/* wwFront:end */

export default router;
