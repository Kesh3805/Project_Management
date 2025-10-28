# Testing Guide

## Manual Testing Checklist

### ✅ Task Creation
- [ ] Open the app and click "Add New Task"
- [ ] Fill in all required fields
- [ ] Click "Create Task"
- [ ] Verify task appears in the list
- [ ] Verify task has correct priority badge color
- [ ] Verify task has correct status badge color

### ✅ Task Editing
- [ ] Click "Edit" on any task
- [ ] Modify the title
- [ ] Modify the description
- [ ] Change the priority
- [ ] Change the status
- [ ] Click "Update Task"
- [ ] Verify changes are reflected in the task card

### ✅ Task Deletion
- [ ] Click "Delete" on a task
- [ ] Verify confirmation dialog appears
- [ ] Click "OK" to confirm
- [ ] Verify task is removed from the list

### ✅ Status Update
- [ ] Use the status dropdown on a task card
- [ ] Change status from "Pending" to "InProgress"
- [ ] Verify status badge updates
- [ ] Change to "Completed"
- [ ] Verify status badge updates

### ✅ Filtering
- [ ] Set Status filter to "Pending"
- [ ] Verify only pending tasks are shown
- [ ] Set Status filter to "InProgress"
- [ ] Verify only in-progress tasks are shown
- [ ] Set Status filter to "Completed"
- [ ] Verify only completed tasks are shown
- [ ] Set Status filter to "All"
- [ ] Verify all tasks are shown
- [ ] Set Priority filter to "High"
- [ ] Verify only high priority tasks are shown
- [ ] Test combinations of filters

### ✅ Sorting
- [ ] Set Sort By to "Priority"
- [ ] Verify tasks are ordered: High → Medium → Low
- [ ] Set Sort By to "Due Date"
- [ ] Verify tasks are ordered by date (earliest first)
- [ ] Set Sort By to "None"
- [ ] Verify default order is restored

### ✅ Responsive Design

#### Desktop (> 1024px)
- [ ] Open app on desktop browser
- [ ] Verify 3-column grid layout
- [ ] Verify header displays user info
- [ ] Verify all elements are properly spaced

#### Tablet (768px - 1024px)
- [ ] Resize browser to tablet width
- [ ] Verify 2-column grid layout
- [ ] Verify filter bar wraps properly
- [ ] Verify form fields are readable

#### Mobile (< 768px)
- [ ] Resize browser to mobile width
- [ ] Verify 1-column grid layout
- [ ] Verify task cards are full width
- [ ] Verify filters stack vertically
- [ ] Verify form is usable
- [ ] Verify buttons are touchable

### ✅ Form Validation
- [ ] Try to submit empty form
- [ ] Verify required field messages
- [ ] Enter only title, submit
- [ ] Verify other required fields are enforced
- [ ] Enter invalid date format
- [ ] Verify date validation

### ✅ Visual Feedback
- [ ] Verify loading spinner when fetching tasks
- [ ] Verify error messages display correctly
- [ ] Verify success state after creating task
- [ ] Verify hover effects on buttons
- [ ] Verify card shadows on hover

### ✅ Overdue Tasks
- [ ] Create a task with past due date
- [ ] Verify "(Overdue!)" label appears
- [ ] Verify due date is displayed in red
- [ ] Change status to "Completed"
- [ ] Verify overdue indicator disappears

### ✅ Empty State
- [ ] Delete all tasks
- [ ] Verify empty state message appears
- [ ] Verify empty state has helpful text
- [ ] Verify empty state icon is visible

## API Testing

### Using PowerShell

#### 1. Get All Tasks
```powershell
curl http://localhost:5000/api/tasks
```
**Expected**: JSON array of tasks

#### 2. Get Specific Task
```powershell
curl http://localhost:5000/api/tasks/1
```
**Expected**: Single task object

#### 3. Create Task
```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test Task\",\"description\":\"Testing\",\"priority\":\"High\",\"dueDate\":\"2025-11-15\",\"assignee\":\"Tester\",\"status\":\"Pending\"}'
```
**Expected**: Created task with ID

