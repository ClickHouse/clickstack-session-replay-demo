/* ═══════════════════════════════════════════════════════════════
   CLICKSTACK INSTRUMENTATION - STEP 2 OF 2
   
   Insert the ClickStack SDK initialization code here:
   
   window.HyperDX.init({
     url: window.CLICKSTACK_CONFIG.endpoint,
     apiKey: window.CLICKSTACK_CONFIG.apiKey,
     service: 'clickhouse-session-replay-demo',
     consoleCapture: true,
     advancedNetworkCapture: true,
   });
   
   See app.instrumented.js for the complete example.
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   END CLICKSTACK INSTRUMENTATION
   
   All code below is normal application logic.
   The SDK automatically captures all interactions with zero
   additional code changes required.
   ═══════════════════════════════════════════════════════════════ */

// =============================================================================
// Application State
// =============================================================================
let bookmarks = [];
let viewedDocs = new Set();
let currentCategory = 'all';

// =============================================================================
// Data - Categories and Documentation Topics
// =============================================================================
const categories = [
  { id: 'all', name: 'All Topics' },
  { id: 'sql', name: 'SQL Reference' },
  { id: 'engines', name: 'Table Engines' },
  { id: 'integrations', name: 'Integrations' },
  { id: 'operations', name: 'Operations' },
  { id: 'optimization', name: 'Optimization' },
];

const docs = [
  {
    id: 1,
    title: 'SELECT Query Syntax',
    category: 'sql',
    description: 'Learn the fundamentals of SELECT queries including JOINs, subqueries, and window functions.',
    code: `SELECT 
    user_id,
    count() AS page_views,
    uniq(session_id) AS sessions
FROM web_analytics
WHERE date >= today() - 7
GROUP BY user_id
ORDER BY page_views DESC
LIMIT 10;`,
    link: 'https://clickhouse.com/docs/en/sql-reference/statements/select'
  },
  {
    id: 2,
    title: 'MergeTree Engine',
    category: 'engines',
    description: 'The most powerful table engine in ClickHouse, optimized for insert-heavy workloads.',
    code: `CREATE TABLE events (
    event_time DateTime,
    user_id UInt32,
    event_type String,
    properties String
)
ENGINE = MergeTree()
ORDER BY (event_time, user_id)
PARTITION BY toYYYYMM(event_time);`,
    link: 'https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree'
  },
  {
    id: 3,
    title: 'Kafka Integration',
    category: 'integrations',
    description: 'Stream data directly from Apache Kafka into ClickHouse for real-time analytics.',
    code: `CREATE TABLE kafka_queue (
    timestamp UInt64,
    message String
)
ENGINE = Kafka
SETTINGS kafka_broker_list = 'localhost:9092',
         kafka_topic_list = 'events',
         kafka_group_name = 'clickhouse',
         kafka_format = 'JSONEachRow';`,
    link: 'https://clickhouse.com/docs/en/engines/table-engines/integrations/kafka'
  },
  {
    id: 4,
    title: 'Materialized Views',
    category: 'optimization',
    description: 'Pre-aggregate data on insert for blazing-fast queries. Essential for high-performance analytics.',
    code: `CREATE MATERIALIZED VIEW daily_stats
ENGINE = SummingMergeTree()
ORDER BY (date, user_id)
AS SELECT
    toDate(timestamp) AS date,
    user_id,
    count() AS events,
    sum(revenue) AS total_revenue
FROM events
GROUP BY date, user_id;`,
    link: 'https://clickhouse.com/docs/en/sql-reference/statements/create/view'
  },
  {
    id: 5,
    title: 'Distributed Tables',
    category: 'operations',
    description: 'Scale ClickHouse horizontally by distributing data across multiple nodes in a cluster.',
    code: `CREATE TABLE events_distributed AS events
ENGINE = Distributed(
    'cluster_name',
    'database_name',
    'events',
    rand()
);`,
    link: 'https://clickhouse.com/docs/en/engines/table-engines/special/distributed'
  },
  {
    id: 6,
    title: 'Array Functions',
    category: 'sql',
    description: 'Powerful array manipulation for working with nested and repeated data structures.',
    code: `SELECT
    arrayMap(x -> x * 2, [1, 2, 3]) AS doubled,
    arrayFilter(x -> x > 2, [1, 2, 3, 4]) AS filtered,
    arrayReduce('sum', [1, 2, 3, 4]) AS total;`,
    link: 'https://clickhouse.com/docs/en/sql-reference/functions/array-functions'
  },
  {
    id: 7,
    title: 'ReplicatedMergeTree',
    category: 'engines',
    description: 'Built-in replication for high availability and data redundancy across multiple nodes.',
    code: `CREATE TABLE events_replicated (
    event_time DateTime,
    user_id UInt32,
    event_type String
)
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/events',
    '{replica}'
)
ORDER BY (event_time, user_id);`,
    link: 'https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replication'
  },
  {
    id: 8,
    title: 'PostgreSQL Integration',
    category: 'integrations',
    description: 'Query PostgreSQL tables directly from ClickHouse or replicate data in real-time.',
    code: `CREATE TABLE postgres_table
ENGINE = PostgreSQL(
    'localhost:5432',
    'database',
    'table',
    'user',
    'password'
);`,
    link: 'https://clickhouse.com/docs/en/engines/table-engines/integrations/postgresql'
  },
  {
    id: 9,
    title: 'Compression Codecs',
    category: 'optimization',
    description: 'Choose the right compression algorithm to minimize storage costs and maximize performance.',
    code: `CREATE TABLE metrics (
    timestamp DateTime CODEC(Delta, ZSTD),
    metric_name LowCardinality(String),
    value Float64 CODEC(Gorilla, ZSTD)
)
ENGINE = MergeTree()
ORDER BY (metric_name, timestamp);`,
    link: 'https://clickhouse.com/docs/en/sql-reference/statements/create/table#column-compression-codecs'
  },
  {
    id: 10,
    title: 'JOIN Performance',
    category: 'optimization',
    description: 'Optimize JOIN queries with proper table ordering and join algorithms.',
    code: `SELECT
    users.name,
    count() AS orders
FROM orders
INNER JOIN users ON orders.user_id = users.id
WHERE orders.date >= today() - 30
GROUP BY users.name
SETTINGS join_algorithm = 'hash';`,
    link: 'https://clickhouse.com/docs/en/sql-reference/statements/select/join'
  },
  {
    id: 11,
    title: 'S3 Integration',
    category: 'integrations',
    description: 'Query data directly from S3 or use S3 as a storage backend for cost-effective cold storage.',
    code: `SELECT *
FROM s3(
    'https://bucket.s3.amazonaws.com/data/*.parquet',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'Parquet'
)
LIMIT 100;`,
    link: 'https://clickhouse.com/docs/en/sql-reference/table-functions/s3'
  },
  {
    id: 12,
    title: 'System Tables',
    category: 'operations',
    description: 'Monitor ClickHouse performance with system tables and metrics.',
    code: `SELECT
    query,
    elapsed,
    memory_usage,
    read_rows
FROM system.query_log
WHERE type = 'QueryFinish'
  AND event_time >= now() - INTERVAL 1 HOUR
ORDER BY elapsed DESC
LIMIT 10;`,
    link: 'https://clickhouse.com/docs/en/operations/monitoring'
  },
];

