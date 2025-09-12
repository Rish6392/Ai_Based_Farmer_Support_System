# React Router Migration

This document outlines the changes made to migrate from a tab-based navigation system to React Router for better navigation and URL management.

## Changes Made

### 1. Updated Dependencies
- React Router DOM was already installed (`react-router-dom: ^7.8.2`)

### 2. Main App Structure Changes

#### `main.jsx`
- Wrapped the app with `BrowserRouter` for React Router functionality

#### `App.jsx`
- Completely refactored from tab-based navigation to React Router
- Replaced `Tabs` component with `Routes` and `Route` components
- Created nested routing structure with Layout component

### 3. New Components Created

#### `Layout.jsx`
- Contains the main app header and navigation structure
- Uses `Outlet` to render child routes
- Includes dynamic page title detection based on current route

#### Updated `Navbar.jsx`
- Converted from static header to navigation component
- Uses `NavLink` from React Router for active state management
- Maintains the same visual styling as the original tabs

### 4. Navigation Routes

The application now has the following routes:
- `/` - Chat Page (Ask Expert)
- `/disease-prediction` - Disease Prediction Page
- `/dashboard` - Dashboard Page
- `/*` - 404 Not Found Page

### 5. Navigation Utilities

#### `utils/navigation.js`
- Custom hook `useAppNavigation()` for programmatic navigation
- Route constants for consistency
- Helper functions for navigating to specific pages

### 6. Enhanced Features

#### Programmatic Navigation
- Updated `DiseasePredictionPage` to navigate to chat page after prediction
- Passes query data between pages using navigation state

#### 404 Error Page
- Created `NotFoundPage.jsx` for better user experience
- Handles invalid routes gracefully

## Benefits of React Router Migration

1. **URL Management**: Each page now has its own URL, making it bookmarkable and shareable
2. **Browser Navigation**: Back/forward buttons work correctly
3. **Better SEO**: Search engines can index individual pages
4. **Code Organization**: Cleaner separation of concerns
5. **Programmatic Navigation**: Easy navigation between pages with data passing
6. **User Experience**: Proper page loading states and error handling

## Usage Examples

### Basic Navigation
```jsx
import { useAppNavigation } from '../utils';

const MyComponent = () => {
  const { navigateToChat, navigateToDiseasePrediction } = useAppNavigation();
  
  // Navigate to chat with a query
  const handleNavigateToChat = () => {
    navigateToChat("Tell me about plant diseases");
  };
  
  return (
    <button onClick={handleNavigateToChat}>
      Ask Expert
    </button>
  );
};
```

### Using NavLink for Active States
```jsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive ? 'active-nav-class' : 'inactive-nav-class'
  }
>
  Dashboard
</NavLink>
```

## Migration Notes

- The original `Tabs` component is preserved for potential future use
- All existing functionality is maintained
- No breaking changes to component APIs
- Context providers (ChatProvider, DocumentProvider) continue to work as before
