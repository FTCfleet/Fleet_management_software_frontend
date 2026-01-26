# Display Examples - Before vs After

## Freight & Hamali Input Fields

### BEFORE (Old Behavior):
```
Item: RICE
Freight: 0.00    ← Confusing! Is this zero or undefined?
Hamali: 0.00     ← Shows decimals even when not needed
```

### AFTER (New Behavior):
```
Item: RICE
Freight: -       ← Clear indication: fill with pen or undefined
Hamali: -        ← No confusing decimals
```

When user enters value:
```
User types: "50"
Display shows: 50     ← No unnecessary .00

User types: "50."
Display shows: 50.    ← Keeps decimal point

User types: "50.5"
Display shows: 50.5   ← Shows decimals only when entered
```

---

## LR View Page (Printed Document)

### BEFORE:
```
┌─────────────────────────────────────┐
│ Item Details                        │
├──────┬──────┬─────┬─────────┬───────┤
│ Item │ Type │ Qty │ Freight │ Hamali│
├──────┼──────┼─────┼─────────┼───────┤
│ RICE │ C/B  │  1  │  ₹0.00  │ ₹0.00 │  ← Looks like zero, not undefined
│ WHEAT│ C/B  │  2  │ ₹50.00  │ ₹10.00│
└──────┴──────┴─────┴─────────┴───────┘

Total: ₹0.00  ← Confusing when nothing is defined
```

### AFTER:
```
┌─────────────────────────────────────┐
│ Item Details                        │
├──────┬──────┬─────┬─────────┬───────┤
│ Item │ Type │ Qty │ Freight │ Hamali│
├──────┼──────┼─────┼─────────┼───────┤
│ RICE │ C/B  │  1  │    -    │   -   │  ← Clear space to fill with pen
│ WHEAT│ C/B  │  2  │ ₹50.00  │ ₹10.00│
└──────┴──────┴─────┴─────────┴───────┘

Total: -  ← Clear indication: calculate and fill manually
```

---

## Item Management Page

### BEFORE:
```
Regular Items List:
┌──────────┬──────────┬─────────┐
│ Item     │ Freight  │ Hamali  │
├──────────┼──────────┼─────────┤
│ RICE     │ ₹0.00    │ ₹0.00   │  ← Looks defined but is actually null
│ WHEAT    │ ₹50.00   │ ₹10.00  │
│ SUGAR    │ ₹0.00    │ ₹5.00   │  ← Is this zero or undefined?
└──────────┴──────────┴─────────┘
```

### AFTER:
```
Regular Items List:
┌──────────┬──────────┬─────────┐
│ Item     │ Freight  │ Hamali  │
├──────────┼──────────┼─────────┤
│ RICE     │    -     │    -    │  ← Clearly undefined
│ WHEAT    │ ₹50.00   │ ₹10.00  │
│ SUGAR    │    -     │ ₹5.00   │  ← Freight undefined, Hamali defined
└──────────┴──────────┴─────────┘
```

---

## Create LR Page - Charges Summary

### BEFORE:
```
┌─────────────────────────────────┐
│ Charges Summary                 │
├─────────────────────────────────┤
│ Freight:        ₹0.00           │
│ Hamali:         ₹0.00           │
│ Statistical:    ₹0.00           │
│ Total:          ₹0.00           │  ← Looks like everything is zero
└─────────────────────────────────┘
```

### AFTER:
```
┌─────────────────────────────────┐
│ Charges Summary                 │
├─────────────────────────────────┤
│ Freight:        ₹-              │  ← Fill manually
│ Hamali:         ₹-              │  ← Fill manually
│ Statistical:    ₹-              │  ← Fill manually
│ Total:          ₹-              │  ← Calculate and fill
└─────────────────────────────────┘
```

---

## Input Behavior Examples

### Scenario 1: Predefined Item with Rates
```
User selects: "WHEAT" (has predefined rates)
Display:
  Freight: 50      ← Shows without .00
  Hamali: 10       ← Shows without .00
```

### Scenario 2: Predefined Item without Rates
```
User selects: "RICE" (no predefined rates - null in DB)
Display:
  Freight: -       ← Empty field with hyphen
  Hamali: -        ← Empty field with hyphen
```

### Scenario 3: Manual Entry
```
User types in Freight field:
  "1"     → Display: 1
  "12"    → Display: 12
  "12."   → Display: 12.
  "12.5"  → Display: 12.5
  "12.50" → Display: 12.50
```

### Scenario 4: Zero vs Null
```
Database Value: null
Display: -

Database Value: 0
Display: -

Database Value: 5000 (₹50.00)
Display: 50.00
```

---

## Session Expiry

### BEFORE:
```
User logs in → Works indefinitely
Staff leaves PC logged in → Anyone can access
```

### AFTER:
```
User logs in → Token valid for 48 hours
After 48 hours → Any API call triggers:
  ┌────────────────────────────────────┐
  │  Your session has expired.         │
  │  Please login again.               │
  └────────────────────────────────────┘
  → Redirects to /auth/login page
  → Token cleared from localStorage
```

---

## Print-Friendly Format

When printing LR with undefined rates:
```
┌──────────────────────────────────────────────────┐
│ LOADING RECEIPT                                  │
├──────────────────────────────────────────────────┤
│ Item: RICE                                       │
│ Quantity: 10                                     │
│ Freight: ₹-       ← Staff can write with pen    │
│ Hamali:  ₹-       ← Staff can write with pen    │
│ Amount:  ₹-       ← Staff can calculate & write │
└──────────────────────────────────────────────────┘
```

This allows:
1. Manual calculation at destination
2. Pen entry on printed documents
3. Clear indication of undefined values
4. Professional appearance
5. No confusion between zero and undefined
6. Clean, minimal display with single hyphen
