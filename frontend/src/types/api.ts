
export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  status?: number;
  isNetworkError?: boolean;
}

export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  environment: string;
  timestamp: string;
  database: string;
}

export interface ConceptSummary {
  id: string;
  title: string;
  level: string;
  category: string;
  short_definition: string;
}

export interface ConceptListResponse {
  total: number;
  concepts: ConceptSummary[];
}

export interface ConceptDetail {
  id: string;
  title: string;
  level: string;
  category: string;
  short_definition: string;
  simple_explanation: string;
  real_world_example: string;
  key_points: string[];
  common_mistakes: string[];
  related_concepts: string[];
}

export interface TermDefinition {
  term: string;
  definition: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correct_option_id: string;
  explanation: string;
}

export interface LessonSummary {
  id: string;
  unit: string;
  module: string;
  title: string;
  order: number;
  level: string;
  estimated_minutes: number;
}

export interface ModuleLessons {
  unit: string;
  module_title: string;
  lessons: LessonSummary[];
}

export interface LessonListResponse {
  total_lessons: number;
  units: ModuleLessons[];
}

export interface LessonDetail {
  id: string;
  unit: string;
  module: string;
  title: string;
  order: number;
  level: string;
  estimated_minutes: number;
  learning_objectives: string[];
  explanation: string;
  definitions: TermDefinition[];
  mathematical_explanation?: string | null;
  real_world_example: string;
  step_by_step_working: string[];
  python_code: string;
  code_explanation: string;
  advantages: string[];
  limitations: string[];
  common_mistakes: string[];
  related_concepts: string[];
  knowledge_check: QuizQuestion[];
}

export interface ParameterSchema {
  name: string;
  type: string;
  default: any;
  description: string;
  allowed_range?: string | null;
  options?: any[] | null;
}

export interface AlgorithmSummary {
  id: string;
  name: string;
  category: string;
  task_type: string;
  short_description: string;
  curriculum_status: string;
  learning_content_status: string;
  training_supported: boolean;
}

export interface AlgorithmListResponse {
  total: number;
  algorithms: AlgorithmSummary[];
}

export interface AlgorithmDetail {
  id: string;
  name: string;
  category: string;
  task_type: string;
  short_description: string;
  intuition: string;
  mathematical_formula?: string | null;
  step_by_step_working: string[];
  parameters: ParameterSchema[];
  advantages: string[];
  limitations: string[];
  use_cases: string[];
  when_to_use: string[];
  when_to_avoid: string[];
  python_snippet: string;
  code_explanation: string;
  curriculum_status: string;
  learning_content_status: string;
  training_supported: boolean;
  default_hyperparameters: Record<string, any>;
}

export interface ColumnProfile {
  name: string;
  inferred_type: string;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  std?: number | null;
  median?: number | null;
  top_categories?: Array<{ value: any; count: number }> | null;
  sample_values: any[];
}

export interface DatasetUploadResponse {
  dataset_id: string;
  original_filename: string;
  file_size_bytes: number;
  status: string;
  rows: number;
  columns: number;
  profile_url: string;
}

export interface DatasetProfileResponse {
  dataset_id: string;
  original_filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  column_profiles: ColumnProfile[];
  duplicate_rows: number;
  target_column?: string | null;
  detected_task?: string | null;
  preview_rows: Record<string, any>[];
  class_distribution?: Record<string, number> | null;
  warnings: string[];
}

export interface DatasetConfigureRequest {
  target_column: string;
  task_type?: string | null;
}

export interface DatasetConfigureResponse {
  dataset_id: string;
  target_column: string;
  task_type: string;
  compatible_models: string[];
  warnings: string[];
}

export interface DatasetSummary {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  target_column?: string | null;
  detected_task?: string | null;
  status: string;
  created_at: string;
}

export interface DatasetListResponse {
  total: number;
  datasets: DatasetSummary[];
}

export interface SampleDatasetInfo {
  id: string;
  display_name: string;
  description: string;
  filename: string;
  row_count: number;
  feature_count: number;
  target_column: string;
  task_type: string;
  difficulty: string;
  available_algorithms: string[];
  educational_objectives: string[];
  disclaimer?: string | null;
}

