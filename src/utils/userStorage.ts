// User storage utilities
const USER_KEY = 'app_user';

export interface User {
    name: string;
    email?: string;
    avatar?: string;
    createdAt: string;
}

export async function getUser(): Promise<User | null> {
    try {
        const data = localStorage.getItem(USER_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function saveUser(user: User): Promise<void> {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
    localStorage.removeItem(USER_KEY);
}
