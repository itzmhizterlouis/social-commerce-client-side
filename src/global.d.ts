// src/global.d.ts

// This declares the 'global' variable as a global object,
// making it recognized by TypeScript when running in a browser context.
// It tells TypeScript that 'global' refers to the 'Window' interface.
declare const global: Window & typeof globalThis;

// Optionally, if you have other specific global properties
// that SockJS or other libraries might expect, you can augment the Window interface:
// declare global {
//   interface Window {
//     someOtherGlobalProperty?: any;
//   }
// }
