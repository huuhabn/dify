'use client';

const builtInTools = [
  {
    id: 'google-search',
    name: 'Google Web Search',
    author: 'Dify Official',
    description: 'Enables agents to query search indices and extract real-time web results.',
    icon: '🔍',
    category: 'Search',
  },
  {
    id: 'python-code',
    name: 'Python Code Execution',
    author: 'Dify Official',
    description: 'Isolated sandbox for running calculations, data transformations, and algorithms.',
    icon: '🐍',
    category: 'Utilities',
  },
  {
    id: 'dall-e',
    name: 'DALL-E Image Generation',
    author: 'OpenAI',
    description: 'Generates high-resolution creative imagery from natural language prompts.',
    icon: '🎨',
    category: 'Image',
  },
  {
    id: 'sql-query',
    name: 'Database SQL Runner',
    author: 'Community',
    description: 'Executes analytical read queries on PostgreSQL, MySQL, and SQLite databases.',
    icon: '🗄️',
    category: 'Database',
  },
];

export default function ToolsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Tools & Plugins
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Supercharge your AI agents with external capabilities, calculators, and API connections.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Tool
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {builtInTools.map((tool) => (
          <div
            key={tool.id}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl border border-gray-100">
                  {tool.icon}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {tool.category}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{tool.name}</h3>
              <p className="text-xs text-blue-600 mt-0.5">by {tool.author}</p>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{tool.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Available
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
