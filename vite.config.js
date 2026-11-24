import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import wewebCssLayerPlugin from './weweb-postcss-layer-plugin.cjs';
import path from 'path';
import fs from 'fs';
import { parseEnv } from 'node:util';
import handlebars from 'handlebars';
import { createSsrPageComponentLoadersPlugin } from './vitePlugins/ssrPageComponentLoaders.ts';

const pages = {"573ae9c9-fc97-4211-b046-57455192f60e-en":{"outputDir":"./historikk","lang":"en","title":"Tidligere analyser – SkinScan AI","cacheVersion":"3","meta":[{"name":"title","content":"Tidligere analyser – SkinScan AI"},{"itemprop":"name","content":"Tidligere analyser – SkinScan AI"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Tidligere analyser – SkinScan AI"},{"property":"og:title","content":"Tidligere analyser – SkinScan AI"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/historikk/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/historikk/"}]},"84e7b909-e46f-47e5-bdb5-b04c84544923-en":{"outputDir":"./404","lang":"en","title":"SkinScan AI – Din personlige hudpleieassistent","cacheVersion":"3","meta":[{"name":"title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"itemprop":"name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/404/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/404/"}]},"7deff766-424b-468f-965f-2a9f0961811d-en":{"outputDir":"./","lang":"en","title":"SkinScan AI – Din personlige hudpleieassistent","cacheVersion":"3","meta":[{"name":"title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"itemprop":"name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/"}]},"c1ff45da-3b9d-44eb-a594-143737b0e8f6-en":{"outputDir":"./login","lang":"en","title":"SkinScan AI – Din personlige hudpleieassistent","cacheVersion":"3","meta":[{"name":"title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"itemprop":"name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:title","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/login/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/login/"}]},"5e1ab57f-8a7e-480e-a03b-63bfbe179f8a-en":{"outputDir":"./hjem","lang":"en","title":"Hjem – SkinScan AI","cacheVersion":"3","meta":[{"name":"title","content":"Hjem – SkinScan AI"},{"itemprop":"name","content":"Hjem – SkinScan AI"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Hjem – SkinScan AI"},{"property":"og:title","content":"Hjem – SkinScan AI"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/hjem/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/hjem/"}]},"877effa8-1436-42d7-8a29-3cfe2b92320c-en":{"outputDir":"./mer","lang":"en","title":"Mer – SkinScan AI","cacheVersion":"3","meta":[{"name":"title","content":"Mer – SkinScan AI"},{"itemprop":"name","content":"Mer – SkinScan AI"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Mer – SkinScan AI"},{"property":"og:title","content":"Mer – SkinScan AI"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/mer/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/mer/"}]},"b9084f6c-c01c-47fb-9a07-63309fd672e8-en":{"outputDir":"./profil","lang":"en","title":"Din hudprofil – SkinScan AI","cacheVersion":"3","meta":[{"name":"title","content":"Din hudprofil – SkinScan AI"},{"itemprop":"name","content":"Din hudprofil – SkinScan AI"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Din hudprofil – SkinScan AI"},{"property":"og:title","content":"Din hudprofil – SkinScan AI"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/profil/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/profil/"}]},"e2cbe640-0ea1-48bd-aa9e-e31a6135ccaf-en":{"outputDir":"./analyse","lang":"en","title":"Hudanalyse – SkinScan AI","cacheVersion":"3","meta":[{"name":"title","content":"Hudanalyse – SkinScan AI"},{"itemprop":"name","content":"Hudanalyse – SkinScan AI"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Hudanalyse – SkinScan AI"},{"property":"og:title","content":"Hudanalyse – SkinScan AI"},{"property":"og:site_name","content":"SkinScan AI – Din personlige hudpleieassistent"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/analyse/"},{"rel":"alternate","hreflang":"en","href":"https://ec750c20-3660-4cb0-98db-7a40a85ee50d.weweb-preview.io/analyse/"}]}};

function generatePageHtmlFiles() {
    const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
    const compiledTemplate = handlebars.compile(template);

    for (const pageConfig of Object.values(pages)) {
        const html = compiledTemplate({
            title: pageConfig.title,
            lang: pageConfig.lang,
            meta: pageConfig.meta,
            structuredData: pageConfig.structuredData || null,
            scripts: {
                head: pageConfig.scripts.head,
                body: pageConfig.scripts.body,
            },
            alternateLinks: pageConfig.alternateLinks,
            cacheVersion: pageConfig.cacheVersion,
            baseTag: pageConfig.baseTag,
            encodedAssetBase: encodeURIComponent("/"),
        });

        if (!fs.existsSync(pageConfig.outputDir)) {
            fs.mkdirSync(pageConfig.outputDir, { recursive: true });
        }
        fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
    }
}

const clientInputs = {};
for (const pageName in pages) {
    clientInputs[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

function getFrontEnvironmentValues(root, mode) {
    const filePath = path.resolve(root, `.env.${mode}`);
    if (!fs.existsSync(filePath)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(parseEnv(fs.readFileSync(filePath, 'utf8'))).filter(([key]) => !key.startsWith('VITE_'))
    );
}

const onwarn = (entry, next) => {
    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
    if (/Use of direct `eval`/.test(entry.message)) return;
    return next(entry);
};

export default defineConfig(({ mode, isSsrBuild }) => {
    if (!isSsrBuild) {
        generatePageHtmlFiles();
    }

    const build = {
        chunkSizeWarningLimit: 10000,
        ...(!isSsrBuild ? { manifest: '.ww-client-manifest.json' } : {}),
        rolldownOptions: {
            ...(!isSsrBuild ? { input: clientInputs } : {}),
            onwarn,
        },
    };

    if (isSsrBuild) {
        build.outDir = 'dist-ssr';
    }

    return {
        plugins: [createSsrPageComponentLoadersPlugin(), vue()],
        base: "/",
        define: {
            global: 'globalThis',
            __VUE_PROD_DEVTOOLS__: mode === 'development',
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__:
                mode === 'development' || !!process.env.WW_BACK_URL?.includes('weweb-preprod.io'),
            __WW_FRONT_ENV_VARIABLES__: JSON.stringify({
                staging: getFrontEnvironmentValues(__dirname, 'staging'),
                production: getFrontEnvironmentValues(__dirname, 'production'),
            }),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [wewebCssLayerPlugin({ include: [/[/\\]src[/\\]extensions[/\\]/, /[/\\]node_modules[/\\]/] }), autoprefixer],
            },
        },
        ssr: {
            noExternal: true,
        },
        server: {
            port: 8080,
        },
        build,
    };
});
