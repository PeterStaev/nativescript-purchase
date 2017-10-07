if ((global as any).TNS_WEBPACK) {
    // registers tns-core-modules UI framework modules
    // tslint:disable-next-line:no-var-requires
    require("bundle-entry-points");
    
    // Views
    global.registerModule("main-page", () => require("./main-page"));
}
