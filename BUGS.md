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

**How to reproduce:** In the "Filter" card, select any member from the "Paid by" dropdown (e.g., "Aisha Khan" or "Ben Okonkwo"). Or type a category/person name into the search box.

**What is wrong:** The expense list became empty ("No expenses match these filters.") even though the selected member paid for several expenses. The `<select>` element emits a string ID (e.g. `"1"`), whereas `e.paidBy` is stored as a number (`1`), causing the strict inequality filter `e.paidBy !== paidBy` (`1 !== "1"`) to fail all matches. In addition, the search input was only searching description text rather than matching categories or member names, and placeholder was hardcoded as "Description…".

**What I changed:**
- In `src/App.jsx`, updated the `paidBy` filter to compare IDs reliably via `String(e.paidBy) !== String(paidBy)`.
- In `src/App.jsx`, enhanced search filtering to check against expense description, category, and payer/member names.
- In `src/components/Filters.jsx`, changed search input placeholder from `Description…` to `Search…` and enabled toggling category chips back to "All" when clicked again.

---

## Bug 6

**How to reproduce:** Filter expenses by category (e.g. "Stay") or sort them by date, then click "Delete" on an expense or change its amount in the input field.

**What is wrong:** `ExpenseList.jsx` passed the array index of the sorted/filtered list to `onDeleteAt(index)` and `onUpdateAt(index, patch)`. The reducer in `src/state/store.js` modified `state.expenses[action.index]`, assuming the index matched `state.expenses`. When filtered or reordered, the visual index does not match the store index, causing the wrong expense to be deleted or edited. Additionally, using array indices as React keys (`key={index}`) caused stale local input states.

**What I changed:**
- In `src/state/store.js`, updated `DELETE_EXPENSE` to filter by `e.id !== action.id` and `UPDATE_EXPENSE` to map by `e.id === action.id`.
- In `src/App.jsx` and `src/components/ExpenseList.jsx`, passed `expense.id` to `onDelete` and `onUpdate`, and keyed rows by `key={expense.id}`.

---

## Bug 7

**How to reproduce:** Add an expense of $100 split equally among 3 members (like Groceries in default data). Each member gets $33.33, totaling $99.99 instead of $100.00. The group loses $0.01 in the split, causing group balances to not sum to zero.

**What is wrong:** In `src/lib/money.js`, `splitEqual` computed `(amount / n).toFixed(2)` and assigned the exact same rounded float to all participants without allocating remainder cents.

**What I changed:**
- In `src/lib/money.js`, rewrote `splitEqual` to allocate exact cents (`totalCents = Math.round(amount * 100)`), computing base cents and distributing remainder cents (`rem = totalCents % n`) to the first `rem` members so the sum of shares always matches the total bill down to the last penny.

---

## Bug 8

**How to reproduce:** In the "Add expense" form, select "Custom %" with 3 members and enter 33.33, 33.33, and 33.34. Click "Save expense". The form displays the error "Percentages must add to 100."

**What is wrong:** In `src/lib/money.js`, `percentsSumTo100` checked `sum === 100`. JavaScript floating-point arithmetic can produce values like `100.00000000000001`, failing strict equality. Additionally, `splitByPercent` rounded each percentage share independently, which could create a discrepancy with the total amount.

**What I changed:**
- In `src/lib/money.js`, updated `percentsSumTo100` to check `Math.abs(sum - 100) < 0.01`.
- In `src/lib/money.js`, updated `splitByPercent` to compute shares in integer cents and allocate any leftover cent to ensure the sum of shares equals the full expense amount.

---

## Bug 9

**How to reproduce:** Under "Summary", type a new name in "Add member" (e.g. "Maya") and click "Add". Look at the "Paid so far" list below.

**What is wrong:** The total member count increments to 5, but the "Paid so far" list still only lists the original 4 members. `perPerson` in `SummaryCards.jsx` was wrapped in `useMemo(..., [expenses])` with `members` omitted from the dependency array, so adding a member did not trigger recalculation.

**What I changed:**
- In `src/components/SummaryCards.jsx`, added `members` to the dependency array of `useMemo` (`[members, expenses]`).

---

## Bug 10

**How to reproduce:** Look at the date column in the expense list across different timezones. In timezones west of UTC, `new Date("2026-03-12")` parsed as UTC midnight and shifted backward to the previous day ("11 Mar 2026"). Furthermore, newly added expenses were stored as `Date` objects while seed/localStorage stored strings, causing serialization inconsistency on reload.

**What is wrong:** Date strings were passed to `new Date(string)` without handling timezone offset, and dates were inconsistently typed across the store and components.

**What I changed:**
- In `src/lib/format.js`, updated `formatDate` and `dateValue` to parse `YYYY-MM-DD` strings in local time.
- In `src/state/store.js` and `src/components/AddExpenseForm.jsx`, standardized date storage as consistent `YYYY-MM-DD` ISO date strings.

---

## Bug 11

**How to reproduce:** Fill out the "Add expense" form with a description and amount and click "Save expense".

**What is wrong:** The expense is added to the list, but the form inputs (description, amount) remain populated with the previous values instead of resetting for the next entry.

**What I changed:**
- In `src/components/AddExpenseForm.jsx`, reset `description` to `""`, `amount` to `""`, and `error` to `""` in the submit handler upon successful submission.

---

## Bug 12

**How to reproduce:** Add an expense or edit its amount from another source, or observe amounts near zero formatted with tiny negative values (which displayed as `-$0.00`).

**What is wrong:** In `ExpenseRow`, `draft` state was initialized only once with `useState` and never synchronized when `expense.amount` prop changed. Also `formatMoney` did not guard against negative zero representation (`-$0.00`).

**What I changed:**
- In `src/components/ExpenseList.jsx`, added `useEffect` to synchronize `draft` with `expense.amount` and added `onKeyDown` to allow committing edits by pressing Enter.
- In `src/lib/money.js`, added a check in `formatMoney` to return `"$0.00"` whenever the absolute formatted value is `"0.00"`.

