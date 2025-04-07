# Dashboard Layout and Functionality

## 1. Architecture Overview

The dashboard system in Wealth Guardian consists of two main components:

1. **DashboardLayout Component**: A reusable layout wrapper that provides the sidebar, header, and content area structure
2. **Dashboard Page Components**: Various pages (like DashboardPage, WalletPage, etc.) that are rendered within the layout

## 2. DashboardLayout Component

The `DashboardLayout` component creates the consistent UI shell for all authenticated pages in the application. It is implemented in `frontend/src/components/layout/DashboardLayout.jsx`.

### 2.1 Component Structure

```jsx
<DashboardLayout>
  {children} // Page content is passed as children
</DashboardLayout>
```

### 2.2 Key Features

- **Responsive Design**: Adapts to both desktop and mobile interfaces
- **Persistent Sidebar**: On desktop, the sidebar is always visible; on mobile, it's collapsible
- **Theme Switching**: Supports light and dark mode with a toggle button
- **Navigation Management**: Handles active state of navigation links
- **User Authentication Integration**: Displays current user information

### 2.3 Layout Structure

The component creates a page with three main sections:

```
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  +--------------+                     +---------------------------------------+        |
|  |              |                     |                                       |        |
|  |   Sidebar    |                     |           Mobile Header               |        |
|  |   (Fixed)    |                     |      (Only visible on mobile)         |        |
|  |              |                     |                                       |        |
|  |              |                     +---------------------------------------+        |
|  |              |                     |                                       |        |
|  |  Navigation  |                     |                                       |        |
|  |    Items     |                     |           Main Content Area           |        |
|  |              |                     |                                       |        |
|  |              |                     |         (Page Components)             |        |
|  |              |                     |                                       |        |
|  |              |                     |                                       |        |
|  |              |                     |                                       |        |
|  +--------------+                     +---------------------------------------+        |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```

### 2.4 Sidebar Implementation

The sidebar is implemented as an `<aside>` element with conditional classes for responsive behavior:

```jsx
<aside className={`fixed left-0 top-0 z-40 h-full w-64 transition-transform md:translate-x-0 ${
  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
  {/* Sidebar content */}
</aside>
```

Key aspects:
- Fixed position for viewport scrolling
- Width of 64 (16rem/256px) on the left side
- CSS transitions for smooth appearance/disappearance
- Transforms for showing/hiding on mobile (translate-x)
- Dark mode support with color variations

### 2.5 Navigation Items

Navigation items are defined as an array of objects:

```jsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Wallet',
    href: '/wallet',
    icon: WalletIcon,
    children: [
      { name: 'Overview', href: '/wallet' },
      { name: 'Add Funds', href: '/wallet/add-funds', icon: BanknotesIcon },
      /* More items */
    ]
  },
  { name: 'Analytics', href: '/wallet/analytics', icon: ChartPieIcon },
  { name: 'Budgets', href: '/budgets', icon: CalculatorIcon },
  { name: 'Goals', href: '/goals', icon: FlagIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon }
];
```

Each item can have:
- A direct link (href)
- An icon from Heroicons
- Optional nested children for dropdown menus

### 2.6 Active Route Highlighting

The sidebar highlights the currently active route using the `useLocation` hook from React Router:

```jsx
const isActive = (path) => {
  if (path === '/wallet' && location.pathname === '/wallet') {
    return true;
  }
  return location.pathname.startsWith(path);
};
```

This allows the sidebar to visually indicate the current page to users.

### 2.7 Content Area

The content area is a simple container that renders any children passed to the DashboardLayout:

```jsx
<div className="md:ml-64 p-4 md:p-8">
  {/* Mobile header (visible on small screens) */}
  <div className="mb-8 md:hidden">
    {/* Mobile header content */}
  </div>
  
  {/* Page content */}
  <main>{children}</main>
</div>
```

Key aspects:
- Left margin matches sidebar width (ml-64) on medium screens and up
- Appropriate padding for content
- A special mobile header that only appears on small screens

### 2.8 Theme Switching

Theme toggling is handled through a context API:

```jsx
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme === 'dark' ? 'light' : 'dark');
};
```

The appropriate icon (sun/moon) is displayed based on the current theme.

## 3. Routing and Layout Integration

The `App.jsx` file connects the routing system with the DashboardLayout:

```jsx
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  
  {/* Wallet Routes */}
  <Route path="/wallet" element={<WalletPage />} />
  {/* More routes */}
  
  {/* Budget & Goals Routes */}
  <Route path="/budgets" element={<BudgetsPage />} />
  <Route path="/goals" element={<GoalsPage />} />
  
  {/* Profile Routes */}
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

Each protected route is wrapped in a `<PrivateRoute>` component that ensures authentication, and each page component internally uses the DashboardLayout.

## 4. DashboardPage Component

