export default class ColorScheme {

    constructor() {

    }

    light() {

    }

    dark() {

    }

    set( theme ) {

    }

    control() {
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;

        const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
        
        const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;

        window.matchMedia("(prefers-color-scheme: dark)").addListener(e => e.matches && activateDarkMode());

        window.matchMedia("(prefers-color-scheme: light)").addListener(e => e.matches && activateLightMode());
    }
}