export interface SampleDatasetListResponse {
  total: number;
  samples: SampleDatasetInfo[];
}


export interface ModelInfo {
  id: string;
  name: string;
  category: string;
  task_type: string;
  short_description: string;
  training_supported: boolean;
  default_hyperparameters: Record<string, any>;
}

export interface ModelListResponse {
  total: number;
  models: ModelInfo[];
}

export interface ModelRecommendationCandidate {
  model_id: string;
  model_name: string;
  suitability_score: number;
  pros: string[];
  cons: string[];
  recommendation_reason: string;
}

export interface ModelRecommendationResponse {
  task_type: string;
  recommended_model_ids: string[];
  recommendations: ModelRecommendationCandidate[];
}

export interface ExperimentCreateRequest {
  dataset_id: string;
  target_column: string;
  task_type?: string | null;
  model_ids: string[];
  test_size?: number;
  random_state?: number;
  priority?: 'performance' | 'speed' | 'interpretability' | 'balanced';
  hyperparameters?: Record<string, Record<string, any>> | null;
}

export interface ModelEvaluationResult {
  model_id: string;
  model_name: string;
  category: string;
  hyperparameters: Record<string, any>;
  metrics: {
    accuracy?: number;
    precision_macro?: number;
    recall_macro?: number;
    f1_macro?: number;
    f1_weighted?: number;
    confusion_matrix?: number[][];
    classes?: string[];
    classification_report?: Record<string, any>;
    mae?: number;
    mse?: number;
    rmse?: number;
    r2?: number;
    [key: string]: any;
  };
  training_duration_seconds: number;
  train_metric?: number | null;
  test_metric?: number | null;
  overfitting_warning?: string | null;
  cv_scores?: {
    metric: string;
    folds: number;
    mean: number;
    std: number;
    fold_scores: number[];
  } | null;
  status: string;
  error_message?: string | null;
  is_tuned?: boolean;
  tuning_comparison?: Record<string, any> | null;
}

export interface ModelRankingItem {
  rank: number;
  model_id: string;
  model_name: string;
  primary_metric_value: number;
  training_duration_seconds: number;
  pros: string[];
  cons: string[];
}

export interface ModelComparisonSummary {
  best_model_id: string;
  best_model_name: string;
  primary_metric_name: string;
  ranked_models: ModelRankingItem[];
  tradeoff_analysis: string;
  recommendation_reason: string;
}

export interface ExperimentResponse {
  experiment_id: string;
  dataset_id: string;
  target_column: string;
  task_type: string;
  test_size: number;
  random_state: number;
  status: string;
  priority: string;
  results: ModelEvaluationResult[];
  comparison?: ModelComparisonSummary | null;
  warnings: string[];
  created_at: string;
}

export interface ExperimentSummary {
  id: string;
  dataset_id: string;
  target_column: string;
  task_type: string;
  status: string;
  model_count: number;
  best_model?: string | null;
  created_at: string;
}

export interface ExperimentListResponse {
  total: number;
  experiments: ExperimentSummary[];
}

export interface ExperimentTuneRequest {
  model_id: string;
  param_grid?: Record<string, any[]> | null;
  cv_folds?: number;
}

export interface ExperimentTuneResponse {
  experiment_id: string;
  model_id: string;
  original_parameters: Record<string, any>;
  best_parameters: Record<string, any>;
  before_metrics: Record<string, any>;
  after_metrics: Record<string, any>;
  improvement_summary: string;
  meaningful_improvement: boolean;
  warnings: string[];
}

export interface ExperimentReportResponse {
  experiment_id: string;
  task_type: string;
  primary_metric: string;
  ranked_models: ModelRankingItem[];
  tradeoff_analysis: string;
  recommendation_reason: string;
  warnings: string[];
  comparison_table: Array<Record<string, any>>;
}

export interface LessonProgressItem {
  lesson_id: string;
  completed: boolean;
  completed_at: string;
}

export interface LearnerProgressResponse {
  session_id: string;
  completed_lessons: string[];
  total_completed: number;
  recent_lessons: LessonProgressItem[];
}

export interface LessonCompleteResponse {
  session_id: string;
  lesson_id: string;
  completed: boolean;
  message: string;
}
