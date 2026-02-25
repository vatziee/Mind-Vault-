import db from '../database';

export interface SearchParams {
  query?: string;
  year?: number;
  minSize?: number; // in bytes
  maxSize?: number; // in bytes
  fileType?: string;
  driveName?: string;
  smartFilter?: 'large_files' | 'old_files';
}

export function searchFiles(params: SearchParams) {
  let query = 'SELECT * FROM files WHERE 1=1';
  const queryParams: any[] = [];

  if (params.query) {
    query += ' AND file_name LIKE ?';
    queryParams.push(`%${params.query}%`);
  }

  if (params.year) {
    query += ' AND strftime(\'%Y\', creation_date) = ?';
    queryParams.push(params.year.toString());
  }

  if (params.minSize) {
    query += ' AND file_size >= ?';
    queryParams.push(params.minSize);
  }
  
  if (params.maxSize) {
    query += ' AND file_size <= ?';
    queryParams.push(params.maxSize);
  }

  if (params.fileType) {
    query += ' AND file_type = ?';
    queryParams.push(params.fileType);
  }
  
  if (params.driveName) {
    query += ' AND drive_name = ?';
    queryParams.push(params.driveName);
  }

  if (params.smartFilter === 'large_files') {
    // Larger than 10GB
    query += ' AND file_size > 10737418240';
  }

  if (params.smartFilter === 'old_files') {
    // Not accessed in 365 days
    query += ' AND modified_date < date(\'now\', \'-365 days\')';
  }

  query += ' ORDER BY file_size DESC LIMIT 100'; // Add a limit for performance

  const stmt = db.prepare(query);
  return stmt.all(queryParams);
}
