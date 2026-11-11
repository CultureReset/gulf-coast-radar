# gulf-coast-radar

The May 2026 working tree for Gulf Coast Radar, the local guide to businesses in Orange Beach, Gulf Shores and Perdido Key. It holds the public site, the CyberCheck business admin, the SaaS API and dashboard, CSV import templates, and the data scripts, all in one repo.

A working snapshot, not a product. The pieces were later split into [`gcr-unified`](https://github.com/CultureReset/gcr-unified) (the public app), [`gcr-api-clean`](https://github.com/CultureReset/gcr-api-clean) (the API) and [`Admin-dashboard-main`](https://github.com/CultureReset/Admin-dashboard-main) (the admin). Nothing runs from it.

| Path | What it holds |
|---|---|
| `gulf-coast-radar/` | The public directory site: listings, happy hours, specials, events |
| root `*.html` | The admin and CyberCheck pages, including the unified bookings manager, industry onboarding, the menu builder and the App Store |
| `saas-api/`, `saas-dashboard/` | The multi-business API and dashboard |
| `CSV-TEMPLATES/` | Import templates by business type |
| `CYBERCHECK-MODULAR-PLATFORM/` | An early plan for the modular platform |
| root `*.js`, `*.py` | One-off import and check scripts for business, menu and event data |

The many `*.md` files at the root are status notes from that month. Last changed May 13, 2026.
