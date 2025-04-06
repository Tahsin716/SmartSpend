import axios, { InternalAxiosRequestConfig } from 'axios';
import {
    UserInfo, Expense, Budget, AdviceMessage, StaticArticle, ApiErrorResponse,
    LoginCredentials, RegisterData, ExpenseData, BudgetData
} from '../types'; 

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config): InternalAxiosRequestConfig => {
        try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                const userInfo: UserInfo = JSON.parse(storedUserInfo);
                if (userInfo?.token) {
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${userInfo.token}`;
                }
            }
        } catch (error) {
            console.error("Error parsing user info from localStorage:", error);
            localStorage.removeItem('userInfo');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const loginUser = (credentials: LoginCredentials) =>
    api.post<UserInfo>('/auth/login', credentials); 

export const registerUser = (data: RegisterData) =>
    api.post<UserInfo>('/auth/register', data); 

export const getUserProfile = () =>
    api.get<UserInfo>('/auth/profile'); 

export const updateUserConsent = (consentData: Partial<RegisterData['consent']>) =>
    api.put<UserInfo>('/auth/profile/consent', consentData); 

export const addExpense = (expenseData: ExpenseData) =>
    api.post<Expense>('/expenses', expenseData); 

export const getExpenses = () =>
    api.get<Expense[]>('/expenses'); 

interface SpendingTrend {
  category: string;
  totalAmount: number;
}
export const getSpendingTrends = () =>
    api.get<SpendingTrend[]>('/expenses/trends'); 


export const setBudget = (budgetData: BudgetData) =>
    api.post<Budget>('/budgets', budgetData); 

export const getBudgets = (year: number, month: number) =>
    api.get<Budget[]>(`/budgets?year=${year}&month=${month}`); 

export const deleteBudget = (budgetId: string) =>
    api.delete<{ message: string }>(`/budgets/${budgetId}`);

// --- Resources ---
export const getStaticArticles = () =>
    api.get<StaticArticle[]>('/resources/articles/static');

export const getPersonalizedAdvice = () =>
    api.get<AdviceMessage[]>('/resources/advice/personalized'); 
