export interface UserConsent {
    dataProcessing: boolean;
    externalApiUsage: boolean; 
}

export interface UserInfo {
    _id: string;
    name: string;
    email: string;
    token: string;
    consent: UserConsent;
    createdAt?: string; 
}

export interface Expense {
    _id: string;
    user: string; 
    category: string;
    amount: number;
    description?: string;
    date: string;
}

export interface Budget {
    _id: string;
    user: string;
    category: string;
    amount: number;
    month: number;
    year: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password?: string; 
}

export interface RegisterData extends LoginCredentials {
    name: string;
    consent: UserConsent;
}

export interface ExpenseData { 
    category: string;
    amount: number;
    date: string; 
    description?: string;
}

export interface BudgetData { 
    category: string;
    amount: number;
    month: number;
    year: number;
}

export interface ApiErrorResponse {
    message: string;
}

export interface AdviceMessage {
    id: string;
    type: 'observation' | 'warning' | 'info' | 'suggestion' | 'tip' | 'data' | 'success' | 'error'; 
    text: string;
}

export interface StaticArticle {
    id: string;
    title: string;
    content: string;
}

export interface AuthContextType {
    user: UserInfo | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<UserInfo>;
    register: (data: RegisterData) => Promise<UserInfo>;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}

export interface ChartDataStructure {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
        borderWidth?: number;
    }[];
}