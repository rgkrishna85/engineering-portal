# Day-wise self-study slides

One PowerPoint deck per session (`day01` … `day32`) plus `day00-course-overview.pptx`.
Each deck works on its own as a 30-minute self-study guide. Open it in PowerPoint (or upload it to Teams/SharePoint) and work through it top to bottom.

## What each lesson deck contains
| Slide | What it gives you |
|---|---|
| Title | Today's goal and the 3 things you'll be able to do |
| Before you start | Checklist (Python on, files, AI key, portal) and a 30-minute plan |
| The picture in plain words | The office analogy, plus the graph's "floor plan" |
| Key ideas | The concepts, one numbered point each |
| See it in code | Annotated example from `code/` |
| Run it and compare | The command to run and the output you should see |
| Build it yourself with AI | A ready-to-paste vibe-coding prompt, plus what to do next |
| Check yourself and watch out | The check task (scored /3) and common mistakes with fixes |
| Quiz + answers | 5 questions, then the answer key on the next slide |
| Wrap-up | Key takeaways, how to score yourself /10, and what's next |

Milestone days (9, 14, 19) and capstone days (28–32) have a mission brief, step-by-step instructions, a starter prompt with tips, and a scoring rubric instead.

Outputs marked "example" come from AI models, so your wording will differ.

## Regenerating the decks
The slides are built from the `week-*.md` lesson files plus `build/extras.js`, so edit those and rebuild rather than editing the decks by hand:
```bash
cd learning/langgraph/slides/build
npm install
npm run build            # all decks
node generate.js 4,9     # only Day 4 and Day 9
```
