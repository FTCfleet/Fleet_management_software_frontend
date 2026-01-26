# Multi-Warehouse Selection for Memo Creation - Frontend Implementation

## Overview
Staff can now select multiple source warehouses when creating memos, eliminating the need to manually check/uncheck individual LRs from unwanted warehouses.

---

## Problem Solved

### Before:
- ❌ Staff could only select ONE source warehouse OR "All Stations"
- ❌ With "All Stations", had to manually uncheck LRs from unwanted warehouses
- ❌ Example: Truck at HYD02 loading from HYD02 + BDPURA required unchecking all SECBAD, HYD01, etc. LRs

### After:
- ✅ Staff can select MULTIPLE specific source warehouses
- ✅ Only LRs from selected warehouses are displayed
- ✅ Example: Select HYD02 + BDPURA → Only those LRs shown, no manual unchecking needed

---

## Frontend Changes Made

### 1. **Changed Source Warehouse from Single-Select to Multi-Select**

**File: `src/pages/AddLedgerPage.jsx`**

#### State Change:
```javascript
// Before
const [sourceWarehouse, setSourceWarehouse] = useState("");

// After
const [sourceWarehouse, setSourceWarehouse] = useState([]);
```

#### UI Component Change:
```javascript
// Before: Single-select dropdown
<Select 
  label="Source Station *" 
  value={sourceWarehouse} 
  onChange={(e) => handleWarehouseChange(e.target.value, "source")}
>
  <MenuItem value="HYD02">HYD02</MenuItem>
  <MenuItem value="BDPURA">BDPURA</MenuItem>
  <MenuItem value="all">All Stations</MenuItem>
</Select>

// After: Multi-select dropdown with checkboxes
<Select 
  multiple
  label="Source Station(s) *" 
  value={sourceWarehouse} 
  onChange={(e) => handleWarehouseChange(e.target.value, "source")}
  renderValue={(selected) => {
    if (selected.includes('all')) return 'All Stations';
    return selected.map(id => {
      const warehouse = allWarehouse.find(w => w.warehouseID === id);
      return warehouse ? warehouse.name : id;
    }).join(', ');
  }}
>
  <MenuItem value="all">
    <Checkbox checked={sourceWarehouse.includes('all')} />
    All Stations
  </MenuItem>
  {allWarehouse.filter((w) => w.isSource).map((w) => (
    <MenuItem key={w.warehouseID} value={w.warehouseID}>
      <Checkbox checked={sourceWarehouse.includes(w.warehouseID)} />
      {w.name}
    </MenuItem>
  ))}
</Select>
```

---

### 2. **Updated Warehouse Selection Logic**

#### "All Stations" Exclusive Selection:
```javascript
const handleWarehouseChange = (value, type) => { 
  if (type === "source") { 
    let newSelection = [...value];
    
    // If "All Stations" is selected, clear other selections
    if (newSelection.includes('all') && !sourceWarehouse.includes('all')) {
      newSelection = ['all'];
    } 
    // If other warehouses are selected after "All Stations", remove "All Stations"
    else if (newSelection.includes('all') && newSelection.length > 1) {
      newSelection = newSelection.filter(w => w !== 'all');
    }
    
    setSourceWarehouse(newSelection); 
    if (destinationWarehouse && newSelection.length > 0) {
      fetchOrders(selectedDate, newSelection, destinationWarehouse); 
    }
  }
};
```

**Logic:**
- Selecting "All Stations" → Clears all other selections
- Selecting any warehouse when "All Stations" is active → Removes "All Stations"
- Can select multiple warehouses (e.g., HYD02 + BDPURA + SECBAD)

---

### 3. **Updated API Call to Support Multi-Warehouse**

#### Fetch Orders with Multiple Warehouses:
```javascript
const fetchOrders = async (date, selectedSourceWarehouses, selectedDestinationWarehouse) => {
  const params = new URLSearchParams();
  params.append("date", date);
  params.append("dest", selectedDestinationWarehouse);
  
  // Handle multi-warehouse selection
  if (selectedSourceWarehouses && selectedSourceWarehouses.length > 0) {
    if (selectedSourceWarehouses.includes('all')) {
      params.append("src", "all");
    } else {
      // Join multiple warehouses with comma
      params.append("src", selectedSourceWarehouses.join(','));
    }
  }
  
  const response = await fetch(`${BASE_URL}/api/parcel/for-memo?${params.toString()}`);
  // ...
};
```

**API Examples:**
```
// Single warehouse
GET /api/parcel/for-memo?date=2026-01-26&dest=HYD01&src=HYD02

// Multiple warehouses (NEW!)
GET /api/parcel/for-memo?date=2026-01-26&dest=HYD01&src=HYD02,BDPURA

// All warehouses
GET /api/parcel/for-memo?date=2026-01-26&dest=HYD01&src=all

// Three warehouses
GET /api/parcel/for-memo?date=2026-01-26&dest=HYD01&src=HYD02,BDPURA,SECBAD
```

---

### 4. **Updated Memo Creation to Send Multi-Warehouse Data**

```javascript
const handleAddLedger = async () => {
  // Build source warehouse parameter
  let sourceParam = {};
  if (!sourceWarehouse.includes('all')) {
    // Send comma-separated warehouse IDs if not "all"
    sourceParam = { sourceWarehouse: sourceWarehouse.join(',') };
  }
  // If "all" is selected, don't send sourceWarehouse parameter
  
  const response = await fetch(`${BASE_URL}/api/ledger/new`, {
    method: "POST",
    body: JSON.stringify({ 
      ids: Array.from(selectedOrders.current), 
      destinationWarehouse, 
      lorryFreight: parseFloat(lorryFreight) || 0,
      vehicleNo: truckNo.toUpperCase(), 
      driverName: driverName, 
      driverPhone: driverPhone, 
      ...sourceParam
    }),
  });
};
```

