import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import WebSiteSchema from "@/components/structured-data/WebSiteSchema";
import SoftwareApplicationSchema from "@/components/structured-data/SoftwareApplicationSchema";
import OrganizationSchema from "@/components/structured-data/OrganizationSchema";

export const metadata: Metadata = {
  metadataBase: new URL("https://nono.sh"),
  title: {
    default: "Sandbox for AI Agents — Kernel-Level Isolation | nono",
    template: "%s | nono",
  },
  description:
    "Kernel-enforced isolation, network filtering, immutable auditing, and atomic rollbacks for AI agents - built into the nono CLI and native SDKs.",
  keywords: [
    "AI agent sandbox",
    "AI agent security",
    "OS-level isolation",
    "nono sandbox",
    "Claude Code sandbox",
    "AI coding agent security",
    "kernel sandboxing",
    "Seatbelt sandbox",
    "Landlock sandbox",
    "WSL2 sandbox",
    "secure AI agents",
    "network filtering proxy",
    "SSRF protection",
    "AI agent network security",
  ],
  icons: {
    icon: [
      { url: "/nono-square.svg", type: "image/svg+xml" },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sandbox for AI Agents — Kernel-Level Isolation | nono",
    description:
      "Kernel-enforced isolation, network filtering, immutable auditing, and atomic rollbacks for AI agents - built into the nono CLI and native SDKs.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "nono - OS-Level Isolation for AI Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sandbox for AI Agents — Kernel-Level Isolation | nono",
    description:
      "Kernel-enforced isolation, network filtering, immutable auditing, and atomic rollbacks for AI agents - built into the nono CLI and native SDKs.",
    site: "@alwaysfurtherAI",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <SoftwareApplicationSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)})()`,
          }}
        />
        <Script id="analytics-bootstrap" strategy="beforeInteractive">
          {`
            (function() {
              var TRACKING_PARAMS = [
                'utm_source',
                'utm_medium',
                'utm_campaign',
                'utm_term',
                'utm_content',
                'utm_id',
                '_gl',
                'gclid',
                'dclid'
              ];

              var url = new URL(window.location.href);
              var campaign = {};
              var hasTracking = false;

              for (var i = 0; i < TRACKING_PARAMS.length; i++) {
                var key = TRACKING_PARAMS[i];
                var value = url.searchParams.get(key);
                if (!value) continue;
                campaign[key] = value;
                hasTracking = true;
              }

              var cleanUrl = new URL(window.location.href);
              for (var j = 0; j < TRACKING_PARAMS.length; j++) {
                cleanUrl.searchParams.delete(TRACKING_PARAMS[j]);
              }

              window.dataLayer = window.dataLayer || [];
              window.__nonoAnalyticsConsent = true;
              window.__nonoAnalyticsContext = {
                originalUrl: window.location.href,
                cleanUrl: cleanUrl.origin + cleanUrl.pathname + cleanUrl.search + cleanUrl.hash,
                campaign: campaign,
                capturedAt: Date.now()
              };

              window.__nonoAnalyticsState = {
                gaPageviewSent: false,
                posthogPageviewSent: false
              };
              window.__nonoAnalyticsDispatchLog = {
                ga: [],
                posthog: []
              };
              window.__nonoPosthogReady = false;
              window.__nonoPendingPosthogPageview = null;
              window.__nonoPosthogFlushAttempts = 0;

              window.dataLayer.push({
                event: 'campaign_context_ready',
                analytics_context: window.__nonoAnalyticsContext
              });

              if (hasTracking) {
                for (var k = 0; k < TRACKING_PARAMS.length; k++) {
                  url.searchParams.delete(TRACKING_PARAMS[k]);
                }
                var cleanPath = url.pathname + url.search + url.hash;
                window.history.replaceState({}, '', cleanPath);
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistMono.className} antialiased`}
      >
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T3KTDBM474"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.__nonoDispatchGaPageview = function() {
              if (!window.__nonoAnalyticsConsent) return;
              if (window.__nonoAnalyticsState && window.__nonoAnalyticsState.gaPageviewSent) return;
              var context = window.__nonoAnalyticsContext || {};
              var payload = {
                page_location: context.originalUrl || window.location.href,
                page_title: document.title
              };
              var campaign = context.campaign || {};
              for (var key in campaign) {
                if (Object.prototype.hasOwnProperty.call(campaign, key)) {
                  payload[key] = campaign[key];
                }
              }
              if (window.__nonoAnalyticsDispatchLog && window.__nonoAnalyticsDispatchLog.ga) {
                window.__nonoAnalyticsDispatchLog.ga.push(payload);
              }
              gtag('event', 'page_view', payload);
              if (window.__nonoAnalyticsState) {
                window.__nonoAnalyticsState.gaPageviewSent = true;
              }
            };
            gtag('consent', 'default', {
              ad_storage: 'granted',
              analytics_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted'
            });
            gtag('js', new Date());
            gtag('config', 'G-T3KTDBM474', {
              send_page_view: false
            });
            window.__nonoDispatchGaPageview();
          `}
        </Script>
        <Script id="posthog" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init ts ns yi rs os Qr es capture Hi calculateEventProperties hs register register_once register_for_session unregister unregister_for_session fs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty vs us createPersonProfile cs Yr ps opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing ls debug O ds getPageViewId captureTraceFeedback captureTraceMetric Vr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            window.__nonoCaptureQueuedPosthogPageview = function() {
              if (!window.__nonoPendingPosthogPageview) return;
              if (!window.posthog) return;
              if (!window.__nonoPosthogReady) return;
              if (typeof window.posthog.capture !== 'function') return;
              try {
                window.posthog.capture('$pageview', window.__nonoPendingPosthogPageview);
                if (window.__nonoAnalyticsState) {
                  window.__nonoAnalyticsState.posthogPageviewSent = true;
                }
                window.__nonoPendingPosthogPageview = null;
                window.__nonoPosthogFlushAttempts = 0;
              } catch (error) {
                window.__nonoPosthogFlushAttempts = (window.__nonoPosthogFlushAttempts || 0) + 1;
                if (window.__nonoPosthogFlushAttempts < 20) {
                  window.setTimeout(window.__nonoCaptureQueuedPosthogPageview, 100);
                }
              }
            };
            window.__nonoDispatchPosthogPageview = function() {
              if (!window.__nonoAnalyticsConsent) return;
              if (window.__nonoAnalyticsState && window.__nonoAnalyticsState.posthogPageviewSent) return;
              var context = window.__nonoAnalyticsContext || {};
              var payload = {
                $current_url: context.originalUrl || window.location.href
              };
              var campaign = context.campaign || {};
              for (var key in campaign) {
                if (Object.prototype.hasOwnProperty.call(campaign, key)) {
                  payload[key] = campaign[key];
                  if (key.indexOf('utm_') === 0) {
                    payload['$' + key] = campaign[key];
                  }
                }
              }
              if (window.__nonoAnalyticsDispatchLog && window.__nonoAnalyticsDispatchLog.posthog) {
                window.__nonoAnalyticsDispatchLog.posthog.push(payload);
              }
              window.__nonoPendingPosthogPageview = payload;
              window.__nonoCaptureQueuedPosthogPageview();
            };
            posthog.init('phc_JZWiTzIDNnBp6Jj6uUb0JQKuIp3dv0gkay9aU50n38h', {
                api_host: 'https://eu.i.posthog.com',
                defaults: '2025-11-30',
                person_profiles: 'identified_only',
                capture_pageview: false,
                loaded: function() {
                  window.__nonoPosthogReady = true;
                  window.setTimeout(window.__nonoCaptureQueuedPosthogPageview, 0);
                },
            });
            window.__nonoDispatchPosthogPageview();
          `}
        </Script>
      </body>
    </html>
  );
}
