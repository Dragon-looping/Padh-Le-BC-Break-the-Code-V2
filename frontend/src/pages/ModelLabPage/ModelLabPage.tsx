import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Play,
  Sliders,
  Database,
  ArrowRight,
  Info,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  uploadDataset,
  getDatasetProfile,
  configureDataset,
  getDatasets,
  getSampleDatasets,
  loadSampleDataset,
} from '@/services/datasets';
import { getModels, recommendModels } from '@/services/models';
import { createExperiment } from '@/services/experiments';
import {
  DatasetProfileResponse,
  DatasetConfigureResponse,
  ModelInfo,
  ModelRecommendationResponse,
  SampleDatasetInfo,
  AppError,
} from '@/types/api';
import { Button, Chip, Callout } from '@/design-system/primitives';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';
import { formatBytes } from '@/lib/formatters';

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function ModelLabPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Stepper state (1: Upload, 2: Profile & Target, 3: Models & Config, 4: Running)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Sample datasets state
  const [sampleDatasets, setSampleDatasets] = useState<SampleDatasetInfo[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleLoadError, setSampleLoadError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<AppError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dataset & Profile state
  const datasetIdFromUrl = searchParams.get('dataset');
  const [datasetId, setDatasetId] = useState<string | null>(datasetIdFromUrl);
  const [profile, setProfile] = useState<DatasetProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<AppError | null>(null);

  // Target configuration state (Explicit selection, no default target column)
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('');
  const [configuring, setConfiguring] = useState(false);
  const [configResponse, setConfigResponse] = useState<DatasetConfigureResponse | null>(null);
  const [configError, setConfigError] = useState<AppError | null>(null);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<ModelRecommendationResponse | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Hyperparameters & Split Settings
  const [testSize, setTestSize] = useState<number>(0.2);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [priority, setPriority] = useState<'performance' | 'speed' | 'interpretability' | 'balanced'>('performance');

  // Experiment Execution
  const [experimentRunning, setExperimentRunning] = useState(false);
  const [experimentError, setExperimentError] = useState<AppError | null>(null);
  const [runStatusText, setRunStatusText] = useState<string>('Initializing experiment pipeline...');

  // Load sample datasets catalog on mount
  useEffect(() => {
    let mounted = true;
    setLoadingSamples(true);
    getSampleDatasets()
      .then((res) => {
        if (mounted) setSampleDatasets(res.samples);
      })
      .catch((err) => {
        console.warn('Failed to load sample datasets catalog:', err);
      })
      .finally(() => {
        if (mounted) setLoadingSamples(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectSample = async (sample: SampleDatasetInfo) => {
    setLoadingSampleId(sample.id);
    setSampleLoadError(null);
    try {
      const res = await loadSampleDataset(sample.id);
      setSelectedTarget(sample.target_column);
      setTaskType(sample.task_type);
      setDatasetId(res.dataset_id);
    } catch (err: any) {
      setSampleLoadError(err.message || 'Failed to load sample dataset.');
      setLoadingSampleId(null);
    }
  };

  // Sync datasetId with URL query params
  useEffect(() => {
    if (datasetId) {
      setSearchParams({ dataset: datasetId }, { replace: true });
    }
  }, [datasetId, setSearchParams]);

  // Load Profile if datasetId exists
  useEffect(() => {
    if (!datasetId) return;

    let aborted = false;
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const data = await getDatasetProfile(datasetId);
        if (!aborted) {
          setProfile(data);
          setStep(2);
          if (data.target_column) {
            setSelectedTarget(data.target_column);
            setTaskType(data.detected_task || 'classification');
          }
        }
      } catch (err: any) {
        if (!aborted) {
          setProfileError(err);
        }
      } finally {
        if (!aborted) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => {
      aborted = true;
    };
  }, [datasetId]);

  // Handle CSV file selection and client-side pre-checks
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setUploadError({
        code: 'INVALID_FILE_TYPE',
        message: 'Only CSV files (.csv) are supported.',
      });
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setUploadError({
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds the 15 MB limit (${formatBytes(selected.size)}).`,
      });
      return;
    }

    setFile(selected);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const res = await uploadDataset(file, (p) => setUploadProgress(p));
      setDatasetId(res.dataset_id);
    } catch (err: any) {
      setUploadError(err);
    } finally {
      setUploading(false);
    }
  };

  // Configure Target Column & Confirm Task Type
  const handleConfigureTarget = async () => {
    if (!datasetId || !selectedTarget) return;
    setConfiguring(true);
    setConfigError(null);

    try {
      const res = await configureDataset(datasetId, {
        target_column: selectedTarget,
        task_type: taskType || undefined,
      });
      setConfigResponse(res);
      setTaskType(res.task_type);

      // Fetch compatible models for this task type
      setModelsLoading(true);
      const modelsData = await getModels({ task_type: res.task_type });
      setAvailableModels(modelsData.models);

      // Pre-select compatible trainable models (up to 3 by default)
      const initialIds = modelsData.models
        .filter((m) => m.training_supported)
        .slice(0, 3)
        .map((m) => m.id);
      setSelectedModelIds(initialIds);

      // Check if a specific model was requested in query param
      const urlModel = searchParams.get('model');
      if (urlModel && modelsData.models.some((m) => m.id === urlModel)) {
        if (!initialIds.includes(urlModel)) {
          setSelectedModelIds([...initialIds, urlModel]);
        }
      }

      setStep(3);
    } catch (err: any) {
      setConfigError(err);
    } finally {
      setConfiguring(false);
      setModelsLoading(false);
    }
  };

  // Request Recommendation from Recommender Engine
  const handleGetRecommendations = async () => {
    if (!profile || !taskType) return;
    setRecommendLoading(true);
    try {
      const rec = await recommendModels({
        task_type: taskType,
        row_count: profile.row_count,
        column_count: profile.column_count,
        priority,
      });
      setRecommendations(rec);
      // Auto-select recommended model IDs that are supported
      if (rec.recommended_model_ids?.length) {
        setSelectedModelIds(rec.recommended_model_ids);
      }
    } catch (err: any) {
      console.warn('Recommendation request failed:', err);
    } finally {
      setRecommendLoading(false);
    }
  };

  // Toggle model selection
  const toggleModel = (id: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Run Real Experiment
  const handleRunExperiment = async () => {
    if (!datasetId || !selectedTarget || selectedModelIds.length === 0) return;

    setStep(4);
    setExperimentRunning(true);
    setExperimentError(null);
    setRunStatusText('Submitting experiment to backend scikit-learn engine...');

    try {
      const expRes = await createExperiment({
        dataset_id: datasetId,
        target_column: selectedTarget,
        task_type: taskType,
        model_ids: selectedModelIds,
        test_size: testSize,
        random_state: randomSeed,
        priority,
      });

      // Synchronous training completed! Navigate to results page
      navigate(`/experiments/${expRes.experiment_id}`);
    } catch (err: any) {
      setExperimentError(err);
      setExperimentRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      {/* Cockpit Header with Monospace Step Navigator */}
      <div className="border-b border-graphite-700 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 mb-2 rounded-sm">
              <Database className="w-3.5 h-3.5" />
              <span>COCKPIT · EXPERIMENT LABORATORY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-bone-100">
              Model <span className="text-cyan-400">Lab</span>
            </h1>
          </div>

          {datasetId && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-steel-500">Active Dataset:</span>
              <code className="text-xs font-mono text-cyan-400 bg-graphite-800 px-2 py-1 border border-graphite-700">
                {datasetId.slice(0, 8)}...
              </code>
              <button
                onClick={() => {
                  setDatasetId(null);
                  setProfile(null);
                  setStep(1);
                  setSearchParams({});
                }}
                className="text-xs font-mono text-steel-400 hover:text-coral-500 underline ml-2"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* 4-Step Monospace Breadcrumb Indicator */}
        <div className="mt-8 grid grid-cols-4 gap-2 font-mono text-xs">
          {[
            { s: 1, label: '01. CHOOSE DATASET' },
            { s: 2, label: '02. PROFILE & TARGET' },
            { s: 3, label: '03. CONFIGURE MODELS' },
            { s: 4, label: '04. RUN EXPERIMENT' },
          ].map((item) => (
            <button
              key={item.s}
              disabled={step < item.s || experimentRunning}
              onClick={() => setStep(item.s as any)}
              className={`p-2.5 text-left border rounded-sm transition-all ${
                step === item.s
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 font-bold'
                  : step > item.s
                  ? 'border-graphite-700 bg-graphite-800/40 text-bone-100 hover:border-graphite-500'
                  : 'border-graphite-800 bg-graphite-900/30 text-steel-600 cursor-not-allowed'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- STEP 1: CHOOSE DATASET ---------------- */}
      {step === 1 && (
        <div className="space-y-12">
          {sampleLoadError && (
            <Callout variant="warning" title="Sample Dataset Error">
              {sampleLoadError}
            </Callout>
          )}

          {/* OPTION A: EXPLORE WITH SAMPLE DATASETS */}
          <div className="space-y-6">
            <div className="border-b border-graphite-700/80 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold">
                  Option A · Recommended for Beginners
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-bone-100">
                Explore with Sample Datasets
              </h2>
              <p className="text-xs sm:text-sm text-steel-400 font-sans mt-1 max-w-3xl leading-relaxed">
                Start experimenting immediately with standard machine learning benchmarks. No CSV upload or manual cleaning required. Selecting a dataset automatically loads and profiles it on the backend.
              </p>
            </div>

            {loadingSamples ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-64 bg-graphite-800/40 border border-graphite-700/50 rounded-sm" />
                <div className="h-64 bg-graphite-800/40 border border-graphite-700/50 rounded-sm" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleDatasets.map((sample) => {
                  const isLoadingThis = loadingSampleId === sample.id;
                  const isClassification = sample.task_type === 'classification';

                  return (
                    <div
                      key={sample.id}
                      className="p-6 border border-graphite-700 bg-graphite-850/40 hover:border-graphite-600 rounded-sm flex flex-col justify-between space-y-5 transition-all shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Chip variant={isClassification ? 'lime' : 'cyan'}>
                              {sample.task_type}
                            </Chip>
                            <Chip variant="default">
                              {sample.difficulty}
                            </Chip>
                          </div>
                          <span className="text-[11px] font-mono text-steel-500">
                            {sample.row_count} rows · {sample.feature_count} features
                          </span>
                        </div>

                        <h3 className="text-lg font-display font-bold text-bone-100">
                          {sample.display_name}
                        </h3>

                        <p className="text-xs text-steel-300 font-sans leading-relaxed">
                          {sample.description}
                        </p>

                        <div className="pt-2 border-t border-graphite-700/60 font-mono text-xs space-y-1">
                          <div className="text-steel-400">
                            Target Column:{' '}
                            <span className="text-cyan-400 font-bold">{sample.target_column}</span>
                          </div>
                          <div className="text-steel-400">
                            Features:{' '}
                            <span className="text-bone-100">{sample.feature_count} numerical dimensions</span>
                          </div>
                        </div>

                        {/* Educational Objectives */}
                        {sample.educational_objectives && sample.educational_objectives.length > 0 && (
                          <div className="space-y-1 pt-1 font-sans text-xs">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-steel-500 font-bold block">
                              Learning Objectives
                            </span>
                            <ul className="space-y-1 text-steel-400">
                              {sample.educational_objectives.slice(0, 3).map((obj, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-cyan-400 shrink-0">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Medical / Public Disclaimer if present */}
                        {sample.disclaimer && (
                          <div className="p-2.5 bg-ink-950 border border-graphite-800 rounded-sm text-[10px] text-amber-400/90 font-mono leading-relaxed">
                            <strong>Note: </strong> {sample.disclaimer}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-graphite-700/60 flex items-center justify-between">
                        <span className="text-xs font-mono text-steel-500">
                          Ready to profile & train
                        </span>
                        <Button
                          variant={isClassification ? 'lime-solid' : 'cyan-solid'}
                          size="sm"
                          disabled={loadingSampleId !== null}
                          isLoading={isLoadingThis}
                          onClick={() => handleSelectSample(sample)}
                          className="gap-1.5 text-xs"
                        >
                          <span>Explore Dataset</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-graphite-700" />
            </div>
            <div className="relative px-4 bg-ink-950 font-mono text-xs text-steel-500 uppercase tracking-widest">
              — OR UPLOAD YOUR OWN CSV —
            </div>
          </div>

          {/* OPTION B: UPLOAD YOUR OWN DATASET */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="chamfer-panel p-8 border border-graphite-700 bg-graphite-800/30 rounded-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Upload className="w-4 h-4 text-steel-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-steel-400 font-bold">
                  Option B · Custom Dataset
                </span>
              </div>
              <h3 className="text-base font-mono uppercase tracking-wider text-bone-100 font-bold mb-2">
                Upload Custom CSV Dataset
              </h3>
              <p className="text-xs text-steel-400 font-sans leading-relaxed mb-6">
                CSV upload is optional. If you have your own data file, drag and drop it here.
                Validated against file size limits (15 MB), maximum rows (100,000), and duplicate headers.
              </p>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) {
                    const ev = { target: { files: [dropped] } } as any;
                    handleFileChange(ev);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-graphite-600 hover:border-cyan-400 bg-ink-950/60 p-10 text-center cursor-pointer transition-colors group rounded-sm"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload CSV file"
                />
                <div className="inline-flex p-3 bg-graphite-800 border border-graphite-700 text-steel-400 group-hover:text-cyan-400 mb-3 rounded-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-mono text-sm text-bone-100 font-semibold group-hover:text-cyan-400 transition-colors">
                  {file ? file.name : 'Select or drop CSV file'}
                </div>
                <div className="text-xs font-mono text-steel-500 mt-1">
                  {file ? formatBytes(file.size) : 'Max 15MB · UTF-8 comma-separated values'}
                </div>
              </div>

              {/* Upload Progress Bar if running */}
              {uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-mono text-steel-400">
                    <span>Uploading to server...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div
                    className="w-full bg-graphite-700 h-1.5 overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="bg-cyan-400 h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="mt-4">
                  <Callout variant="warning" title={`Error: ${uploadError.code}`}>
                    {uploadError.message}
                  </Callout>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  variant="cyan-solid"
                  disabled={!file || uploading}
                  isLoading={uploading}
                  onClick={handleUploadSubmit}
                  className="gap-2"
                >
                  <span>Upload & Profile Dataset</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: PROFILE & EXPLICIT TARGET PICKER ---------------- */}
      {step === 2 && (
        <div className="space-y-8">
          {profileLoading ? (
            <div className="p-12 text-center font-mono text-steel-400 animate-pulse border border-graphite-700 bg-graphite-800/30">
              Generating dataset profile & statistics...
            </div>
          ) : profileError ? (
            <ConnectionError
              requestName={`GET /api/datasets/${datasetId}/profile`}
              message={profileError.message}
              onRetry={() => {
                setProfileError(null);
                setDatasetId(datasetId);
              }}
            />
          ) : profile ? (
            <>
              {/* Profile Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="p-4 border border-graphite-700 bg-graphite-800/40">
                  <div className="text-xs text-steel-500 uppercase">Total Rows</div>
                  <div className="text-xl sm:text-2xl font-bold text-bone-100 mt-1">
                    {profile.row_count.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 border border-graphite-700 bg-graphite-800/40">
                  <div className="text-xs text-steel-500 uppercase">Columns</div>
                  <div className="text-xl sm:text-2xl font-bold text-bone-100 mt-1">
                    {profile.column_count}
                  </div>
                </div>
                <div className="p-4 border border-graphite-700 bg-graphite-800/40">
                  <div className="text-xs text-steel-500 uppercase">Duplicate Rows</div>
                  <div className="text-xl sm:text-2xl font-bold text-bone-100 mt-1">
                    {profile.duplicate_rows}
                  </div>
                </div>
                <div className="p-4 border border-graphite-700 bg-graphite-800/40">
                  <div className="text-xs text-steel-500 uppercase">Filename</div>
                  <div className="text-sm font-bold text-cyan-400 mt-1 truncate" title={profile.original_filename}>
                    {profile.original_filename}
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 font-bold">
                    Raw Data Preview (First 5 Rows)
                  </h3>
                  <ProvenanceBadge type="backend-result" subtext="Direct SQLite payload" />
                </div>
                <div className="overflow-x-auto border border-graphite-700 bg-ink-900 max-h-64">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-graphite-700 bg-graphite-800 sticky top-0">
                      <tr>
                        {profile.columns.map((col) => (
                          <th key={col} className="p-2.5 text-steel-300 font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-700/50">
                      {profile.preview_rows.slice(0, 5).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-graphite-800/30">
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
              </div>

              {/* Explicit Target Column Picker (Honesty Rule 10: No default target column!) */}
              <div className="p-6 border border-cyan-400/40 bg-cyan-400/5 rounded-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-cyan-400 font-bold">
                      Select Target Column (Required)
                    </h3>
                    <p className="text-xs text-steel-400 font-sans mt-1">
                      Choose which column represents the prediction target. The backend will detect whether this is a classification or regression problem.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-coral-400 font-semibold">* Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="target-picker" className="block text-xs font-mono text-steel-300 mb-1">
                      Target Feature Column:
                    </label>
                    <select
                      id="target-picker"
                      value={selectedTarget}
                      onChange={(e) => {
                        setSelectedTarget(e.target.value);
                        // Auto-infer suggestion
                        const colProfile = profile.column_profiles.find((c) => c.name === e.target.value);
                        if (colProfile) {
                          if (colProfile.inferred_type === 'numeric' && colProfile.unique_count > 20) {
                            setTaskType('regression');
                          } else {
                            setTaskType('classification');
                          }
                        }
                      }}
                      className="w-full p-2.5 bg-ink-950 border border-graphite-600 text-bone-100 text-sm font-mono focus-visible:outline-2 focus-visible:outline-cyan-400 rounded-sm"
                    >
                      <option value="">-- Choose target column explicitly --</option>
                      {profile.columns.map((col) => (
                        <option key={col} value={col}>
                          {col} ({profile.column_profiles.find((p) => p.name === col)?.inferred_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-type-picker" className="block text-xs font-mono text-steel-300 mb-1">
                      Task Type:
                    </label>
                    <select
                      id="task-type-picker"
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="w-full p-2.5 bg-ink-950 border border-graphite-600 text-bone-100 text-sm font-mono focus-visible:outline-2 focus-visible:outline-cyan-400 rounded-sm"
                    >
                      <option value="classification">Classification (predict category / label)</option>
                      <option value="regression">Regression (predict continuous quantity)</option>
                    </select>
                  </div>
                </div>

                {configError && (
                  <Callout variant="warning" title={`Configuration Error: ${configError.code}`}>
                    {configError.message}
                  </Callout>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="cyan-solid"
                    size="md"
                    disabled={!selectedTarget || configuring}
                    isLoading={configuring}
                    onClick={handleConfigureTarget}
                    className="gap-2"
                  >
                    <span>Confirm Target & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ---------------- STEP 3: MODEL SELECTION & HYPERPARAMETERS ---------------- */}
      {step === 3 && (
        <div className="space-y-8">
          {/* Target Summary Banner */}
          <div className="p-4 border border-graphite-700 bg-graphite-800/50 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-steel-400">Target:</span>
              <span className="font-bold text-cyan-400 px-2 py-0.5 bg-ink-950 border border-cyan-400/40">
                {selectedTarget}
              </span>
              <span className="text-steel-400">Task:</span>
              <span className="font-bold text-lime-400 uppercase">
                {taskType}
              </span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-steel-400 hover:text-cyan-400 underline"
            >
              Change Target
            </button>
          </div>

          {/* Model Recommendation Engine Trigger */}
          <div className="p-5 border border-cyan-400/30 bg-cyan-400/5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Backend Recommendation Engine</span>
              </div>
              <p className="text-xs text-steel-400 font-sans mt-1">
                Ask the backend recommender to score algorithms based on dataset size ({profile?.row_count} rows, {profile?.column_count} columns) and priority.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={recommendLoading}
              isLoading={recommendLoading}
              onClick={handleGetRecommendations}
              className="hover:border-cyan-400 shrink-0"
            >
              Get Recommendations
            </Button>
          </div>

          {/* Recommender Output if available */}
          {recommendations && (
            <div className="p-4 border border-graphite-700 bg-ink-950 space-y-3 font-mono text-xs">
              <div className="text-steel-400 uppercase font-semibold">
                Backend Suggested Candidates:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.recommendations.map((rec) => (
                  <div key={rec.model_id} className="p-3 border border-graphite-700 bg-graphite-800/40 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-400">{rec.model_name}</span>
                      <span className="text-steel-400">Score: {rec.suitability_score}/100</span>
                    </div>
                    <p className="text-bone-100 font-sans text-xs">{rec.recommendation_reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Model Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 font-bold">
                Select Models to Train ({selectedModelIds.length} Selected)
              </h3>
              <span className="text-xs font-mono text-steel-500">
                Minimum 1 model required for comparison
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModels.map((m) => {
                const isSelected = selectedModelIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => m.training_supported && toggleModel(m.id)}
                    className={`p-4 border transition-all rounded-sm flex flex-col justify-between select-none ${
                      !m.training_supported
                        ? 'opacity-40 border-graphite-800 bg-graphite-900/30 cursor-not-allowed'
                        : isSelected
                        ? 'border-cyan-400 bg-cyan-400/10 cursor-pointer shadow-cyan-glow'
                        : 'border-graphite-700 bg-graphite-800/30 hover:border-graphite-500 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-bone-100">{m.name}</span>
                        {isSelected && (
                          <span className="p-1 bg-cyan-400 text-ink-950 rounded-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-steel-400 font-sans leading-relaxed line-clamp-2">
                        {m.short_description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-graphite-700/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-steel-500 uppercase">{m.category}</span>
                      <span className={m.training_supported ? 'text-cyan-400' : 'text-steel-600'}>
                        {m.training_supported ? 'Trainable' : 'Unsupported'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experiment Settings */}
          <div className="p-6 border border-graphite-700 bg-graphite-800/25 rounded-sm space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 font-bold">
              Split & Optimization Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label htmlFor="test-split-range" className="block text-steel-400 mb-1">
                  Test Split: {(testSize * 100).toFixed(0)}%
                </label>
                <input
                  id="test-split-range"
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={testSize}
                  onChange={(e) => setTestSize(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="random-seed-input" className="block text-steel-400 mb-1">
                  Random Seed:
                </label>
                <input
                  id="random-seed-input"
                  type="number"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-ink-950 border border-graphite-700 text-bone-100 rounded-sm"
                />
              </div>

              <div>
                <label htmlFor="priority-select" className="block text-steel-400 mb-1">
                  Evaluation Priority:
                </label>
                <select
                  id="priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2 bg-ink-950 border border-graphite-700 text-bone-100 rounded-sm"
                >
                  <option value="performance">Performance (F1 / R²)</option>
                  <option value="speed">Training Speed</option>
                  <option value="interpretability">Interpretability</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            </div>
          </div>

          {experimentError && (
            <Callout variant="warning" title={`Execution Error: ${experimentError.code}`}>
              {experimentError.message}
            </Callout>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
            >
              Back to Target
            </Button>
            <Button
              variant="cyan-solid"
              size="md"
              disabled={selectedModelIds.length === 0 || experimentRunning}
              onClick={handleRunExperiment}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Run Experiment Pipeline ({selectedModelIds.length} Models)</span>
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 4: RUNNING STATE ---------------- */}
      {step === 4 && (
        <div className="max-w-md mx-auto py-16 text-center space-y-6">
          <div className="p-8 border border-graphite-700 bg-graphite-800/40 rounded-sm">
            <div className="inline-flex p-4 bg-cyan-400/10 border border-cyan-400/40 text-cyan-400 rounded-full animate-spin mb-4">
              <RefreshCw className="w-8 h-8" />
            </div>

            <h3 className="font-mono text-base uppercase tracking-wider text-bone-100 font-bold mb-2">
              Training Models in Sandbox
            </h3>
            <p className="text-xs font-mono text-steel-400 mb-4 leading-relaxed">
              {runStatusText}
            </p>

            <div className="text-[11px] font-mono text-steel-500 bg-ink-950 p-3 border border-graphite-700 text-left space-y-1">
              <div>• Splitting dataset with seed {randomSeed} ({((1 - testSize) * 100).toFixed(0)}% train, {(testSize * 100).toFixed(0)}% test)</div>
              <div>• Fitting leakage-safe scikit-learn preprocessing pipelines</div>
              <div>• Running {selectedModelIds.length} models under identical test conditions</div>
              <div>• Calculating metrics, confusion matrices, and cross-validation</div>
            </div>

            {experimentError && (
              <div className="mt-4 text-left">
                <Callout variant="warning" title={`Execution Error: ${experimentError.code}`}>
                  {experimentError.message}
                </Callout>
                <div className="pt-3">
                  <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                    Return to Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
