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

**How to reproduce:** In the default data, look at expense `e2` ("Uber to airport", $60 paid by Diya Patel for Aisha Khan and Ben Okonkwo). Diya is not in `splitWith`. Diya paid a total of $96 ($60 Uber + $36 Board game) and consumed a total of $53 ($20 dinner + $24 museum + $9 board game), so she is owed $96 - $53 = +$43.00. However, the app computed her balance as only +$13.00 ($30 less).

**What is wrong:** In `src/lib/balances.js`, `computeBalances` contained an erroneous check `if (!(exp.paidBy in shares) && !(String(exp.paidBy) in shares))` that deducted `amount / n` from the payer's balance whenever they were not part of the split. This directly violated the requirement that a member who pays for others without participating in the expense is entitled to full reimbursement.

**What I changed:**
- In `src/lib/balances.js`, removed the invalid penalty deduction block so that non-participating payers are properly credited for the full amount they paid.

---

## Bug 4

**How to reproduce:** Look at the "Settle up" panel with default data (after balance calculation fixes). Aisha Khan owes $85.01, Ben Okonkwo is owed $59.00, Carlos Mendes owes $16.99, and Diya Patel is owed $43.00. Aisha pays Ben $59.00 and Diya $26.01, leaving Carlos owing $16.99 and Diya owed $16.99. However, the Settle up panel fails to suggest "Carlos Mendes pays Diya Patel $16.99".

**What is wrong:** In `src/lib/settle.js`, inside the `while` loop of `suggestSettlements`, when a debtor's amount equals a creditor's amount (`d.amount === c.amount`), the algorithm executed the `else` block which incremented `i` and `j` without recording the transfer (`transfers.push(...)`). As a result, exact matching debts and credits were silently skipped, leaving members unsettled.

**What I changed:**
- In `src/lib/settle.js`, updated the equal amount case (`Math.abs(diff) < 0.001`) to push the transfer to the `transfers` array before advancing both debtor and creditor pointers.

---

## Bug 5

**How to reproduce:**

**What is wrong:**

**What I changed:**

---
