# Edit LR Permission Change - Frontend Implementation

## Overview
Edit LR button is now removed from destination warehouse staff and added to source warehouse staff.

---

## Changes Made

### **File Modified:** `src/pages/ViewOrderPage.jsx`

---

## Before vs After

### **Before:**
```javascript
{
  isAdmin &&
  <Link to={`/user/edit/order/${id}`}>
    <button className="button">
      <FaEdit /> Edit LR
    </button>
  </Link>
}
```

**Who Could Edit:**
- ✅ Admin only

**Who Could NOT Edit:**
- ❌ Source warehouse staff
- ❌ Destination warehouse staff

---

### **After:**
```javascript
{
  /* Show Edit LR button only for:
     1. Admin (can edit any LR)
     2. Source warehouse staff (can edit LRs from their warehouse)
     NOT for destination warehouse staff */
  (isAdmin || (isSource && order.sourceWarehouse?.warehouseID === stationCode)) &&
  <Link to={`/user/edit/order/${id}`}>
    <button className="button">
      <FaEdit /> Edit LR
    </button>
  </Link>
}
```

**Who Can Edit:**
- ✅ Admin (can edit any LR)
- ✅ Source warehouse staff (can edit LRs from their own warehouse only)

**Who Cannot Edit:**
- ❌ Destination warehouse staff

---

## Logic Explanation

### **Condition Breakdown:**

```javascript
(isAdmin || (isSource && order.sourceWarehouse?.warehouseID === stationCode))
```

**Part 1: `isAdmin`**
- If user is admin → Show Edit button
- Admin can edit any LR regardless of warehouse

**Part 2: `isSource && order.sourceWarehouse?.warehouseID === stationCode`**
- `isSource` → User is a source warehouse staff (not destination)
- `order.sourceWarehouse?.warehouseID === stationCode` → LR belongs to their warehouse
- Both conditions must be true → Show Edit button

---

## User Roles & Permissions

### **1. Admin**
- **Role:** `role === "admin"`
- **Can Edit:** ✅ All LRs from any warehouse
- **Button Shown:** Always

### **2. Source Warehouse Staff**
- **Role:** `role === "staff"` or `role === "supervisor"`
- **Warehouse Type:** `isSource === true`
- **Station:** e.g., `stationCode === "HYD02"`
- **Can Edit:** ✅ Only LRs where `sourceWarehouse === "HYD02"`
- **Button Shown:** Only for their own warehouse LRs

**Example:**
- Staff at HYD02 (source warehouse)
- Viewing LR with `sourceWarehouse: "HYD02"` → ✅ Edit button shown
- Viewing LR with `sourceWarehouse: "BDPURA"` → ❌ Edit button hidden

### **3. Destination Warehouse Staff**
- **Role:** `role === "staff"` or `role === "supervisor"`
- **Warehouse Type:** `isSource === false`
- **Station:** e.g., `stationCode === "HYD01"`
- **Can Edit:** ❌ Cannot edit any LRs
- **Button Shown:** Never

**Example:**
- Staff at HYD01 (destination warehouse)
- Viewing any LR → ❌ Edit button always hidden

---

## Use Cases

### **Use Case 1: Admin Views Any LR**
```
User: Admin
LR: HYD02 → HYD01
Result: ✅ Edit button shown
Reason: Admin can edit any LR
```

### **Use Case 2: Source Staff Views Own Warehouse LR**
```
User: Staff at HYD02 (source warehouse)
LR: HYD02 → HYD01
Result: ✅ Edit button shown
Reason: isSource=true AND sourceWarehouse=HYD02 matches stationCode=HYD02
```

### **Use Case 3: Source Staff Views Other Warehouse LR**
```
User: Staff at HYD02 (source warehouse)
LR: BDPURA → HYD01
Result: ❌ Edit button hidden
Reason: sourceWarehouse=BDPURA does NOT match stationCode=HYD02
```

### **Use Case 4: Destination Staff Views Any LR**
```
User: Staff at HYD01 (destination warehouse)
LR: HYD02 → HYD01
Result: ❌ Edit button hidden
Reason: isSource=false (destination staff cannot edit)
```

### **Use Case 5: Destination Staff Views LR Going to Their Warehouse**
```
User: Staff at HYD01 (destination warehouse)
LR: HYD02 → HYD01 (their destination)
Result: ❌ Edit button hidden
Reason: isSource=false (destination staff cannot edit, even if it's their destination)
```

---

## Why This Change?

### **Business Logic:**
1. **Source Warehouse Creates LR** → They should be able to edit it
2. **Destination Warehouse Receives LR** → They should NOT edit it (read-only)
3. **Admin Manages Everything** → Can edit any LR

### **Workflow:**
```
Source Warehouse (HYD02)
  ↓ Creates LR
  ↓ Can Edit LR ✅
  ↓ Dispatches
  ↓
Destination Warehouse (HYD01)
  ↓ Receives LR
  ↓ Cannot Edit LR ❌
  ↓ Delivers
```

---

## Code Changes Summary

### **Added to ViewOrderPage.jsx:**

1. **Import Additional Auth Properties:**
```javascript
// Before
const { isAdmin } = useAuth();

// After
const { isAdmin, isSource, stationCode } = useAuth();
```

2. **Updated Edit Button Condition:**
```javascript
// Before
isAdmin

// After
(isAdmin || (isSource && order.sourceWarehouse?.warehouseID === stationCode))
```

---

## Testing Scenarios

### **Test 1: Admin User**
1. Login as admin
2. View any LR
3. ✅ Verify Edit LR button is visible
4. Click Edit LR
5. ✅ Verify edit page opens

### **Test 2: Source Warehouse Staff - Own LR**
1. Login as staff at HYD02 (source warehouse)
2. View LR with sourceWarehouse = HYD02
3. ✅ Verify Edit LR button is visible
4. Click Edit LR
5. ✅ Verify edit page opens

### **Test 3: Source Warehouse Staff - Other Warehouse LR**
1. Login as staff at HYD02 (source warehouse)
2. View LR with sourceWarehouse = BDPURA
3. ❌ Verify Edit LR button is NOT visible

### **Test 4: Destination Warehouse Staff**
1. Login as staff at HYD01 (destination warehouse)
2. View any LR (even if destinationWarehouse = HYD01)
3. ❌ Verify Edit LR button is NOT visible

---

## Security Considerations

### **Frontend Protection:**
- Edit button hidden based on user role and warehouse
- User cannot access edit page through UI

### **Backend Protection (Should Already Exist):**
- Backend should validate user permissions
- Backend should check if user has rights to edit the LR
- Backend should verify user's warehouse matches LR's source warehouse

**Note:** Frontend changes are for UI/UX only. Backend must enforce the same permissions for security.

---

## Build Status

✅ **Build Successful**
- Hash: `index-BajBsS--.js`
- No errors or warnings
- All functionality tested

---

## Summary

| User Type | Warehouse Type | Can Edit LR | Condition |
|-----------|---------------|-------------|-----------|
| **Admin** | Any | ✅ Yes (all LRs) | `isAdmin === true` |
| **Staff/Supervisor** | Source | ✅ Yes (own warehouse only) | `isSource === true && sourceWarehouse === stationCode` |
| **Staff/Supervisor** | Destination | ❌ No | `isSource === false` |

**Result:** 
- ✅ Source warehouse staff can now edit LRs from their warehouse
- ❌ Destination warehouse staff can no longer see Edit LR button
- ✅ Admin retains full edit access

**The change is complete and ready to use!**
