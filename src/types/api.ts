// Types matching backend dashboard API schemas

export interface DashboardStats {
  client_id: string;
  period: string;
  total_transactions: number;
  total_flagged: number;
  flagged_rate: number;
  decisions: {
    allow: number;
    review: number;
    alert: number;
    block: number;
  };
  avg_score: number;
  avg_inference_time_ms: number;
  labeled_count: number;
  phase: "detection" | "learning" | "classification" | "intelligence";
  model_version_id: number | null;
  pending_review: number;
  timestamp: string;
}

export interface TransactionItem {
  request_id: string;
  transaction_id: string | null;
  decision: "allow" | "review" | "alert" | "block" | null;
  score: number;
  anomaly_score: number;
  ml_score: number;
  gnn_score: number;
  inference_time_ms: number;
  ground_truth: Record<string, unknown> | null;
  phase: string | null;
  timestamp: string | null;
}

export interface PaginatedTransactions {
  items: TransactionItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  flagged: number;
  avg_score: number;
}

export interface DecisionBreakdown {
  allow: number;
  review: number;
  alert: number;
  block: number;
}

export interface AnalyticsData {
  client_id: string;
  period: string;
  time_series: TimeSeriesPoint[];
  decision_breakdown: DecisionBreakdown;
  score_distribution: Record<string, number>;
  top_hours: { hour: number; count: number }[];
  timestamp: string;
}

export interface RiskFactor {
  name: string;
  value: number;
}

export interface ReviewItem {
  request_id: string;
  transaction_id: string | null;
  decision: string | null;
  score: number;
  top_features: string[];
  risk_factors: RiskFactor[];
  phase: string | null;
  timestamp: string | null;
}

export interface PaginatedReviewQueue {
  items: ReviewItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ModelVersion {
  id: number;
  model_name: string;
  version: string;
  framework: string | null;
  stage: string | null;
  validation_metrics: Record<string, number> | null;
  created_at: string;
  is_client_specific: boolean;
}

export interface ModelsResponse {
  client_id: string;
  models: ModelVersion[];
}

export interface FeedbackSummary {
  client_id: string;
  period: string;
  total_labeled: number;
  fraud_count: number;
  legitimate_count: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  labeled_count_total: number;
  phase: string;
  timestamp: string;
}

export interface PhaseDefinition {
  phase: string;
  description: string;
  min_labels: number;
  max_labels: number | null;
}

export interface FraudTaxonomyItem {
  key: string;
  label: string;
  description: string;
}

export interface ScoringWeights {
  anomaly: number;
  ml: number;
  gnn: number;
}

export interface ScoringConfig {
  client_id: string;
  current_phase: string;
  phase_description: string;
  thresholds: Record<string, number>;
  weights_by_phase: Record<string, ScoringWeights>;
  fraud_taxonomy: FraudTaxonomyItem[];
  phases: PhaseDefinition[];
}

export interface PhaseProgress {
  client_id: string;
  current_phase: string;
  labeled_count: number;
  next_phase: string | null;
  next_phase_threshold: number | null;
  progress_percent: number;
  labels_remaining: number;
  scoring_weights: {
    anomaly: number;
    ml: number;
    gnn: number;
  };
  phase_description: string;
  phases: PhaseDefinition[];
}

export interface ProductionModel {
  id: number;
  model_name: string;
  version: string;
  framework: string | null;
  stage: string | null;
  created_at: string;
  is_client_specific: boolean;
  validation_metrics: Record<string, number> | null;
  classifier_metrics: Record<string, number> | null;
  anomaly_metrics: Record<string, number> | null;
  confusion_matrix: {
    true_positives: number;
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
  } | null;
  feature_importance: Record<string, number> | null;
  params: Record<string, string> | null;
  tags: string[];
  comet_url: string | null;
  assets: string[];
}

export interface ProductionModelsResponse {
  client_id: string;
  models: ProductionModel[];
  comet_available: boolean;
}

export type Period = "24h" | "7d" | "30d" | "90d";
export type Decision = "allow" | "review" | "alert" | "block";
export type SortOrder = "newest" | "oldest" | "score_desc" | "score_asc";
