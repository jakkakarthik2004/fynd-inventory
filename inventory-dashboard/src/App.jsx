import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ItemDetails from './pages/ItemDetails';
import SupplierHub from './pages/SupplierHub';
import ManualOrder from './pages/ManualOrder';
import PredictSales from './pages/PredictSales';
import SmartBundles from './pages/SmartBundles';
import SafetyStock from './pages/SafetyStock';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [marketSignal, setMarketSignal] = useState('neutral');

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
              <Layout>
                  <Dashboard marketSignal={marketSignal} setMarketSignal={setMarketSignal} />
              </Layout>
          } />
          <Route path="/item/:itemId" element={
              <Layout>
                  <ItemDetails marketSignal={marketSignal} />
              </Layout>
          } />
          <Route path="/suppliers" element={
              <Layout>
                  <SupplierHub />
              </Layout>
          } />
          <Route path="/manual-order" element={
              <Layout>
                  <ManualOrder />
              </Layout>
          } />
          <Route path="/predict-sales" element={
              <Layout>
                  <PredictSales />
              </Layout>
          } />
          <Route path="/smart-bundles" element={
              <Layout>
                  <SmartBundles />
              </Layout>
          } />
          <Route path="/safety-stock" element={
              <Layout>
                  <SafetyStock />
              </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
