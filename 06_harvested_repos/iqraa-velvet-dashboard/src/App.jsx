import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

const apiService = {
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      return await response.json();
    } catch (error) {
      return null;
    }
  },
  search: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      return await response.json();
    } catch (error) {
      return { results: [], total: 0 };
    }
  }
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  const [filters, setFilters] = useState({
    sourceType: 'all',
    dateFrom: '',
    dateTo: '',
    language: 'all',
    sortBy: 'relevance'
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await apiService.search(searchQuery, filters);
      setResults(data.results || []);
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <div className="logo-text">
              <h1>منصة إقرأ</h1>
              <span className="logo-subtitle">البحث في التراث الإسلامي</span>
            </div>
          </div>
          
          <nav className="nav-tabs">
            <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 البحث</button>
            <button className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>📖 المكتبة</button>
            <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 التحليلات</button>
          </nav>
        </div>
      </header>

      <main className="main">
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-info"><span className="stat-number">600M+</span><span className="stat-label">مصدر أكاديمي</span></div></div>
            <div className="stat-card"><div className="stat-icon">📜</div><div className="stat-info"><span className="stat-number">4,300+</span><span className="stat-label">نص تراثي</span></div></div>
            <div className="stat-card"><div className="stat-icon">🔗</div><div className="stat-info"><span className="stat-number">15+</span><span className="stat-label">قاعدة بيانات</span></div></div>
            <div className="stat-card"><div className="stat-icon">🤖</div><div className="stat-info"><span className="stat-number">14</span><span className="stat-label">وكيل ذكي</span></div></div>
          </div>
        </section>

        <section className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <input type="text" className="search-input" placeholder="ابحث في ملايين المصادر الأكاديمية والنصوص التراثية..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} dir="rtl" />
              <button type="submit" className="search-button" disabled={loading}>{loading ? '⏳' : '🔍 بحث'}</button>
            </div>

            <button type="button" className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? '▲ إخفاء الخيارات' : '▼ بحث متقدم'}
            </button>

            {showAdvanced && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>نوع المصدر:</label>
                  <select value={filters.sourceType} onChange={(e) => updateFilter('sourceType', e.target.value)}>
                    <option value="all">جميع المصادر</option>
                    <option value="manuscripts">المخطوطات</option>
                    <option value="books">الكتب المطبوعة</option>
                    <option value="articles">المقالات العلمية</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>الفترة الزمنية:</label>
                  <div className="date-range">
                    <input type="text" placeholder="من (700)" value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
                    <span>—</span>
                    <input type="text" placeholder="إلى (1500)" value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
                  </div>
                </div>
                <div className="filter-group">
                  <label>اللغة:</label>
                  <select value={filters.language} onChange={(e) => updateFilter('language', e.target.value)}>
                    <option value="all">جميع اللغات</option>
                    <option value="ar">العربية</option>
                    <option value="en">الإنجليزية</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>الترتيب:</label>
                  <select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}>
                    <option value="relevance">الأكثر صلة</option>
                    <option value="date_desc">الأحدث أولاً</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </section>

        <section className="results-section">
          {loading && <div className="loading-state"><div className="loading-animation">🔄</div><p>جاري البحث...</p></div>}
          
          {!loading && results.length > 0 && (
            <div className="results-list">
              {results.map((result, index) => (
                <article key={index} className="result-card">
                  <h3>{result.title}</h3>
                  {result.author && <p className="result-author">✍️ {result.author}</p>}
                  {result.snippet && <p className="result-snippet">{result.snippet}</p>}
                </article>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && !searchQuery && (
            <div className="welcome-state">
              <div className="welcome-icon">📚</div>
              <h2>مرحباً بك في منصة إقرأ</h2>
              <p>ابحث في أكثر من 600 مليون مصدر أكاديمي وتراثي</p>
              <div className="quick-buttons">
                <button onClick={() => setSearchQuery('ابن تيمية')}>ابن تيمية</button>
                <button onClick={() => setSearchQuery('الغزالي')}>الغزالي</button>
                <button onClick={() => setSearchQuery('ابن رشد')}>ابن رشد</button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 منصة إقرأ - جميع الحقوق محفوظة</p>
        <p className="footer-dua">اللهم اجعله خالصاً لوجهك الكريم 🤲</p>
      </footer>
    </div>
  );
}

export default App;