#### 4. Update Task
```powershell
curl -X PUT http://localhost:5000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{\"status\":\"Completed\"}'
```
**Expected**: Updated task object

#### 5. Delete Task
```powershell
curl -X DELETE http://localhost:5000/api/tasks/1
```
**Expected**: Success message

### Test Filters via API

#### Filter by Status
```powershell
curl "http://localhost:5000/api/tasks?status=Pending"
```

#### Filter by Priority
```powershell
curl "http://localhost:5000/api/tasks?priority=High"
```

#### Sort by Priority
```powershell
curl "http://localhost:5000/api/tasks?sortBy=priority"
```

#### Sort by Due Date
```powershell
curl "http://localhost:5000/api/tasks?sortBy=dueDate"
```

#### Combined Filters
```powershell
curl "http://localhost:5000/api/tasks?status=InProgress&priority=High&sortBy=dueDate"
```

## Error Handling Tests

### Backend Error Tests

#### 1. Invalid Task ID
```powershell
curl http://localhost:5000/api/tasks/999
```
**Expected**: 404 Not Found

#### 2. Missing Required Fields
```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Incomplete\"}'
```
**Expected**: 400 Bad Request with error message

#### 3. Invalid Priority
```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test\",\"description\":\"Test\",\"priority\":\"Invalid\",\"dueDate\":\"2025-11-15\",\"assignee\":\"Test\",\"status\":\"Pending\"}'
```
**Expected**: 400 Bad Request

#### 4. Invalid Status
```powershell
curl -X PUT http://localhost:5000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{\"status\":\"Invalid\"}'
```
**Expected**: 400 Bad Request

### Frontend Error Tests

#### 1. Backend Not Running
- [ ] Stop backend server
- [ ] Try to load frontend
- [ ] Verify error message appears
- [ ] Verify loading state handles gracefully

#### 2. Network Error Simulation
- [ ] Start both servers
- [ ] Open browser DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to create a task
- [ ] Verify error message appears

## Performance Tests

### Load Test
- [ ] Create 20+ tasks
- [ ] Verify UI remains responsive
- [ ] Test filtering with large dataset
- [ ] Test sorting with large dataset
- [ ] Verify scrolling is smooth

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test in Safari (if available)

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Verify focus indicators are visible
- [ ] Press Enter to submit form
- [ ] Use Escape to close form

### Screen Reader (if available)
- [ ] Enable screen reader
- [ ] Navigate through task cards
- [ ] Verify labels are read correctly
- [ ] Verify buttons are announced

## Security Tests

### Input Validation
- [ ] Try XSS in title field: `<script>alert('XSS')</script>`
- [ ] Verify script doesn't execute
- [ ] Try SQL-like injection in fields
- [ ] Verify input is sanitized

### CORS
- [ ] Verify CORS headers are present
- [ ] Verify API can be called from frontend

## Test Report Template

```
Date: __________
Tester: __________

✅ Passed Tests: ____ / ____
❌ Failed Tests: ____ / ____

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Notes:
_______________________
_______________________
```

## Automated Testing (Future Enhancement)

### Backend Tests
```javascript
// Example: Test task creation
describe('POST /api/tasks', () => {
  it('should create a new task', async () => {
    const task = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'High',
      dueDate: '2025-11-15',
      assignee: 'Tester',
      status: 'Pending'
    };
    const response = await request(app)
      .post('/api/tasks')
      .send(task);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Tests
```javascript
// Example: Test TaskCard component
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';

test('renders task title', () => {
  const task = {
    id: 1,
    title: 'Test Task',
    description: 'Test',
    priority: 'High',
    dueDate: '2025-11-15',
    assignee: 'Tester',
    status: 'Pending'
  };
  render(<TaskCard task={task} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
```

## Testing Best Practices

1. ✅ Test on multiple browsers
2. ✅ Test on multiple devices
3. ✅ Test edge cases
4. ✅ Test error scenarios
5. ✅ Test with realistic data
6. ✅ Test user workflows end-to-end
7. ✅ Document bugs clearly
8. ✅ Retest after fixes

---

**Happy Testing! 🧪**
