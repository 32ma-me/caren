// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },

  app:{
    head:{
      htmlAttrs:{
        lang:"ja",
        prefix:"og: https://ogp.me/ns#"
      },
      meta:[
        {property:"og:type",content:"website"},
        {property:"og:site_name",content:"caren - 予定調整ツール"},
        {property:"og:image",content:"/ogp.webp"}
      ],
      link:[
        {rel:"icon",type:"image/svg+xml",href:"/favicon.svg"},
        {rel:"icon",type:"image/png",href:"/favicon.ico"}
      ]
    }
  },

  nitro: {
    preset: "cloudflare_module",
    storage:{
      kv:{
        driver: "cloudflare-kv-binding",
        binding: "STORE_KV"
      }
    },
    devStorage:{
      kv:{
        driver:"memory"
      }
    },
    prerender:{
      routes:["/"],
      ignore:["/api/**"]
    }
  },

  routeRules:{
    "/":{prerender:true},
    "/api/**":{
      cors:true,
      headers:{
        "Access-Control-Allow-Methods":"GET,PUT,POST,DELETE",
        "Access-Control-Allow-Origin":"*"
      }
    }
  },

  modules: ["nitro-cloudflare-dev", "@nuxt/ui"]
})