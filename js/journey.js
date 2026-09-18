/* =========================================================
   VizionIQ demo · guided journey (order of the walkthrough)
   ========================================================= */
VQ.journey([
  { id: 'home', label: 'Command View', screens: [['home/main', 'Home · Corridor Command View']] },
  { id: 'live', label: 'Live View', screens: [['live/grid', 'Live View · Grid'], ['live/map', 'Live View · Map']] },
  { id: 'incidents', label: 'Incidents', screens: [['incidents/overview', 'Incidents · Overview'], ['incidents/feed', 'Incidents · Live Feed'], ['incidents/hotspots', 'Incidents · Hotspots & Patterns'], ['incidents/response', 'Incidents · Response Performance']] },
  { id: 'dive', label: 'Incident Deep Dive', screens: [['incident/INC-2040/overview', 'Accident · Overview'], ['incident/INC-2040/evidence', 'Accident · Evidence & Timeline'], ['incident/INC-2040/impact', 'Accident · Traffic Impact'], ['incident/INC-2040/rootcause', 'Accident · Root Cause'], ['incident/INC-2040/response', 'Accident · Response'], ['incident/INC-2040/related', 'Accident · Related Incidents']] },
  { id: 'events', label: 'More Events', screens: [['incident/INC-2039/overview', 'Stalled Vehicle'], ['incident/INC-2033/overview', 'Wrong-Way Vehicle'], ['incident/INC-2038/rootcause', 'Flooding · Root Cause'], ['incident/INC-2041/overview', 'Vehicle Fire'], ['incident/INC-2034/overview', 'Debris on Road'], ['incident/INC-2032/rootcause', 'Animal on Highway · Root Cause']] },
  { id: 'traffic', label: 'Traffic', screens: [['traffic/live', 'Traffic · Live'], ['traffic/travel', 'Traffic · Travel Time'], ['traffic/heatmap', 'Traffic · Speed Heatmap'], ['traffic/forecast', 'Traffic · Congestion Forecast'], ['traffic/performance', 'Traffic · Corridor Performance']] },
  { id: 'toll', label: 'Toll & Revenue', screens: [['toll/overview', 'Toll · Overview'], ['toll/queue', 'Toll · Plaza Queue'], ['toll/leakage', 'Toll · Revenue Leakage'], ['toll/review', 'Toll · Transaction Review'], ['toll/patterns', 'Toll · Leakage Patterns']] },
  { id: 'assets', label: 'Assets', screens: [['assets/overview', 'Assets · Overview'], ['assets/map', 'Assets · Asset Map'], ['assets/alerts', 'Assets · Alerts'], ['assets/maintenance', 'Assets · Maintenance'], ['assets/lifecycle', 'Assets · Lifecycle'], ['assets/reports', 'Assets · Reports']] },
  { id: 'insights', label: 'Insights', screens: [['analytics/safety', 'Analytics · Safety Hotspots'], ['analytics/bottlenecks', 'Analytics · Bottlenecks'], ['analytics/health', 'Analytics · Corridor Health'], ['usecases/main', 'Use Cases']] },
  { id: 'admin', label: 'Reports & Admin', screens: [['reports/main', 'Reports'], ['admin/users', 'Administration · Users & Roles'], ['admin/rules', 'Administration · Alert Rules'], ['admin/system', 'Administration · System']] },
]);
