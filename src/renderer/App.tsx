import React, { useState, useEffect } from 'react';
import UrlList from './components/UrlList';
import AddUrlForm from './components/AddUrlForm';
import { useUrlStore } from './store/urlStore';

const App: React.FC = () => {
  const { urls, fetchUrls, loading, error } = useUrlStore();
  
  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Mosaiq</h1>
      <p>Personal Knowledge Management</p>
      
      <div style={{ marginBottom: '30px' }}>
        <AddUrlForm />
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <UrlList urls={urls} />
      )}
    </div>
  );
};

export default App;
