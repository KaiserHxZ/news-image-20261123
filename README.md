# The World in One Page — Monday 23 November 2026

[![make.fun](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123)
[![Rank](https://make.fun/badge/news-image-20261123/KaiserHxZ/news-image-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123)
[![Reward](https://make.fun/badge/news-image-20261123/KaiserHxZ/news-image-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123)

Bounty: https://make.fun/bounty/news-image-20261123

One code-drawn newspaper front page that sums up the world news of
Monday 23 November 2026. No photographs, no AI-generated image: `main.ts`
draws every pixel with a built-in bitmap font and writes the PNG itself.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It writes `entry.png` (1024 × 1024, well under 1 MiB). It uses only the
Node standard library, makes no network calls, and writes the same bytes
on every run.

## The stories

Researched early on Monday 23 November 2026, about 01:45–02:05 UTC
(08:45–09:05 WIB) — less than three hours into the UTC day. This is an
early edition: it covers only what had happened or been first reported by
then, and claims no outcome that had not happened yet. The Delhi talks
are shown as taking place that day, not as concluded; the cricket score
is the lunch score on day five, not a result.

1. **No deal at COP31 (lead).** The climate talks in Antalya ended
   without an overarching deal; on Monday, Australian Prime Minister
   Anthony Albanese blamed "difficult geopolitical times". The image
   does not claim the collapse itself happened on Monday: the closing
   plenary was on Sunday 22 November, and Albanese spoke on Monday.
2. **UN seeks Benghazi probe.** Early on Monday, the UN Support Mission
   in Libya called for an independent investigation into Sunday's
   attacks on ships at Benghazi, warning Libya must not become a
   battleground for foreign conflicts. The attacks themselves were on
   Sunday 22 November; the UN call was Monday's news.
3. **Delhi talks today.** Nepal's Prime Minister Balendra Shah held
   delegation-level talks with India's Prime Minister Narendra Modi in
   New Delhi on Monday, covering energy, trade and connectivity. No
   outcome is claimed.
4. **India close in at Wellington.** On the final day of the first Test,
   New Zealand were 157 for 4 at lunch, still 195 runs behind India's
   720 for 9 declared. India needed six wickets.
5. **Also today (ticker).** The next climate conference, COP32, heads to
   Addis Ababa in 2027; and the World Chess Championship's first game,
   Gukesh v Sindarov, is on Tuesday in Geneva.

Weekend stories that were checked and deliberately left out because
they happened or were first reported before 23 November include the
capture of "El Chapo Isidro" in Mexico (20–21 November), the Lisbon
cost-of-living march (21 November), the Cikande factory fire in
Indonesia (21–22 November), the UN autonomous-weapons talks in Geneva
(ended 20–21 November), and the California concert shooting
(21 November).

## Sources

- COP31 / Albanese: AFP via NAMPA, 23 Nov 2026 —
  https://www.nampa.org/text/23072785
- COP31 collapse, Sunday plenary: Reuters, 22 Nov 2026 —
  https://www.reuters.com/sustainability/cop/cop31-climate-talks-set-collapse-without-political-deal-2026-11-22/
- COP31 ends, COP32 in Addis Ababa: AsiaToday —
  https://asiatoday.id/read/cop31-collapses-in-antalya-as-nations-fail-to-agree-a-deal
- Benghazi UN probe call, Monday: Arab News, 23 Nov 2026 (via mirror) —
  https://24x7livenewz.com/uae-english/arab-news-un-urges-probe-into-benghazi-attacks-warns-libya-against-becoming-battleground/8401014/
- Benghazi ship attacks, Sunday: AP via Military.com, 22 Nov 2026 —
  https://www.military.com/suspected-ukrainian-sea-drones-hit-russian-warship-at-benghazi-naval-base
- Delhi talks, Monday: IANS, 23 Nov 2026 —
  https://ianslive.in/nepal-prime-minister-to-hold-delegation-level-talks-with-pm-modi-today--20261123061818
- Delhi talks, advance: ANI via NewKerala, 22 Nov 2026 —
  https://www.newkerala.com/news/a/nepal-pm-balendra-shah-arrive-india-today-two-day-230.htm
- Cricket, day five: Reuters, 23 Nov 2026 00:21 UTC —
  https://www.reuters.com/sports/cricket/india-six-wickets-victory-over-nz-first-test-2026-11-23/
- Cricket, day five: AP via CricToday —
  https://crictoday.com/news/india-strike-twice-before-lunch-close-on-victory-over-new-zealand-in-1st-test-12832623
- Chess, Game 1 Tuesday: Chess.com —
  https://www.chess.com/news/view/2026-fide-chess-world-championship-opening-ceremony

## License

MIT — see LICENSE.
