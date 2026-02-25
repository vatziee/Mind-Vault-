export interface FileMetadata {
  id?: number;
  file_name: string;
  full_path: string;
  file_size: number;
  creation_date: number;
  modified_date: number;
  last_access_date: number;
  file_type: string;
  drive_name: string;
  sha256_hash?: string;
  year: number;
}

export interface DriveInfo {
  name: string;
  path: string;
  total_space: number;
  free_space: number;
  is_indexed: boolean;
}

export interface OptimizationResult {
  file_id: number;
  rule_name: string;
  risk_score: number;
  suggestion: string;
}
