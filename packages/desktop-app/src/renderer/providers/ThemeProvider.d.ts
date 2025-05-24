import React, { ReactNode } from 'react';
type ThemeType = 'light' | 'dark' | 'sepia';
interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => Promise<void>;
}
interface ThemeProviderProps {
    children: ReactNode;
    initialTheme?: string | null;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export declare const useTheme: () => ThemeContextType;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map