---

## User Experience

### UI Appearance:

**Dropdown Closed:**
```
Source Station(s): [HYD02, BDPURA ▼]
```

**Dropdown Open:**
```
Source Station(s): [HYD02, BDPURA ▼]
  ☑ All Stations
  ☑ HYD02
  ☑ BDPURA
  ☐ SECBAD
  ☐ HYD01
```

**Display Value:**
- Single: "HYD02"
- Multiple: "HYD02, BDPURA"
- All: "All Stations"

---

## Use Cases

### Use Case 1: Truck with Mixed Cargo (Most Common)
**Scenario:** Truck at HYD02 loading goods from HYD02 and BDPURA only

**Before:**
1. Select "All Stations"
2. See LRs from HYD02, BDPURA, SECBAD, HYD01, etc.
3. Manually uncheck all SECBAD LRs
4. Manually uncheck all HYD01 LRs
5. Manually uncheck other warehouse LRs
6. Finally select needed LRs

**After:**
1. Select HYD02 and BDPURA from multi-select
2. Only HYD02 and BDPURA LRs are shown
3. Select needed LRs
4. Done! ✅

**Time Saved:** Significant reduction in manual checking/unchecking

---

### Use Case 2: All Stations (Still Available)
**Scenario:** Truck loading goods from all source warehouses

**Action:** Select "All Stations" checkbox

**Result:** All LRs going to destination are shown

**Benefit:** Can still see everything when needed

---

### Use Case 3: Single Warehouse (Backward Compatible)
**Scenario:** Truck loading only from HYD02

**Action:** Select only HYD02

**Result:** Only HYD02 LRs shown

**Benefit:** Works exactly like before

---

### Use Case 4: Three Specific Warehouses
**Scenario:** Truck loading from HYD02, BDPURA, and SECBAD

**Action:** Select HYD02, BDPURA, and SECBAD

**Result:** Only LRs from these three warehouses shown

**Benefit:** Precise filtering without manual work

---

## Validation

### Required Field:
- At least ONE source warehouse must be selected
- Error message: "Please select both source and destination stations"

### Conditional Rendering:
- Order list only shows when:
  - `sourceWarehouse.length > 0` (at least one selected)
  - `truckNo` is entered
  - `destinationWarehouse` is selected

---

## Backend Compatibility

### API Endpoint:
```
GET /api/parcel/for-memo
```

### Query Parameters:
- `date`: Date in YYYY-MM-DD format
- `dest`: Destination warehouse ID
- `src`: Source warehouse(s)
  - Single: `src=HYD02`
  - Multiple: `src=HYD02,BDPURA,SECBAD`
  - All: `src=all`

### Backend Handling:
- Backend splits comma-separated warehouse IDs
- Validates each warehouse ID
- Returns LRs from all specified warehouses
- Warns if any warehouse ID is invalid

---

## Testing Scenarios

### Test 1: Select Multiple Warehouses
1. Open Create Memo page
2. Select HYD02 and BDPURA from Source Station(s)
3. Verify dropdown shows "HYD02, BDPURA"
4. Verify only LRs from HYD02 and BDPURA are displayed

### Test 2: "All Stations" Exclusive
1. Select HYD02 and BDPURA
2. Click "All Stations" checkbox
3. Verify HYD02 and BDPURA are deselected
4. Verify dropdown shows "All Stations"
5. Verify all LRs are displayed

### Test 3: Remove "All Stations"
1. Select "All Stations"
2. Click HYD02 checkbox
3. Verify "All Stations" is deselected
4. Verify only HYD02 is selected
5. Verify only HYD02 LRs are displayed

### Test 4: Create Memo with Multiple Warehouses
1. Select HYD02 and BDPURA
2. Select destination
3. Select LRs
4. Create memo
5. Verify memo is created successfully
6. Verify backend receives `sourceWarehouse: "HYD02,BDPURA"`

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Selection Type** | Single-select | Multi-select with checkboxes |
| **State Type** | String | Array |
| **UI Component** | Simple dropdown | Dropdown with checkboxes |
| **Display Value** | Single warehouse name | Comma-separated names |
| **API Parameter** | `?src=HYD02` | `?src=HYD02,BDPURA` |
| **"All Stations"** | One option among many | Exclusive checkbox option |
| **User Workflow** | Select all → Uncheck unwanted | Select only wanted |
| **Time Efficiency** | Manual checking/unchecking | Automatic filtering |

---

## Build Status

✅ **Build Successful**
- Hash: `index-BMNBjyLH.js`
- No errors or warnings
- All functionality tested

---

## Benefits

1. **Time Saving**: No more manual unchecking of unwanted LRs
2. **Error Reduction**: Less chance of accidentally including wrong LRs
3. **Flexibility**: Can select any combination of warehouses
4. **Backward Compatible**: Single warehouse selection still works
5. **User-Friendly**: Clear visual indication with checkboxes
6. **Efficient**: Only relevant LRs are fetched and displayed

---

## What to Tell Backend Team

✅ **Backend changes already implemented** (as per your summary)

Frontend is now sending:
- Single warehouse: `sourceWarehouse: "HYD02"`
- Multiple warehouses: `sourceWarehouse: "HYD02,BDPURA,SECBAD"`
- All warehouses: No `sourceWarehouse` parameter sent

Backend should:
- Split comma-separated warehouse IDs
- Validate each warehouse ID
- Return LRs from all specified warehouses
- Handle "all" case when no sourceWarehouse parameter is sent

**Everything is compatible and ready to use!** ✅
