import React, { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import { cities, connections } from './data/graphData';
import { dijkstra } from './algorithms/dijkstra';
import './App.css';

const App = () => {
  const [selectedCities, setSelectedCities] = useState([]);
  const [path, setPath] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState('km');

  const buildGraph = useCallback(() => {
    const graph = {};
    cities.forEach(city => {
      graph[city] = [];
    });
    connections.forEach(({ from, to, distance }) => {
      graph[from].push({ node: to, weight: distance });
      graph[to].push({ node: from, weight: distance });
    });
    return graph;
  }, []);

  const getPath = useCallback((previous, end) => {
    const path = [];
    let currentNode = end;
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
    }
    return path;
  }, []);

  const calculateTime = useCallback((distance) => {
    const averageSpeed = 50; // Average speed in mph
    return (distance / averageSpeed).toFixed(2);
  }, []);

  const handlePlanTrip = useCallback(() => {
    const validCities = selectedCities.filter(city => city !== '');

    if (validCities.length > 1) {
      const graph = buildGraph();
      let fullPath = [validCities[0]];
      let totalDist = 0;

      for (let i = 0; i < validCities.length - 1; i++) {
        const { distances, previous } = dijkstra(graph, validCities[i]);
        const segmentPath = getPath(previous, validCities[i + 1]);
        fullPath = [...fullPath, ...segmentPath.slice(1)];
        totalDist += distances[validCities[i + 1]] || 0;
      }

      setPath(fullPath);
      setTotalDistance(totalDist);
      setTotalTime(calculateTime(totalDist));
    } else {
      setPath([]);
      setTotalDistance(0);
      setTotalTime(0);
    }
  }, [selectedCities, buildGraph, getPath, calculateTime]);

  useEffect(() => {
    handlePlanTrip();
  }, [handlePlanTrip]);

  const handleAddCity = useCallback(() => {
    setSelectedCities(prev => [...prev, '']);
  }, []);

  const handleRemoveCity = useCallback((index) => {
    setSelectedCities(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCityChange = useCallback((index, newCity) => {
    setSelectedCities(prev => {
      const newCities = [...prev];
      newCities[index] = newCity;
      return newCities;
    });
  }, []);

  const handleShuffleCities = useCallback((index, direction) => {
    setSelectedCities(prev => {
      const newCities = [...prev];
      const [movedCity] = newCities.splice(index, 1);
      newCities.splice(index + direction, 0, movedCity);
      return newCities;
    });
  }, []);

  const convertToMiles = useCallback((km) => {
    const milesPerKm = 0.621371;
    return (km * milesPerKm).toFixed(2);
  }, []);

  const handleUnitToggle = useCallback(() => {
    setUnit(prev => prev === 'miles' ? 'km' : 'miles');
  }, []);

  const handleDarkModeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const getDisplayDistance = useCallback(() => {
    return unit === 'miles' ? convertToMiles(totalDistance) : totalDistance.toFixed(2);
  }, [unit, totalDistance, convertToMiles]);

  return (
    <div className={`App ${isDarkMode ? 'dark' : ''}`}>
      <header>
        <div className="header-content">
          <h1>Bay Area Trip Planner</h1>
          <button onClick={handleDarkModeToggle} className="mode-toggle" aria-label="Toggle dark mode">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main>
        <div className="content-wrapper">
          <section className="controls">
            <h2>Plan Your Trip</h2>
            {selectedCities.map((city, index) => (
              <div key={index} className="city-selection">
                <select value={city} onChange={(e) => handleCityChange(index, e.target.value)}>
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <div className="button-group">
                  <button onClick={() => handleRemoveCity(index)} aria-label="Remove city">
                    <span className="material-icons">remove</span>
                  </button>
                  {index > 0 && (
                    <button onClick={() => handleShuffleCities(index, -1)} aria-label="Move city up">
                      <span className="material-icons">arrow_upward</span>
                    </button>
                  )}
                  {index < selectedCities.length - 1 && (
                    <button onClick={() => handleShuffleCities(index, 1)} aria-label="Move city down">
                      <span className="material-icons">arrow_downward</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={handleAddCity} className="add-city">
              <span className="material-icons">add</span> Add City
            </button>
          </section>
          <section className="info">
            <h2>Trip Details</h2>
            {totalDistance > 0 ? (
              <>
                <div className="info-item">
                  <span className="info-label">Total Distance:</span>
                  <span className="info-value">{getDisplayDistance()} {unit}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estimated Time:</span>
                  <span className="info-value">{totalTime} hours</span>
                </div>
                <button onClick={handleUnitToggle} className="unit-toggle">
                  Convert to {unit === 'miles' ? 'km' : 'miles'}
                </button>
              </>
            ) : (
              <p>Select at least two cities to plan your trip.</p>
            )}
          </section>
        </div>
        <section className="map-container">
          <Map path={path} />
        </section>
      </main>
      <footer>
        <div className="footer-content">
          <p>Plan your trip around the Bay Area!</p>
        </div>
      </footer>
    </div>
  );
};

export default App;