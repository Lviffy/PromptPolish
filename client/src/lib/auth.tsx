// Temporary empty auth module
export function useAuth() { return { user: null, isAuthenticated: false, login: () => {}, logout: () => {} }; }
export function AuthProvider({ children }: { children: React.ReactNode }) { return <>{children}</>; } 