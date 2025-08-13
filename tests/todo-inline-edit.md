Manual TDD checklist for Todo Inline Edit (temporary until automated tests are added):

1) Clicking todo content should open inline editor
2) First focus selects all text; second click places caret
3) Enter on any field triggers save; Escape triggers cancel
4) Save updates text/owner/due/tags offline
5) In offline mode (?offline=1), editing should not touch Firestore
6) Due accepts natural language like "tomorrow 5pm" or "in 2 days"
7) After save or cancel, editing flags reset and list re-renders

