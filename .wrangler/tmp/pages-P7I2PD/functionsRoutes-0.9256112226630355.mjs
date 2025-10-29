import { onRequest as __api_health_js_onRequest } from "D:\\rifatduru07_Github\\qbyten\\qbyten\\functions\\api\\health.js"
import { onRequest as __api_products_js_onRequest } from "D:\\rifatduru07_Github\\qbyten\\qbyten\\functions\\api\\products.js"
import { onRequest as __api_services_js_onRequest } from "D:\\rifatduru07_Github\\qbyten\\qbyten\\functions\\api\\services.js"
import { onRequest as __api_settings_js_onRequest } from "D:\\rifatduru07_Github\\qbyten\\qbyten\\functions\\api\\settings.js"
import { onRequest as ___middleware_js_onRequest } from "D:\\rifatduru07_Github\\qbyten\\qbyten\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/health",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_health_js_onRequest],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_products_js_onRequest],
    },
  {
      routePath: "/api/services",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_services_js_onRequest],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_settings_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]