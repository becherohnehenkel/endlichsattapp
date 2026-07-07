# Sättigungs-Matrix Domain Review Checklist

Before marking any domain logic change as complete:

## Matrix Logic
- [ ] All 6 pillars covered (Geschmack, Biss, Ballaststoffe, Proteine, Volumen, Art of Eating)
- [ ] Scoring uses only: gut / mittel / schwach (no other values)
- [ ] Every pillar score has a short, plain-language comment
- [ ] Scores are consistent with the pillar definitions in `docs/saettigungs-matrix.md`

## Follow-up Questions
- [ ] Agent asks max. 2–3 follow-up questions per analysis
- [ ] Every question asked would materially change a pillar score
- [ ] No questions asked about obvious/unambiguous ingredients
- [ ] If >3 questions would be needed: assumptions stated explicitly, no questions asked

## Improvement Suggestions
- [ ] At least 1, max. 3 suggestions per analysis
- [ ] Every suggestion addresses the weakest pillar(s) first
- [ ] Every suggestion is flavour-appropriate for the specific dish
- [ ] No light products or diet substitutes recommended
- [ ] No supplements recommended unless an isolated gap exists
- [ ] Suggestions are specific (ingredient + quantity) not generic ("add more protein")

## Before/After Comparison
- [ ] Vorher: all 6 pillar scores present
- [ ] Vorher: kcal, protein, carbs, fat, fibre estimated
- [ ] Nachher: all 6 pillar scores present (reflecting improvements)
- [ ] Nachher: kcal, protein, carbs, fat, fibre estimated
- [ ] Delta callouts: changed values highlighted with +/- amounts
- [ ] Optimised variant is realistic and achievable

## Tone & Language
- [ ] Written in German throughout
- [ ] Uses informal "Du" consistently
- [ ] No moralising language
- [ ] No diet-culture terms (clean eating, cheat meal, sündig, etc.)
- [ ] No suggestion to eat less
- [ ] Why behind every rating is explained, not just the score
- [ ] Everyday language used — no medical jargon

## Nutritional Estimates
- [ ] Estimates use standard defaults from SKILL.md when no database value available
- [ ] Any assumed portion sizes stated explicitly in the analysis
- [ ] Estimates are in the right order of magnitude (sanity check)

## Example Testing
- [ ] Tested against a strong meal (5–6 green pillars)
- [ ] Tested against a weak meal (2+ red pillars)
- [ ] Tested against one edge case (restaurant, protein shake, fast food, or similar)
- [ ] All three produce sensible, consistent output

## Review & Sign-off
- [ ] Changes reviewed with Product Owner (Lukas)
- [ ] Explicit sign-off received before merging into `docs/system-prompt.md`
- [ ] No sections already signed off have been rewritten

## Documentation
- [ ] `docs/saettigungs-matrix.md` updated if pillar definitions changed
- [ ] `docs/system-prompt.md` updated if agent behaviour changed
- [ ] `docs/beispiel-analysen.md` updated with new approved examples
- [ ] `features/INDEX.md` status updated

## Completion
- [ ] Code committed to git
