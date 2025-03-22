import React, { useState, useEffect } from 'react';
import UrlList from './components/UrlList';
import AddUrlForm from './components/AddUrlForm';
import ContentViewer from './components/ContentViewer';
import { useUrlStore } from './store/urlStore';
import { useSettingsStore } from './store/settingsStore';
import './styles/readerMode.css';

const App: React.FC = () => {
  const { urls, fetchUrls, loading, error } = useUrlStore();
  const { fetchSettings } = useSettingsStore();
  const [selectedUrlId, setSelectedUrlId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUrls();
    fetchSettings();
  }, [fetchUrls, fetchSettings]);
  
  const handleSelectUrl = (id: string) => {
    setSelectedUrlId(id);
  };
  
  const handleCloseContent = () => {
    setSelectedUrlId(null);
  };

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
        <UrlList urls={urls} onSelectUrl={handleSelectUrl} />
      )}
      
      {selectedUrlId && (
        <ContentViewer urlId={selectedUrlId} onClose={handleCloseContent} />
      )}
    </div>
  );
};

export default App;
