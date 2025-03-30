export interface HotLink {
    id: string;
    name: string;
    url: string;
    iconUrl: string;
  }
  
  export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    completedAt: string | null; // Add completedAt field
    active: boolean;
  }
  
  export type ThemeType = 'daybreakBlue' | 'goldenPurple';