// =============================================================================
// Render Functions
// =============================================================================
function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = categories.map(cat => `
    <div 
      class="category-chip ${currentCategory === cat.id ? 'active' : ''}" 
      onclick="filterByCategory('${cat.id}')"
    >
      ${cat.name}
    </div>
  `).join('');
  console.log(`Rendered ${categories.length} categories`);
}

function renderDocs() {
  const grid = document.getElementById('docsGrid');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  const filteredDocs = docs.filter(doc => {
    const matchesCategory = currentCategory === 'all' || doc.category === currentCategory;
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (filteredDocs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>No documentation found matching your criteria</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredDocs.map(doc => {
    const isBookmarked = bookmarks.some(b => b.id === doc.id);
    const categoryName = categories.find(c => c.id === doc.category)?.name || doc.category;
    
    return `
      <div class="doc-card">
        <div class="doc-header">
          <div class="doc-category">${categoryName}</div>
          <div class="doc-title">${doc.title}</div>
        </div>
        <div class="doc-description">${doc.description}</div>
        <div class="doc-actions">
          <button class="doc-button btn-primary" onclick="viewDoc(${doc.id})">
            View Example
          </button>
          <button class="doc-button btn-secondary ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark(${doc.id})">
            ${isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  console.log(`Rendered ${filteredDocs.length} documentation cards`);
}

function renderBookmarks() {
  const section = document.getElementById('bookmarksSection');
  const list = document.getElementById('bookmarksList');

  if (bookmarks.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = bookmarks.map(doc => `
    <div class="bookmark-card">
      <div class="bookmark-info">
        <div class="bookmark-title">${doc.title}</div>
        <div class="bookmark-meta">${doc.description}</div>
      </div>
      <button class="doc-button btn-primary" onclick="viewDoc(${doc.id})">
        View
      </button>
    </div>
  `).join('');
}

function updateStats() {
  document.getElementById('totalDocs').textContent = docs.length;
  document.getElementById('viewedDocs').textContent = viewedDocs.size;
  document.getElementById('bookmarkedDocs').textContent = bookmarks.length;
}

// =============================================================================
// Category Filter
// =============================================================================
function filterByCategory(categoryId) {
  currentCategory = categoryId;
  console.log(`Filtered by category: ${categoryId}`);
  renderCategories();
  renderDocs();
}

// =============================================================================
// Documentation Viewer
// =============================================================================
function viewDoc(docId) {
  const doc = docs.find(d => d.id === docId);
  if (!doc) return;

  viewedDocs.add(docId);
  updateStats();
  
  console.log(`Viewing documentation: ${doc.title}`);

  document.getElementById('modalHeader').innerHTML = `
    <div>
      <div class="modal-title">${doc.title}</div>
      <div class="modal-subtitle">${doc.description}</div>
    </div>
    <button class="close-button" onclick="closeModal()">Close</button>
  `;

  document.getElementById('modalBody').innerHTML = `
    <pre><code>${escapeHtml(doc.code)}</code></pre>
  `;

  document.getElementById('modalFooter').innerHTML = `
    <a href="${doc.link}" target="_blank" class="external-link">
      Read full documentation →
    </a>
  `;
  
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  console.log('Closed code example');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// Bookmark Management
// =============================================================================
function toggleBookmark(docId) {
  const doc = docs.find(d => d.id === docId);
  if (!doc) return;

  const existingIndex = bookmarks.findIndex(b => b.id === docId);
  
  if (existingIndex > -1) {
    bookmarks.splice(existingIndex, 1);
    console.log(`Removed bookmark: ${doc.title}`);
  } else {
    bookmarks.push(doc);
    console.log(`Added bookmark: ${doc.title}`);
  }

  updateStats();
  renderDocs();
  renderBookmarks();
}

// =============================================================================
// Event Handlers
// =============================================================================
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value;
  console.log(`Search query: "${searchTerm}"`);
  renderDocs();
});

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
});

// =============================================================================
// Initialize Application
// =============================================================================
renderCategories();
renderDocs();
updateStats();

console.log(`✅ Session Replay Demo ready with ${docs.length} topics`);