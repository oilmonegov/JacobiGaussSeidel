/**
 * Export Module
 * 
 * Handles CSV export of performance data
 */

/**
 * Escape CSV field (handle commas and quotes)
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field
 */
function escapeCSVField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Format number for CSV
 * @param {number|null} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals = 3) {
    if (num === null || num === undefined || !isFinite(num)) {
        return 'N/A';
    }
    return num.toFixed(decimals);
}

/**
 * Format timestamp for CSV
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (e) {
        return timestamp;
    }
}

/**
 * Export performance data to CSV
 * @param {Object} performanceHistory - Performance history from state
 * @returns {string} CSV string
 */
export function exportPerformanceToCSV(performanceHistory) {
    const lines = [];
    
    // Header row
    lines.push('Method,Run,Iterations,Time (s),Memory (MB),Avg Time/Iter (ms),Timestamp');
    
    // Process each method
    ['jacobi', 'gaussSeidel'].forEach(method => {
        const methodData = performanceHistory[method];
        if (!methodData || !methodData.runs || methodData.runs.length === 0) {
            return;
        }
        
        // Add each run
        methodData.runs.forEach((run, index) => {
            const row = [
                method === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel',
                index + 1,
                run.iterations || 0,
                formatNumber(run.timeToConverge, 3),
                formatNumber(run.memoryUsed, 2),
                formatNumber(run.avgTimePerIteration, 2),
                formatTimestamp(run.timestamp)
            ];
            lines.push(row.map(escapeCSVField).join(','));
        });
    });
    
    // Add statistics rows if we have data
    ['jacobi', 'gaussSeidel'].forEach(method => {
        const methodData = performanceHistory[method];
        if (!methodData || !methodData.runs || methodData.runs.length === 0) {
            return;
        }
        
        const runs = methodData.runs;
        const methodName = method === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel';
        
        // Calculate statistics
        const times = runs.map(r => r.timeToConverge).filter(t => t !== null && isFinite(t));
        const memories = runs.map(r => r.memoryUsed).filter(m => m !== null && isFinite(m));
        const iterations = runs.map(r => r.iterations).filter(i => i !== null && isFinite(i));
        const avgTimes = runs.map(r => r.avgTimePerIteration).filter(t => t !== null && isFinite(t));
        
        if (times.length > 0) {
            const bestTime = Math.min(...times);
            const worstTime = Math.max(...times);
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            
            const bestMemory = memories.length > 0 ? Math.min(...memories) : null;
            const worstMemory = memories.length > 0 ? Math.max(...memories) : null;
            const avgMemory = memories.length > 0 ? memories.reduce((a, b) => a + b, 0) / memories.length : null;
            
            const bestIter = Math.min(...iterations);
            const worstIter = Math.max(...iterations);
            const avgIter = iterations.reduce((a, b) => a + b, 0) / iterations.length;
            
            const bestAvgTime = Math.min(...avgTimes);
            const worstAvgTime = Math.max(...avgTimes);
            const avgAvgTime = avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length;
            
            // Best row
            lines.push([
                `${methodName} - Best`,
                '',
                bestIter,
                formatNumber(bestTime, 3),
                formatNumber(bestMemory, 2),
                formatNumber(bestAvgTime, 2),
                ''
            ].map(escapeCSVField).join(','));
            
            // Worst row
            lines.push([
                `${methodName} - Worst`,
                '',
                worstIter,
                formatNumber(worstTime, 3),
                formatNumber(worstMemory, 2),
                formatNumber(worstAvgTime, 2),
                ''
            ].map(escapeCSVField).join(','));
            
            // Average row
            lines.push([
                `${methodName} - Average`,
                '',
                formatNumber(avgIter, 0),
                formatNumber(avgTime, 3),
                formatNumber(avgMemory, 2),
                formatNumber(avgAvgTime, 2),
                ''
            ].map(escapeCSVField).join(','));
        }
    });
    
    return lines.join('\n');
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
export function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 * @returns {string} Filename
 */
export function generateFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `performance-data-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.csv`;
}


