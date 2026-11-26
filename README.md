[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Rizal556z/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Rizal556z/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# Anggrek Household Budget

An original household budget site for the fictional Anggrek family, built for
the [make.fun bounty “Make the best household budget site”](https://make.fun/bounty/best-household-budget-site-20261126-1457).

The site runs offline in a browser from static files, on a desktop and on a
phone, with no network request. It has nine sections — dashboard, income,
expenses, monthly planner, savings goals, bills calendar, reports, settings and
search — each reached by a link, with real figures in place and every control
doing what it says: add, edit and delete transactions, change the month,
set a budget per category, add money to a savings goal, mark bills paid,
search the whole budget, and export or import CSV. Charts are plain canvas
(donut, trend bars, category bars); data persists in localStorage; there are
no libraries and no external resources.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` directly in a browser.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library.

## Layout

- `app/index.html` — page shell, header navigation and footer
- `app/style.css` — the site's design
- `app/data.js` — the household's figures and the localStorage store
- `app/charts.js` — plain-canvas donut, trend and category-bar charts
- `app/views.js` — the nine pages
- `app/main.js` — hash router and page controls
- `screenshots/` — real renders of the site in a browser
- `main.ts` — the entry program
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Licence

MIT — see [LICENSE](LICENSE).
