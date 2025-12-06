// Define the shape of the data exactly as the API returns it
export interface Category {
    id: number;
    name: string;
    slug: string;
    created_at?: string; // Optional, as we might not always need it
    updated_at?: string;
}

// You can also define related types here, e.g., for Forms
export interface CreateCategoryDTO {
    name: string;
}
