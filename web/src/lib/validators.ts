/**
 * validators.ts
 * Input validation layer for ShopMate.
 * All user-facing data should pass through these validators before being sent to Supabase.
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates an item's name, price, and quantity before insert/update.
 */
export function validateItemInput(
    name: string,
    price?: string | number | null,
    quantity?: string | null
): ValidationResult {
    const errors: string[] = [];

    // Name validations
    if (!name || !name.trim()) {
        errors.push('El nombre es requerido');
    } else if (name.trim().length > 100) {
        errors.push('El nombre no puede superar los 100 caracteres');
    }

    // Price validations
    if (price !== undefined && price !== null && price !== '') {
        const p = typeof price === 'number' ? price : parseFloat(String(price));
        if (isNaN(p)) {
            errors.push('El precio debe ser un número válido');
        } else if (p < 0) {
            errors.push('El precio no puede ser negativo');
        } else if (p > 999999) {
            errors.push('El precio es demasiado alto (máx $999,999)');
        }
    }

    // Quantity validations (quantity is a free string like "2 kg", "1 docena", etc.)
    if (quantity && quantity.trim().length > 50) {
        errors.push('La cantidad no puede superar los 50 caracteres');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates household name.
 */
export function validateHouseholdName(name: string): ValidationResult {
    const errors: string[] = [];
    if (!name || !name.trim()) errors.push('El nombre del hogar es requerido');
    if (name.trim().length < 2) errors.push('El nombre debe tener al menos 2 caracteres');
    if (name.trim().length > 50) errors.push('El nombre no puede superar 50 caracteres');
    return { isValid: errors.length === 0, errors };
}

/**
 * Validates login/auth credentials.
 */
export function validateAuthInput(email: string, password: string): ValidationResult {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) errors.push('Correo electrónico inválido');
    if (!password || password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres');
    return { isValid: errors.length === 0, errors };
}
