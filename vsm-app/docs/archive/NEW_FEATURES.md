# New Features Added

## 1. Plant/Factory Selection in Header

A plant selection dropdown has been added to the dashboard header that allows users to filter data by factory.

### Features:
- Dropdown located in the header next to the "Last Updated" indicator
- Fetches factory list from the `Factory_master` sheet in Google Sheets
- Includes an "All Plants" option to view data from all factories
- Clean, modern UI with hover effects and active state highlighting

### Implementation:
- **Component**: `src/components/Header.tsx`
- **API Endpoint**: `src/app/api/factories/route.ts`
- Fetches factory data from `Factory_master` sheet (columns A and B)
- Updates the `selectedPlant` state in the main dashboard

### Google Sheets Setup:
Ensure your `Factory_master` sheet has the following structure:
```
Column A: Factory Name
Column B: Factory Code (optional)
```

Example:
```
Factory 1   | F1
Factory 2   | F2
Plant North | PN
Plant South | PS
```

---

## 2. Update Task Feature in Sidebar

A new "Update Task" option has been added to the sidebar that opens a modal form for entering task/process updates.

### Features:
- New sidebar icon with Edit3 icon for "Update Task"
- Opens a modal dialog with a clean, professional form
- Form fields include:
  - **Line No.**: Dropdown selection
  - **Process Stage**: Dropdown selection
  - **Actual Start Date**: Date picker with calendar icon
  - **Actual End Date**: Date picker with calendar icon
  - **Delay Reason**: Text area for optional delay reasons
- Save and Cancel buttons with proper styling
- Modal closes on save or cancel

### Implementation:
- **Sidebar Update**: `src/components/Sidebar.tsx` - Added "Update Task" menu item
- **Modal Component**: `src/components/TaskUpdateModal.tsx` - New component
- **Main Page**: `src/app/page.tsx` - Integrated modal and handlers

### Usage:
1. Click the "Update Task" icon in the sidebar (Edit icon - 9th item)
2. Fill in the required fields:
   - Select line number
   - Select process stage
   - Enter actual start and end dates
   - Optionally add delay reason
3. Click "Save" to submit the form
4. Click "Cancel" or the X button to close without saving

### TODO - Backend Integration:
Currently, the form logs data to the console. To save data to Google Sheets:

1. Create a new API endpoint at `src/app/api/update-task/route.ts`
2. Implement a POST method to update the Google Sheets data
3. Update the `onSave` handler in `src/app/page.tsx` to call this API

Example API implementation:
```typescript
// src/app/api/update-task/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const taskData = await request.json();
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Update the sheet with task data
    // Implement your logic here based on your sheet structure
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
```

---

## Files Modified

1. **src/components/Header.tsx** - Added plant selection dropdown
2. **src/components/Sidebar.tsx** - Added "Update Task" menu item
3. **src/components/TaskUpdateModal.tsx** - New modal component for task updates
4. **src/components/index.ts** - Exported new TaskUpdateModal component
5. **src/app/page.tsx** - Integrated plant selection and task modal
6. **src/app/api/factories/route.ts** - New API endpoint to fetch factory list

---

## Environment Variables Required

Ensure these environment variables are set in your `.env.local` file:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

---

## Testing

1. **Plant Selection**:
   - Navigate to the dashboard
   - Click on the plant dropdown in the header
   - Select different plants and verify the selection updates

2. **Update Task**:
   - Click the "Update Task" icon in the sidebar (9th icon - edit/pen icon)
   - Fill in all required fields
   - Click Save and check the browser console for logged data
   - Click Cancel to close without saving

---

## Future Enhancements

1. Implement backend API to save task updates to Google Sheets
2. Add form validation for dates (end date should be after start date)
3. Filter dashboard data based on selected plant
4. Add success/error notifications after task submission
5. Fetch line numbers and process stages dynamically from the sheet
6. Add authentication to track who updated which tasks
