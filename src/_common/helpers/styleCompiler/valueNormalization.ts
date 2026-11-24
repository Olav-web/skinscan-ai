import { normalizeDisplayValue } from './capabilities';
import type { StyleCssValueMap, StyleCssValueNormalizer } from './types';

/**
 * Maps a resolved source value to the final CSS value declared by component config.
 */
export function mapStyleValue(value: unknown, valueMap: StyleCssValueMap) {
    if (value === true) return valueMap.trueValue;
    if (value === false) return valueMap.falseValue;

    return undefined;
}

/**
 * Applies compiler-owned runtime value normalization before CSS serialization.
 */
export function normalizeStyleRuntimeValue(value: unknown, normalizer: StyleCssValueNormalizer) {
    if (normalizer.type === 'map') return mapStyleValue(value, normalizer.map);
    if (normalizer.type === 'empty-fallback') {
        return value === undefined || value === null || value === '' ? normalizer.fallbackValue : value;
    }
    if (normalizer.type === 'falsy-fallback') return value || normalizer.fallbackValue;
    if (normalizer.type === 'component-size') {
        return !value || value === 'auto' ? normalizer.fallbackValue : value;
    }
    if (normalizer.type === 'empty-if-falsy') return value || undefined;
    if (normalizer.type === 'prefix-if-truthy') return value ? `${normalizer.prefix}${value}` : undefined;
    if (normalizer.type === 'space-separated-list') {
        if (!Array.isArray(value)) return normalizer.fallbackValue;

        return value.join(' ') || normalizer.fallbackValue;
    }
    if (normalizer.type === 'display') {
        return normalizeDisplayValue(value, normalizer.allowedValues, normalizer.restrictToAllowedValues);
    }
    if (normalizer.type === 'background-image') {
        const backgroundImage = value || normalizer.fallbackValue;
        const assetBaseUrl = getBackgroundImageAssetBaseUrl(
            backgroundImage,
            normalizer.assetBaseUrl,
            normalizer.copiedAssetBaseUrl
        );
        return normalizeBackgroundImageValue(backgroundImage, assetBaseUrl);
    }

    return value;
}

/**
 * Converts legacy WeWeb image paths and URLs into a valid CSS `<image>` value.
 */
export function normalizeBackgroundImageValue(value: unknown, assetBaseUrl?: string) {
    if (typeof value !== 'string') return value;

    const trimmedValue = value.trim();
    if (!trimmedValue || trimmedValue === 'none') return trimmedValue;
    if (isCssImageFunction(trimmedValue)) return trimmedValue;

    const resolvedUrl = resolveAssetUrl(trimmedValue, assetBaseUrl);
    return `url('${escapeCssUrl(resolvedUrl)}')`;
}

function isCssImageFunction(value: string) {
    const cssImageFunction =
        /^(?:url|var|env|image|-webkit-image-set|(?:repeating-)?(?:linear|radial|conic)-gradient|image-set|cross-fade|element|paint)\(/i;

    return cssImageFunction.test(value);
}

/**
 * A CSS string, or a `url()` with its quoted or unquoted argument. Strings come first so a `url(`
 * written inside one, such as `content: "url(x)"`, stays text. Each argument form owns its trailing
 * whitespace so an unclosed `url(` followed by spaces is rejected in linear time.
 */
const CSS_STRING_OR_URL_PATTERN =
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?<![\w-])url\(\s*(?:"((?:\\.|[^"\\])*)"\s*|'((?:\\.|[^'\\])*)'\s*|((?:\\.|[^"'()\\\s])+)\s*)?\)/gi;

/**
 * Resolves URLs for assets copied by the publisher. prepareLocalUrl writes these
 * into images/ or files/ and adds the _wwcv cache version.
 *
 * A page stylesheet is served from assets/, so these URLs need the asset base.
 * Custom relative URLs may point to a user file at its chosen deployed path.
 */
export function resolveCssValueAssetUrls(cssValue: string, assetBaseUrl?: string, copiedAssetBaseUrl?: string) {
    const baseUrl = copiedAssetBaseUrl ?? assetBaseUrl;
    if (!baseUrl || !/url\(/i.test(cssValue)) return cssValue;

    return cssValue.replace(
        CSS_STRING_OR_URL_PATTERN,
        (match, doubleQuotedUrl?: string, singleQuotedUrl?: string, unquotedUrl?: string) => {
            const url = doubleQuotedUrl ?? singleQuotedUrl ?? unquotedUrl;
            if (!url || !isCopiedAssetPath(url) || (!copiedAssetBaseUrl && url.startsWith('/'))) return match;

            const quote = doubleQuotedUrl !== undefined ? '"' : singleQuotedUrl !== undefined ? "'" : '';
            return `url(${quote}${resolveAssetUrl(url, baseUrl)}${quote})`;
        }
    );
}

/** Chooses a base for bare values. Authored CSS url() values are resolved separately. */
export function getBackgroundImageAssetBaseUrl(value: unknown, assetBaseUrl?: string, copiedAssetBaseUrl?: string) {
    if (!copiedAssetBaseUrl || typeof value !== 'string') return assetBaseUrl;
    return isCopiedAssetPath(value.trim()) ? copiedAssetBaseUrl : assetBaseUrl;
}

function isCopiedAssetPath(value: string) {
    return /^\/?(?:images|files)\//.test(value) && value.includes('?_wwcv=');
}

function resolveAssetUrl(value: string, assetBaseUrl?: string) {
    if (!assetBaseUrl || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value;

    return `${assetBaseUrl.replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`;
}

function escapeCssUrl(value: string) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/[\n\r\f]/g, '');
}
