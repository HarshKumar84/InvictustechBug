# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top.

**What I changed:**
- In `src/lib/format.js`, updated `dateValue` to properly convert Date objects and `YYYY-MM-DD` date strings into numeric millisecond timestamps instead of returning raw strings, preventing `NaN` comparison errors.
- Also updated `formatDate` to parse date strings without timezone shifts so dates display consistently (e.g. "15 Mar 2026").
- In `src/components/ExpenseList.jsx`, changed the sort comparator from `dateValue(a.date) - dateValue(b.date)` (ascending/oldest first) to `dateValue(b.date) - dateValue(a.date)` (descending/newest first) so that the newest expenses correctly appear at the top.

---

## Bug 2

**How to reproduce:** Open the app with default data. Look at the "Balances" panel on the right. Ben Okonkwo (who paid more than his share and is owed money by the group) is displayed in red as "owes $59.00", while Aisha Khan (who consumed more than she paid and owes the group) is displayed in green as "is owed $85.01".

**What is wrong:** The positive/negative balance logic was inverted. In group accounting, a positive balance means the member paid more than their consumed share and is in credit ("is owed", displayed in green), whereas a negative balance means the member consumed more than they paid and is in debt ("owes", displayed in red).

**What I changed:**
- In `src/components/BalancesPanel.jsx`, updated the condition checks so that `bal > 0.005` renders `is owed ${formatMoney(bal)}` with class `"owed"`, and `bal < -0.005` renders `owes ${formatMoney(-bal)}` with class `"owe"`.

---

## Bug 3

**How to reproduce:**

**What is wrong:**

**What I changed:**

---
