// Every inner page's copy, one module per route. Import from the route's own module; this barrel
// re-exports them all for older imports. Home copy is in home.ts and the software window's in software.ts.
export * from "./faq";
export * from "./calculator";
export * from "./platform";
export * from "./commercial";
export * from "./homes";
export * from "./solar";
export * from "./company";
export * from "./register";
export * from "./privacy";
export * from "./download";
export * from "./notFound";
export * from "./siblings";