The DashboardPage is the main landing page after login, displaying a summary of financial information. It is implemented in `frontend/src/pages/DashboardPage.jsx`.

### 4.1 Component Structure

```jsx
const DashboardPage = () => {
  // State and effects
  
  return (
    <DashboardLayout>
      {/* Dashboard content */}
    </DashboardLayout>
  );
};
```

### 4.2 State Management

The component manages several pieces of state:

```jsx
const [userData, setUserData] = useState({ name: '', email: '' });
const [walletData, setWalletData] = useState({ 
  balance: 0, 
  totalSent: 0, 
  totalReceived: 0 
});
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);
// Various loading states for different data sources
const [loadingProfile, setLoadingProfile] = useState(true);
const [loadingWallet, setLoadingWallet] = useState(true);
const [loadingTransactions, setLoadingTransactions] = useState(true);
const [error, setError] = useState(null);
```

This allows for granular loading states and error handling for different API calls.

### 4.3 Data Fetching with useEffect

The dashboard uses multiple `useEffect` hooks to fetch different data:

1. **User Profile Data**:
   ```jsx
   useEffect(() => {
     const fetchUserProfile = async () => {
       try {
         const userProfile = await authService.getCurrentUser();
         setUserData({
           name: userProfile.name || 'User',
           email: userProfile.email || ''
         });
       } catch (err) {
         // Error handling
       } finally {
         setLoadingProfile(false);
       }
     };
     
     fetchUserProfile();
   }, []);
   ```

2. **Wallet Data**:
   ```jsx
   useEffect(() => {
     const fetchWalletData = async () => {
       try {
         const wallet = await walletService.getWalletInfo();
         const stats = await walletService.getWalletStats();
         
         setWalletData({
           balance: wallet?.balance || 0,
           totalSent: stats?.totalSent || 0,
           totalReceived: stats?.totalReceived || 0
         });
       } catch (err) {
         // Error handling
       } finally {
         setLoadingWallet(false);
       }
     };
     
     fetchWalletData();
   }, []);
   ```

3. **Transactions**:
   ```jsx
   useEffect(() => {
     const fetchTransactions = async () => {
       try {
         const transactionsData = await walletService.getTransactions({}, 1, 5);
         setTransactions(transactionsData?.transactions || []);
       } catch (err) {
         // Error handling
       } finally {
         setLoadingTransactions(false);
       }
     };
     
     fetchTransactions();
   }, []);
   ```

4. **Combined Loading State**:
   ```jsx
   useEffect(() => {
     if (!loadingProfile && !loadingWallet && !loadingTransactions) {
       setLoading(false);
     }
   }, [loadingProfile, loadingWallet, loadingTransactions]);
   ```

This approach allows for parallel data fetching and a unified loading state.

### 4.4 Quick Actions

The dashboard defines quick access actions for common tasks:

```jsx
const quickActions = [
  { 
    title: 'Add Funds', 
    path: '/wallet/add-funds',
    icon: BanknotesIcon,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  // More actions
];
```

These are rendered as clickable cards that navigate to different parts of the application.

### 4.5 Layout Structure

The dashboard page has the following sections:

1. **Welcome Header**: Personalized greeting with the user's name
2. **Error Banner**: Conditional error display with retry button
3. **Financial Summary**:
   - Wallet Balance Card
   - Transaction Statistics (Total Sent/Received)
4. **Quick Action Cards**: For common tasks
5. **Recent Transactions**: Latest 5 transactions with details

### 4.6 Loading State

A loading spinner is displayed while data is being fetched:

```jsx
if (loading) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

This maintains the layout structure even during loading.

### 4.7 Responsive Design

The dashboard uses responsive grid layouts to adapt to different screen sizes:

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  <div className="md:col-span-2">
    <WalletCard balance={walletData.balance} />
  </div>
  {/* More content */}
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Quick action cards */}
</div>
```

This ensures an optimal layout on both mobile and desktop devices.

## 5. Putting It All Together

The dashboard system works through these connected components:

1. `App.jsx` defines the routes and protects them with authentication
2. Each page component (like `DashboardPage.jsx`) wraps its content in `<DashboardLayout>`
3. `DashboardLayout.jsx` provides the sidebar, navigation, and structure
4. The content from each page appears in the main content area of the layout

This architecture maintains consistent navigation while allowing unique content for each page.

## 6. Key Design Principles

1. **Separation of Concerns**: Layout and page content are separate components
2. **Responsive First**: Built to work on all device sizes
3. **Theme Support**: Light and dark mode with consistent styling
4. **Loading States**: Clear indicators when data is loading
5. **Error Handling**: Graceful error display with recovery options
6. **Component Reuse**: Leverages UI components like Card, Button across the system

This modular approach allows for maintainable code and consistent user experience throughout the application. 