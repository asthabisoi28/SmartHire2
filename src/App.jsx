import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../Layout.jsx'
import Home from '../Pages/Home.jsx'
import CandidateDashboard from '../Pages/CandidateDashboard.jsx'
import HRdashboard from '../Pages/HRdashboard.jsx'
import ATSChecker from '../Pages/ATSChecker.jsx'
import TechnicalTest from '../Pages/TechnicalTest.jsx'
import InterviewRoom from '../Pages/InterviewRoom.jsx'
import LiveInterview from '../Pages/LiveInterview.jsx'
import CandidateManagement from '../Pages/CandidateManagement.jsx'
import Analytics from '../Pages/Analytics.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <Layout currentPageName="Home">
          <Home />
        </Layout>
      } />
      
      {/* Candidate Routes */}
      <Route path="/candidate/dashboard" element={
        <Layout currentPageName="CandidateDashboard">
          <CandidateDashboard />
        </Layout>
      } />
      
      <Route path="/candidate/ats-checker" element={
        <Layout currentPageName="ATSChecker">
          <ATSChecker />
        </Layout>
      } />
      
      <Route path="/candidate/technical-test" element={
        <Layout currentPageName="TechnicalTest">
          <TechnicalTest />
        </Layout>
      } />
      
      <Route path="/candidate/interview" element={
        <Layout currentPageName="InterviewRoom">
          <InterviewRoom />
        </Layout>
      } />
      
      {/* HR Routes */}
      <Route path="/hr/dashboard" element={
        <Layout currentPageName="HRDashboard">
          <HRdashboard />
        </Layout>
      } />
      
      <Route path="/hr/candidates" element={
        <Layout currentPageName="CandidateManagement">
          <CandidateManagement />
        </Layout>
      } />
      
      <Route path="/hr/analytics" element={
        <Layout currentPageName="Analytics">
          <Analytics />
        </Layout>
      } />
      
      {/* Live Interview */}
      <Route path="/interview/live" element={
        <Layout currentPageName="LiveInterview">
          <LiveInterview />
        </Layout>
      } />
    </Routes>
  )
}

export default App