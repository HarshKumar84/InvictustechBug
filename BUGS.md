# Bugs found

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”, but Wine (7 Mar) appears above Board game (15 Mar).

**What is wrong:** Expenses were being displayed from oldest to newest instead of newest to oldest.

**What I changed:**

* Fixed `dateValue` in `src/lib/format.js` so both `Date` objects and `YYYY-MM-DD` strings are converted correctly for sorting.
* Updated `formatDate` so date strings are parsed in local time and don't shift to the previous day in some timezones.
* Changed the sorting in `ExpenseList.jsx` to sort by date descending, so the newest expense is shown first.

---

## Bug 2

**How to reproduce:** Open the app and check the “Balances” panel. Ben is shown as owing money even though he paid more than his share. Aisha is shown as being owed even though she owes the group.

**What is wrong:** The balance display was using the opposite meaning for positive and negative balances.

**What I changed:**

* Fixed the balance checks in `src/components/BalancesPanel.jsx`.
* Positive balances are now shown as “is owed” in green.
* Negative balances are shown as “owes” in red.

---

## Bug 3

**How to reproduce:** Check the balance for Diya with the default expenses. She paid for an expense without being included in the split, but her balance was $30 lower than it should have been.

**What is wrong:** A payer who isn't part of the split was incorrectly being charged a share of the expense.

**What I changed:**

* Removed the incorrect deduction in `src/lib/balances.js`.
* A member who pays for an expense without being part of the split is now credited for the full amount they paid.

---

## Bug 4

**How to reproduce:** Open the “Settle up” section after fixing the balances. The remaining balances include Carlos owing Diya $16.99, but the app doesn't suggest that payment.

**What is wrong:** When the amount owed by one person exactly matched the amount owed to another person, the settlement code skipped the transfer instead of adding it.

**What I changed:**

* Fixed the equal-amount case in `src/lib/settle.js`.
* The matching payment is now added to the transfers list before moving to the next debtor and creditor.

---

## Bug 5

**How to reproduce:** In the Filter card, select a member from the “Paid by” dropdown.

**What is wrong:** The list becomes empty even when that member has paid for expenses. The dropdown returns the member ID as a string, while the expense data stores it as a number.

**What I changed:**

* Updated the filter in `src/App.jsx` to compare the IDs as strings.
* This makes the filter work regardless of whether the ID comes through as a number or string.

---

## Bug 6

**How to reproduce:** Filter or sort the expense list and then delete an expense or change its amount.

**What is wrong:** The app was using the displayed array index when updating or deleting an expense. After filtering or sorting, that index could point to a different expense in the original array.

**What I changed:**

* Changed `DELETE_EXPENSE` and `UPDATE_EXPENSE` in `src/state/store.js` to use the expense ID instead of the array index.
* Updated `App.jsx` and `ExpenseList.jsx` to pass the expense ID for updates and deletes.
* Changed the React row key to use `expense.id` instead of the array index.

---

## Bug 7

**How to reproduce:** Add a $100 expense split equally between 3 people. Each person gets $33.33, which adds up to only $99.99.

**What is wrong:** The split was rounding each person's share independently and losing the extra cent.

**What I changed:**

* Reworked `splitEqual` in `src/lib/money.js` to work with cents.
* Any remaining cents are distributed between the first few members so that all shares always add up to the original expense amount.

---

## Bug 8

**How to reproduce:** Create a custom percentage split with values such as 33.33%, 33.33%, and 33.34%. The form incorrectly says the percentages don't add up to 100%.

**What is wrong:** The code was checking for an exact value of `100`, which can fail because of JavaScript floating-point calculations. The percentage split could also lose a cent because of rounding.

**What I changed:**

* Changed `percentsSumTo100` to allow a very small rounding difference.
* Updated `splitByPercent` to calculate the shares in cents and distribute any remaining cent so the final shares equal the full expense amount.

---

## Bug 9

**How to reproduce:** Add a new member from the Summary section and check the “Paid so far” list.

**What is wrong:** The member count updates, but the new member doesn't appear in the list.

**What I changed:**

* Added `members` to the dependency list for the `useMemo` in `src/components/SummaryCards.jsx`.
* The summary now recalculates when members are added or changed.

---

## Bug 10

**How to reproduce:** Check expense dates in different timezones. A date such as `2026-03-12` could show as March 11 in some timezones.

**What is wrong:** `YYYY-MM-DD` strings were being parsed as UTC dates, which could shift the displayed date. There was also a mix of `Date` objects and date strings in the app.

**What I changed:**

* Updated `formatDate` and `dateValue` in `src/lib/format.js` to handle `YYYY-MM-DD` dates in local time.
* Standardized expense dates in `src/state/store.js` and `src/components/AddExpenseForm.jsx` to use `YYYY-MM-DD` strings.

---

## Bug 11

**How to reproduce:** Add an expense and click “Save expense”. The form still contains the previous description and amount.

**What is wrong:** The form wasn't being cleared after a successful submission.

**What I changed:**

* Reset the description and amount fields after saving an expense.
* Also cleared the error message so the form is ready for the next expense.

---

## Bug 12

**How to reproduce:** Edit an expense amount or update an expense from another part of the app. Also check amounts that are very close to zero.

**What is wrong:** The amount input could keep an old value because its local state wasn't updated when the expense changed. Very small negative values could also be displayed as `-$0.00`.

**What I changed:**

* Added an effect in `src/components/ExpenseList.jsx` to keep the input value in sync with the expense amount.
* Added Enter-key handling so an amount edit can be committed by pressing Enter.
* Updated `formatMoney` in `src/lib/money.js` to display values that round to zero as `$0.00` instead of `-$0.00`.

