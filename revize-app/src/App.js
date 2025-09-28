import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Customers from './pages/Customers';
import EquipmentManagement from './pages/EquipmentManagement';
import Revisions from './pages/Revisions';
import Services from './pages/Services';
import Inspections from './pages/Inspections';
import Logbook from './pages/Logbook';
import Operators from './pages/Operators';
import Users from './pages/Users';
import Profile from './pages/Profile';
import CraneRecords from './pages/CraneRecords';
import EquipmentDetail from './pages/EquipmentDetail';
import EquipmentDashboard from './pages/EquipmentDashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import NotFound from './pages/NotFound';

// Logbook components
import DailyCheckForm from './components/logbook/DailyCheckForm';
import FaultReportForm from './components/logbook/FaultReportForm';

// Autentizace a autorizace
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';
import UnauthorizedPage from './auth/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Veřejné cesty */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Chráněné cesty */}
        <Route
          path="/"
          element={
            <ProtectedRoute 
              element={<Layout><EquipmentDashboard /></Layout>} 
            />
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute 
              element={<Layout><Customers /></Layout>} 
              module="customers"
              action="view"
            />
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute 
              element={<Layout><EquipmentManagement /></Layout>} 
              module="equipment"
              action="view"
            />
          }
        />
        <Route
          path="/revisions"
          element={
            <ProtectedRoute 
              element={<Layout><Revisions /></Layout>} 
              module="revisions"
              action="view"
            />
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute 
              element={<Layout><Services /></Layout>} 
              module="service_visits"
              action="view"
            />
          }
        />
        <Route
          path="/inspections"
          element={
            <ProtectedRoute 
              element={<Layout><Inspections /></Layout>} 
              module="inspections"
              action="view"
            />
          }
        />
        
        <Route
          path="/logbook"
          element={
            <ProtectedRoute 
              element={<Layout><Logbook /></Layout>} 
              module="logbook"
              action="view"
            />
          }
        />
        
        <Route
          path="/crane-records"
          element={
            <ProtectedRoute 
              element={<Layout><CraneRecords /></Layout>} 
              module="logbook"
              action="view"
            />
          }
        />
        
        {/* Redirect old locations route to new equipment management */}
        <Route
          path="/locations"
          element={
            <ProtectedRoute 
              element={<Layout><EquipmentManagement /></Layout>} 
              module="equipment"
              action="view"
            />
          }
        />
        
        <Route
          path="/equipment/:equipmentId"
          element={
            <ProtectedRoute 
              element={<Layout><EquipmentDetail /></Layout>} 
              module="equipment"
              action="view"
            />
          }
        />
        
        <Route
          path="/projects"
          element={
            <ProtectedRoute 
              element={<Layout><ProjectsPage /></Layout>} 
              module="projects"
              action="view"
            />
          }
        />
        
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute 
              element={<Layout><CreateProject /></Layout>} 
              module="projects"
              action="create"
            />
          }
        />
        
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute 
              element={<Layout><ProjectDetail /></Layout>} 
              module="projects"
              action="view"
            />
          }
        />
        
        <Route
          path="/projects/:id/edit"
          element={
            <ProtectedRoute 
              element={<Layout><CreateProject /></Layout>} 
              module="projects"
              action="edit"
            />
          }
        />
        
        <Route
          path="/operators"
          element={
            <ProtectedRoute 
              element={<Layout><Operators /></Layout>} 
              module="operators"
              action="view"
            />
          }
        />
        
        {/* Logbook specific routes - will be handled by components */}
        <Route
          path="/logbook/daily-check/:equipmentId"
          element={
            <ProtectedRoute 
              element={<Layout><DailyCheckForm /></Layout>} 
              module="logbook"
              action="create"
            />
          }
        />
        
        <Route
          path="/logbook/fault-report/:equipmentId"
          element={
            <ProtectedRoute 
              element={<Layout><FaultReportForm /></Layout>} 
              module="logbook"
              action="create"
            />
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute 
              element={<Layout><Users /></Layout>} 
              module="users"
              action="view"
            />
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute 
              element={<Layout><Profile /></Layout>} 
            />
          }
        />
        
        {/* 404 stránka */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
