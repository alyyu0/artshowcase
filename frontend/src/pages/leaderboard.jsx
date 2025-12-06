import { useState, useEffect } from 'react';
import { Heart, Award } from 'lucide-react';
import NavigationBar from './navbar';
import '../styles/leaderboard.css';

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' or 'artworks'
  const [timePeriod, setTimePeriod] = useState('alltime'); // 'alltime', 'year', 'month'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab, timePeriod, year, month]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let endpoint = '';

      if (timePeriod === 'month') {
        endpoint = `/api/leaderboard/${activeTab}/month/${month}/${year}`;
      } else if (timePeriod === 'year') {
        endpoint = `/api/leaderboard/${activeTab}/year/${year}`;
      } else {
        endpoint = `/api/leaderboard/${activeTab}/alltime`;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  return (
    <div className="cream-background">
      <NavigationBar />

      <main className="leaderboard-main">
        <section className="leaderboard-header">
          <div className="leaderboard-title-section">
            <Award size={40} color="#E89B96" />
            <h1 className="leaderboard-title">Leaderboard</h1>
            <p className="leaderboard-subtitle">See who's creating the best art!</p>
          </div>

          {/* Tabs */}
          <div className="leaderboard-tabs">
            <button
              onClick={() => setActiveTab('artists')}
              className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
            >
              Top Artists
            </button>
            <button
              onClick={() => setActiveTab('artworks')}
              className={`tab-btn ${activeTab === 'artworks' ? 'active' : ''}`}
            >
              Top Artworks
            </button>
          </div>

          {/* Time Period Filters */}
          <div className="time-filters">
            <button
              onClick={() => setTimePeriod('alltime')}
              className={`filter-btn ${timePeriod === 'alltime' ? 'active' : ''}`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimePeriod('year')}
              className={`filter-btn ${timePeriod === 'year' ? 'active' : ''}`}
            >
              By Year
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`filter-btn ${timePeriod === 'month' ? 'active' : ''}`}
            >
              By Month
            </button>
          </div>

          {/* Year/Month Selectors */}
          {timePeriod !== 'alltime' && (
            <div className="date-selectors">
              {timePeriod === 'year' && (
                <select 
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="selector"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}

              {timePeriod === 'month' && (
                <>
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="selector"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="selector"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
        </section>

        {/* Leaderboard List */}
        <section className="leaderboard-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : leaderboardData.length > 0 ? (
            leaderboardData.map((item, index) => (
              <div key={index} className="leaderboard-item">
                <div className="rank">
                  {getMedalEmoji(index) || `#${index + 1}`}
                </div>

                <div className="item-content">
                  {activeTab === 'artists' ? (
                    <>
                      <img
                        src={item.profile_picture || 'https://via.placeholder.com/60'}
                        alt={item.username}
                        className="profile-pic"
                      />
                      <div className="info">
                        <h3>@{item.username}</h3>
                        <p className="bio">{item.bio || 'No bio'}</p>
                        <div className="stats">
                          <span>{item.artwork_count} artworks</span>
                          <span className="likes">
                            <Heart size={14} /> {item.total_likes} likes
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={item.image_url || 'https://via.placeholder.com/100'}
                        alt={item.title}
                        className="artwork-img"
                      />
                      <div className="info">
                        <h3>{item.title}</h3>
                        <p className="artist">by @{item.username}</p>
                        <div className="stats">
                          <span className="likes">
                            <Heart size={14} /> {item.total_likes} likes
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>No data available for this period</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Leaderboard;