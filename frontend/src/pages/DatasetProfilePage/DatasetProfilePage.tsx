import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Database, FileSpreadsheet, AlertTriangle, Layers } from 'lucide-react';
import { getDatasetProfile } from '@/services/datasets';
import { DatasetProfileResponse } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { Button, Chip } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';

export function DatasetProfilePage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const [profile, setProfile] = useState<DatasetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadProfile = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDatasetProfile(id, signal);
      setProfile(data);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Dataset profile could not be loaded.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!datasetId) return;
    const controller = new AbortController();
    loadProfile(datasetId, controller.signal);
    return () => controller.abort();
  }, [datasetId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-6 font-mono text-steel-400 animate-pulse">
        <div className="h-4 bg-graphite-700 w-32" />
        <div className="h-10 bg-graphite-700 w-1/2" />
        <div className="h-48 bg-graphite-800" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <ConnectionError
          requestName={`GET /api/datasets/${datasetId}/profile`}
          message={error || 'Dataset not found.'}
          onRetry={() => datasetId && loadProfile(datasetId)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/model-lab"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-400 hover:text-cyan-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Model Lab</span>
        </Link>
        <ProvenanceBadge type="backend-result" subtext="Authentic profile inspection" />
      </div>

      <header className="border-b border-graphite-700 pb-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Chip variant="cyan">CSV Profile</Chip>
              {profile.detected_task && <Chip variant="default">{profile.detected_task}</Chip>}
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-bone-100 truncate">
              {profile.original_filename}
            </h1>
            <p className="font-mono text-xs text-steel-500 mt-1">
              Dataset ID: {profile.dataset_id}
            </p>
          </div>

          <Link to={`/model-lab?dataset=${profile.dataset_id}`}>
            <Button variant="cyan-solid" size="md" className="gap-2">
              <Play className="w-4 h-4" />
              <span>Continue in Model Lab</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 border border-graphite-700 bg-graphite-800/40">
            <div className="text-xs text-steel-500 uppercase">Total Rows</div>
            <div className="text-2xl font-bold text-bone-100 mt-1">
              {profile.row_count.toLocaleString()}
            </div>
          </div>
          <div className="p-4 border border-graphite-700 bg-graphite-800/40">
            <div className="text-xs text-steel-500 uppercase">Columns</div>
            <div className="text-2xl font-bold text-bone-100 mt-1">
              {profile.column_count}
            </div>
          </div>
          <div className="p-4 border border-graphite-700 bg-graphite-800/40">
            <div className="text-xs text-steel-500 uppercase">Duplicate Rows</div>
            <div className="text-2xl font-bold text-bone-100 mt-1">
              {profile.duplicate_rows}
            </div>
          </div>
          <div className="p-4 border border-graphite-700 bg-graphite-800/40">
            <div className="text-xs text-steel-500 uppercase">Target Feature</div>
            <div className="text-sm font-bold text-cyan-400 mt-1 truncate">
              {profile.target_column || 'Not Configured'}
            </div>
          </div>
        </div>
      </header>

      {/* Column Breakdown Table */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
          Column Summaries & Inferred Types
        </h2>

        <div className="overflow-x-auto border border-graphite-700 bg-ink-900">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-graphite-700 bg-graphite-800/60 text-steel-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Column Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Unique</th>
                <th className="p-3">Missing</th>
                <th className="p-3">Min / Max</th>
                <th className="p-3">Mean ± Std</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/50">
              {profile.column_profiles.map((cp) => (
                <tr key={cp.name} className="hover:bg-graphite-800/30">
                  <td className="p-3 font-bold text-bone-100">{cp.name}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 bg-graphite-800 border border-graphite-700 text-steel-400 text-[11px]">
                      {cp.inferred_type}
                    </span>
                  </td>
                  <td className="p-3 text-steel-400">{cp.unique_count}</td>
                  <td className="p-3">
                    {cp.missing_count > 0 ? (
                      <span className="text-orange-500 font-semibold">
                        {cp.missing_count} ({cp.missing_percentage.toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-lime-400">0</span>
                    )}
                  </td>
                  <td className="p-3 text-steel-400">
                    {cp.min !== null && cp.max !== null ? `${cp.min} / ${cp.max}` : '—'}
                  </td>
                  <td className="p-3 text-steel-400">
                    {cp.mean != null && cp.std != null ? `${cp.mean.toFixed(2)} ± ${cp.std.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Raw Preview */}
      <section className="space-y-4 pt-8">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
          Raw Preview Sample
        </h2>
        <div className="overflow-x-auto border border-graphite-700 bg-ink-900">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-graphite-700 bg-graphite-800 text-steel-300">
              <tr>
                {profile.columns.map((col) => (
                  <th key={col} className="p-2.5 font-bold whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/50">
              {profile.preview_rows.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-graphite-800/30">
                  {profile.columns.map((col) => (
                    <td key={col} className="p-2.5 text-steel-400 whitespace-nowrap">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
