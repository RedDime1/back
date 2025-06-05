export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
{
    name: "strapi::cors",
    config: {
      enabled: true,
      methods: ["GET", "POST", "PUT", "DELETE"], 
      headers: ["Content-Type", "Authorization", "hx-current-url", "HX-Current-URL", "hx-request", "hx-target", "hx-trigger"],
      credentials: true, 
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
