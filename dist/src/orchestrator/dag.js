export function validateDAG(dag) {
    const errors = [];
    const steps = dag.steps;
    if (!steps || steps.length === 0) {
        errors.push('DAG must have at least one step');
        return { valid: false, errors };
    }
    // Check for duplicate step indices
    const indices = new Set();
    for (const step of steps) {
        if (indices.has(step.index)) {
            errors.push(`Duplicate step index: ${step.index}`);
        }
        indices.add(step.index);
    }
    // Check all dependencies are valid
    for (const step of steps) {
        if (step.index < 0 || step.index >= steps.length) {
            errors.push(`Invalid step index: ${step.index}`);
        }
        for (const dep of step.dependencies) {
            if (dep < 0 || dep >= steps.length) {
                errors.push(`Step ${step.index} has invalid dependency: ${dep}`);
            }
            if (dep === step.index) {
                errors.push(`Step ${step.index} depends on itself`);
            }
        }
    }
    // Check for cycles using DFS
    const visited = new Set();
    const recursionStack = new Set();
    function hasCycle(index, path) {
        if (recursionStack.has(index)) {
            return true;
        }
        if (visited.has(index)) {
            return false;
        }
        visited.add(index);
        recursionStack.add(index);
        const step = steps.find((s) => s.index === index);
        if (step) {
            for (const dep of step.dependencies) {
                if (hasCycle(dep, [...path, index])) {
                    return true;
                }
            }
        }
        recursionStack.delete(index);
        return false;
    }
    for (const step of steps) {
        if (!visited.has(step.index)) {
            if (hasCycle(step.index, [])) {
                errors.push('DAG contains a cycle');
                break;
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=dag.js.map