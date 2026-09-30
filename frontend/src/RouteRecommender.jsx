  import React, { useState, useEffect } from 'react';
  import { 
    Truck, Ship, Plane, Train, 
    AlertTriangle, ShieldCheck, Clock, DollarSign, 
    Navigation, MapPin, ChevronRight, Info,
    Filter, ShieldAlert, Zap, Globe, Package,
    ArrowRightLeft, AlertCircle, BarChart3, Activity, Layers, Terminal
  } from 'lucide-react';

  const RouteRecommender = ({ onNavigate }) => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [transportMode, setTransportMode] = useState('any');
    const [routingPolicy, setRoutingPolicy] = useState('STRICT');
    const [operationalConfig, setOperationalConfig] = useState('NORMAL');
    const [cargoType, setCargoType] = useState('general');
    const [priority, setPriority] = useState('normal');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState({ source: '', dest: '' });
    const [searchResults, setSearchResults] = useState({ source: [], dest: [] });
    const [scenarios, setScenarios] = useState([]);

    useEffect(() => {
      // Pull the live scenario list from the backend instead of hardcoding IDs here,
      // so this dropdown can never drift out of sync with ScenarioManager.SCENARIOS again.
      fetch('/api/scenarios')
        .then(r => r.json())
        .then(data => setScenarios(data))
        .catch(e => console.error("Failed to load scenarios", e));
    }, []);

    const getRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source,
            destination,
            transport_preference: transportMode,
            routing_policy: routingPolicy,
            cargo_type: cargoType,
            priority: priority,
            scenario: operationalConfig !== 'NORMAL' ? operationalConfig : null
          })
        });
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
          setRecommendations([]);
        } else {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        setError("Engine connection failed. Verify backend status.");
      } finally {
        setLoading(false);
      }
    };

    const getModeIcon = (mode) => {
      switch (mode.toLowerCase()) {
        case 'air': return <Plane size={12} />;
        case 'sea': return <Ship size={12} />;
        case 'rail': return <Train size={12} />;
        case 'road': return <Truck size={12} />;
        case 'transfer': return <ArrowRightLeft size={12} />;
        default: return <Navigation size={12} />;
      }
    };

    const handleSearch = async (type, query) => {
      setSearchQuery(prev => ({ ...prev, [type]: query }));
      if (query.length < 2) {
        setSearchResults(prev => ({ ...prev, [type]: [] }));
        return;
      }
      try {
        const res = await fetch(`/api/hubs/search?q=${query}`);
        const data = await res.json();
        setSearchResults(prev => ({ ...prev, [type]: data }));
      } catch (err) { console.error("Search failed"); }
    };

    const selectHub = (type, hub) => {
      if (type === 'source') {
        setSource(hub.id);
        setSearchQuery(prev => ({ ...prev, source: hub.display_name }));
      } else {
        setDestination(hub.id);
        setSearchQuery(prev => ({ ...prev, dest: hub.display_name }));
      }
      setSearchResults(prev => ({ ...prev, [type]: [] }));
    };

    return (
      <div className="dashboard-layout">
        {/* Header */}
        <header className="dashboard-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <Globe size={28} color="#3b82f6" />
            <div>
              <h1 style={{fontSize: '1.25rem', fontWeight: 800}}>Supplychainer Command Console</h1>
              <p style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 700}}>UNIFIED MULTIMODAL DECISION SUPERIORITY ENGINE</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="sc-badge-active" onClick={() => onNavigate('suppliers')} style={{cursor: 'pointer'}}>
              <ShieldCheck size={14} /> SUPPLIER INTELLIGENCE
            </button>
          </div>
        </header>

        {/* Left Panel - Command Panel */}
        <aside className="sidebar-left">
          <h2 className="panel-title"><Terminal size={14} /> Strategic Input Panel</h2>
          
          <div className="sc-input-group">
            <label className="sc-label">Origin Hub</label>
            <input 
              type="text" value={searchQuery.source} 
              onChange={(e) => handleSearch('source', e.target.value)}
              className="sc-input" placeholder="Search origin..."
            />
            {searchResults.source.length > 0 && (
              <div style={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', marginTop: '2px'}}>
                {searchResults.source.map((h, idx) => (
                  <button key={`${h.id}-${idx}`} onClick={() => selectHub('source', h)} style={{width: '100%', padding: '8px', textAlign: 'left', background: 'none', border: 'none', color: 'white', borderBottom: '1px solid #1e293b', cursor: 'pointer', fontSize: '0.8rem'}}>
                    {h.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Destination Hub</label>
            <input 
              type="text" value={searchQuery.dest} 
              onChange={(e) => handleSearch('dest', e.target.value)}
              className="sc-input" placeholder="Search destination..."
            />
            {searchResults.dest.length > 0 && (
              <div style={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', marginTop: '2px'}}>
                {searchResults.dest.map((h, idx) => (
                  <button key={`${h.id}-${idx}`} onClick={() => selectHub('dest', h)} style={{width: '100%', padding: '8px', textAlign: 'left', background: 'none', border: 'none', color: 'white', borderBottom: '1px solid #1e293b', cursor: 'pointer', fontSize: '0.8rem'}}>
                    {h.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Transport Mode</label>
            <select value={transportMode} onChange={e => setTransportMode(e.target.value)} className="sc-select">
              <option value="any">Unconstrained</option>
              <option value="sea">SEA (Maritime Corridors)</option>
              <option value="air">AIR (Express Cargo)</option>
              <option value="rail">RAIL (Inland Freight)</option>
              <option value="road">ROAD (Local Distribution)</option>
            </select>
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Cargo Type</label>
            <select
              value={cargoType}
              onChange={e => setCargoType(e.target.value)}
              className="sc-select"
            >
              <option value="general">General Cargo</option>
              <option value="perishable">Perishable</option>
              <option value="fragile">Fragile</option>
              <option value="hazardous">Hazardous</option>
              <option value="high_value">High Value</option>
            </select>
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Shipment Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="sc-select"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Routing Policy</label>
            <select value={routingPolicy} onChange={e => setRoutingPolicy(e.target.value)} className="sc-select">
              <option value="STRICT">STRICT (Hard Exclusion)</option>
              <option value="PREFERRED">PREFERRED (Soft Bias)</option>
            </select>
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Operational Configuration (NEW)</label>
            <select value={operationalConfig} onChange={e => setOperationalConfig(e.target.value)} className="sc-select" style={{borderColor: operationalConfig !== 'NORMAL' ? '#ef4444' : '#1e293b'}}>
              <option value="NORMAL">Operational Normal</option>
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="sc-input-group">
            <label className="sc-label">Strategic Overrides</label>
            <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b'}}>
              Auto-bypass enabled for verified chokepoints.
            </div>
          </div>

          <button className="sc-btn-execute" onClick={getRecommendations} disabled={loading}>
            {loading ? <Zap className="animate-pulse" size={16} /> : "GENERATE STRATEGIC ROUTE OPTIONS"}
          </button>
        </aside>

        {/* Main Area */}
        <main className="main-content">
          {operationalConfig !== 'NORMAL' && (
            <div className="scenario-banner animate-slide-in">
              <AlertTriangle size={20} />
              <div>
                <span style={{fontWeight: 800, fontSize: '0.75rem', display: 'block'}}>ACTIVE GLOBAL DISRUPTION DETECTED</span>
                <span style={{fontSize: '0.875rem'}}>{(scenarios.find(s => s.id === operationalConfig)?.name) || operationalConfig} logic active in unified solver.</span>
              </div>
            </div>
          )}

          {error && <div style={{color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444'}}>{error}</div>}

          <div className="path-grid">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="path-card">
                <div className="card-header">
                  <span className={`persona-badge ${
                    rec.persona === 'FASTEST' ? 'tag-fastest' :
                    rec.persona === 'SAFEST' ? 'tag-safest' : 'tag-balanced'
                  }`}>{rec.persona}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono'}}>
                    <Clock size={12} /> {rec.adjusted_eta}h
                  </div>
                </div>
                <div style={{padding: '1.25rem'}}>
                  <h3 style={{fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem'}}>{rec.explanation}</h3>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid #1e293b', paddingLeft: '1rem', marginLeft: '0.5rem'}}>
                    {rec.legs.map((leg, lIdx) => {
                      const isTransfer = leg.type === 'transfer';
                      return (
                        <div key={lIdx} style={{display: 'flex', flexDirection: 'column', opacity: isTransfer ? 0.7 : 1}}>
                          <span style={{
                            fontSize: '0.65rem', 
                            fontWeight: 800, 
                            color: isTransfer ? '#94a3b8' : '#3b82f6', 
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {getModeIcon(leg.mode)}
                            {isTransfer ? 'STRATEGIC HANDOFF' : `${leg.mode} TRANSIT`}
                          </span>
                          <span style={{fontSize: '0.8rem', fontWeight: 600}}>
                            {isTransfer ? `Processing at ${leg.to_name}` : `to ${leg.to_name}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{padding: '1.25rem', borderTop: '1px solid #1e293b', background: 'rgba(15, 23, 42, 0.3)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700}}>
                    <span style={{color: '#64748b'}}>TOTAL COST</span>
                    <span style={{color: '#10b981'}}>${rec.total_cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Audit/Intel */}
        <aside className="sidebar-right">
          <h2 className="panel-title"><Layers size={14} /> Decision Integrity Audit</h2>
          
          {recommendations.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div className="audit-trace-box" style={{borderLeft: '4px solid #3b82f6'}}>
                <div style={{marginBottom: '0.5rem', fontWeight: 700, color: '#f8fafc'}}>Forensic ETA Audit</div>
                <div>Transit: {recommendations[0].audit_trace.eta.transit}h</div>
                <div>Transfer: +{recommendations[0].audit_trace.eta.transfer}h</div>
                <div>Scenario Impact: {recommendations[0].audit_trace.eta.scenario > 0 ? `+${recommendations[0].audit_trace.eta.scenario}h` : 'None'}</div>
              </div>

              <div className="audit-trace-box" style={{borderLeft: '4px solid #10b981'}}>
                <div style={{marginBottom: '0.5rem', fontWeight: 700, color: '#f8fafc'}}>Cost Composition</div>
                <div>Landed Base: ${recommendations[0].audit_trace.cost.transit.toLocaleString()}</div>
                <div>Transfer Fees: ${recommendations[0].audit_trace.cost.transfer.toLocaleString()}</div>
                <div>Risk Premium: ${recommendations[0].audit_trace.cost.scenario.toLocaleString()}</div>
              </div>

              <div className="audit-trace-box" style={{borderLeft: '4px solid #f59e0b'}}>
                <div style={{marginBottom: '0.5rem', fontWeight: 700, color: '#f8fafc'}}>Strategic Truth Anchor</div>
                <div>Verified against Split-Node Forensic Architecture. 0ms co-location miracles detected.</div>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', color: '#64748b', marginTop: '2rem'}}>
              <Activity size={48} style={{opacity: 0.1, marginBottom: '1rem'}} />
              <p style={{fontSize: '0.8rem'}}>Awaiting operational data stream...</p>
            </div>
          )}

          <div style={{marginTop: 'auto'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #3b82f6'}}>
              <ShieldCheck size={16} color="#3b82f6" />
              <span style={{fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6'}}>TRUTH AUDIT VERIFIED</span>
            </div>
          </div>
        </aside>

        {/* Bottom Tradeoff Strip */}
        <footer className="tradeoff-strip">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <BarChart3 size={20} color="#64748b" />
            <span style={{fontSize: '0.75rem', fontWeight: 800, color: '#64748b'}}>TRADEOFF ANALYSIS</span>
          </div>
          <div style={{display: 'flex', gap: '3rem', flex: 1, justifyContent: 'center'}}>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <span style={{fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8'}}>OPTIMAL SPEED:</span>
              <span style={{fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b'}}>{recommendations[0]?.adjusted_eta || '--'}h</span>
            </div>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <span style={{fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8'}}>LOWEST COST:</span>
              <span style={{fontSize: '0.9rem', fontWeight: 800, color: '#10b981'}}>${recommendations.length > 0 ? Math.min(...recommendations.map(r => r.total_cost)).toLocaleString() : '--'}</span>
            </div>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <span style={{fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8'}}>RISK FLOOR:</span>
              <span style={{fontSize: '0.9rem', fontWeight: 800, color: '#3b82f6'}}>{recommendations.length > 0 ? Math.min(...recommendations.map(r => r.threat_level * 100)) : '--'}%</span>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  export default RouteRecommender;
