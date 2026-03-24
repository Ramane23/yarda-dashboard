// Types matching backend admin API schemas

export interface ImpactMetrics {
  period: string;
  client_id: string | null;
  confirmed_fraud_intercepted: number;
  confirmed_fraud_count: number;
  amount_under_surveillance: number;
  surveillance_count: number;
  total_amount_processed: number;
  total_transactions: number;
  currency: string;
  timestamp: string;
}

export interface ClientPhaseInfo {
  client_id: string;
  client_name: string;
  operator_type: string;
  phase: string;
  labeled_count: number;
  min_labels_for_learning: number;
  min_labels_for_classification: number;
  is_active: boolean;
  onboarded_at: string | null;
}

export interface PhaseManagement {
  total_clients: number;
  active_clients: number;
  clients: ClientPhaseInfo[];
}

export interface IngestionStats {
  uptime_seconds: number;
  total_requests: number;
  total_errors: number;
  error_rate_percent: number;
  avg_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  requests_in_progress: Record<string, number>;
  fraud_predictions: Record<string, number>;
  per_path: { method: string; path: string; total: number; errors: number }[];
}

export interface ModelVersionDetail {
  id: number;
  model_name: string;
  version: number;
  framework: string | null;
  stage: string | null;
  client_id: number | null;
  client_name: string | null;
  mlflow_run_id: string | null;
  validation_metrics: Record<string, number> | null;
  production_metrics: Record<string, number> | null;
  model_size_mb: number | null;
  created_at: string;
}

export interface ModelRegistry {
  total_models: number;
  models: ModelVersionDetail[];
  active_per_client: Record<string, Record<string, unknown>>;
}

export interface ReportInfo {
  filename: string;
  client_id: string;
  generated_at: string;
  size_bytes: number;
  url?: string | null;
  experiment_url?: string | null;
  source?: string;
}

export interface ReportList {
  total: number;
  reports: ReportInfo[];
}

export interface SystemHealth {
  status: string;
  uptime_seconds: number;
  database: string;
  redis: string;
  api_metrics: Record<string, unknown>;
  clients_active: number;
  models_in_production: number;
  timestamp: string;
}

export interface TriggerInfo {
  name: string;
  type: string;
  enabled: boolean;
}

export interface RetrainingStatus {
  triggers: TriggerInfo[];
  min_improvement: number;
  primary_metric: string;
}

export interface TriggerResult {
  trigger_name: string;
  triggered: boolean;
  reason: string;
  severity: string;
  details: Record<string, unknown>;
}

export interface RetrainingCheck {
  client_id: string;
  should_retrain: boolean;
  results: TriggerResult[];
}

export interface AnomalyDetectorStatus {
  client_id: string;
  is_fitted: boolean;
  contamination: number | null;
  n_estimators: number | null;
  n_samples_trained: number | null;
  n_features: number | null;
  threshold: number | null;
  evaluation: Record<string, unknown> | null;
}

export interface FeedbackStats {
  total_labeled: number;
  total_fraud: number;
  total_legitimate: number;
  per_client: { client_id: number; client_name: string; total: number; fraud: number }[];
}

export interface TuningResults {
  client_id: string;
  results: Record<string, unknown>[];
}

export interface ExperimentInfo {
  name: string;
  key: string | null;
  status: string | null;
  url: string | null;
  created_at: string | null;
  tags: string[];
  metrics: Record<string, number>;
}

export interface ExperimentList {
  workspace: string | null;
  project: string | null;
  total: number;
  experiments: ExperimentInfo[];
}

export interface FeatureStats {
  client_id: string;
  feature_file: string | null;
  last_modified: string | null;
  n_rows: number | null;
  n_features: number | null;
  columns: {
    name: string;
    dtype: string;
    nulls: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
  }[];
}
