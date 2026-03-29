import type { DAG } from '../types/index.js';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateDAG(dag: DAG): ValidationResult;
//# sourceMappingURL=dag.d.ts.map