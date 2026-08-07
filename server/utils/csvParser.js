/**
 * Parse CSV string into array of objects
 * Expected format: header row followed by data rows
 * @param {string} csvString - CSV content as string
 * @returns {Array} - Array of objects with header keys
 */
export const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
            console.warn(`Row ${i + 1} has ${values.length} values but header has ${headers.length}. Skipping.`);
            continue;
        }

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }

    return data;
};

/**
 * Validate client data from CSV
 * @param {Array} clients - Array of client objects
 * @returns {Object} - { valid: Array, invalid: Array, errors: Array }
 */
export const validateClientData = (clients) => {
    const valid = [];
    const invalid = [];
    const errors = [];

    clients.forEach((client, index) => {
        const rowErrors = [];
        
        if (!client.name || client.name.trim() === '') {
            rowErrors.push('Name is required');
        }
        
        if (!client.email || client.email.trim() === '') {
            rowErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
            rowErrors.push('Invalid email format');
        }

        if (!client.password || client.password.trim() === '') {
            rowErrors.push('Password is required');
        } else if (client.password.length < 6) {
            rowErrors.push('Password must be at least 6 characters');
        }

        if (rowErrors.length > 0) {
            invalid.push({ row: index + 1, data: client, errors: rowErrors });
            errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
        } else {
            valid.push({
                name: client.name.trim(),
                email: client.email.trim(),
                password: client.password.trim(),
                role: 'client',
            });
        }
    });

    return { valid, invalid, errors };
};
