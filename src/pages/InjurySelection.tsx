import { useState } from 'react';
import { INJURIES } from '../data/injuryPlans';
import { type InjuryType } from '../types/injuries';
import '../styles/InjurySelection.css';

interface InjurySelectionProps {
  onSelectInjury: (injuryType: InjuryType) => void;
  onBack: () => void;
}

export default function InjurySelection({ onSelectInjury, onBack }: InjurySelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'knee' | 'ankle'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const injuries = Object.values(INJURIES);

  const filteredInjuries = injuries.filter(injury => {
    const matchesCategory = selectedCategory === 'all' || injury.category === selectedCategory;
    const matchesSearch = injury.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         injury.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="injury-selection-page">
      <div className="injury-selection-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Select Your Injury</h1>
        <p className="subtitle">Choose your specific injury to get a personalized rehabilitation plan</p>
      </div>

      <div className="injury-selection-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search injuries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Injuries
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'knee' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('knee')}
          >
            🦵 Knee
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'ankle' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ankle')}
          >
            🦶 Ankle
          </button>
        </div>
      </div>

      {/* Group by category for better organization */}
      {selectedCategory === 'all' ? (
        <>
          {/* Knee Injuries Section */}
          <div className="injury-category-section">
            <h2 className="category-title">
              <span className="category-icon">🦵</span>
              Knee Injuries
            </h2>
            <div className="injuries-grid">
              {filteredInjuries
                .filter(injury => injury.category === 'knee')
                .map((injury) => (
                  <div
                    key={injury.id}
                    className="injury-card"
                    onClick={() => onSelectInjury(injury.id)}
                  >
                    <div className="injury-card-header">
                      <span className="injury-icon">{injury.icon}</span>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(injury.severity) }}
                      >
                        {injury.severity}
                      </span>
                    </div>

                    <h3>{injury.name}</h3>
                    <p className="injury-description">{injury.description}</p>

                    <div className="injury-meta">
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{injury.recoveryTime}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">👥</span>
                        <span>{injury.commonIn[0]}</span>
                      </div>
                    </div>

                    <button className="select-injury-btn">
                      Select & Start Program →
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Ankle Injuries Section */}
          <div className="injury-category-section">
            <h2 className="category-title">
              <span className="category-icon">🦶</span>
              Ankle Injuries
            </h2>
            <div className="injuries-grid">
              {filteredInjuries
                .filter(injury => injury.category === 'ankle')
                .map((injury) => (
                  <div
                    key={injury.id}
                    className="injury-card"
                    onClick={() => onSelectInjury(injury.id)}
                  >
                    <div className="injury-card-header">
                      <span className="injury-icon">{injury.icon}</span>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(injury.severity) }}
                      >
                        {injury.severity}
                      </span>
                    </div>

                    <h3>{injury.name}</h3>
                    <p className="injury-description">{injury.description}</p>

                    <div className="injury-meta">
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{injury.recoveryTime}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">👥</span>
                        <span>{injury.commonIn[0]}</span>
                      </div>
                    </div>

                    <button className="select-injury-btn">
                      Select & Start Program →
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        /* Filtered view - single grid */
        <div className="injuries-grid">
          {filteredInjuries.map((injury) => (
            <div
              key={injury.id}
              className="injury-card"
              onClick={() => onSelectInjury(injury.id)}
            >
              <div className="injury-card-header">
                <span className="injury-icon">{injury.icon}</span>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(injury.severity) }}
                >
                  {injury.severity}
                </span>
              </div>

              <h3>{injury.name}</h3>
              <p className="injury-description">{injury.description}</p>

              <div className="injury-meta">
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{injury.recoveryTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span>{injury.commonIn[0]}</span>
                </div>
              </div>

              <button className="select-injury-btn">
                Select & Start Program →
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredInjuries.length === 0 && (
        <div className="no-results">
          <p>No injuries found matching your search.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
