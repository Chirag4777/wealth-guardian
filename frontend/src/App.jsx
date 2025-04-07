import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer, Slide } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/Auth/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import DashboardPage from "./pages/DashboardPage";
import WalletPage from "./pages/WalletPage";
import AddFundsPage from "./pages/AddFundsPage";
import TransferPage from "./pages/TransferPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BudgetsPage from "./pages/BudgetsPage";
import GoalsPage from "./pages/GoalsPage";
import BudgetForm from "./components/budgets/BudgetForm";
import GoalForm from "./components/goals/GoalForm";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            
            {/* Logout Route - Handle any direct navigation to /logout */}
            <Route path="/logout" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Wallet Routes */}
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/wallet/add-funds" element={<AddFundsPage />} />
              <Route path="/wallet/transfer" element={<TransferPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/wallet/analytics" element={<AnalyticsPage />} />
              
              {/* Budget & Goals Routes */}
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/budgets/create" element={<BudgetForm />} />
              
              {/* Important: Update these routes */}
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/goals/creategoal" element={<GoalForm />} />
              
              {/* Profile Routes */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
