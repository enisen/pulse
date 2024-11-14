export interface Screen {
    id: string;
    name: string;
    complexity: 'simple' | 'normal' | 'complex';
    effort: number;
  }
  
  export interface CommonComponent {
    id: string;
    name: string;
    effort: number;
  }
  
  export interface SettingsType {
    teamSize: number;
    bufferPercentage: number;
    holidayDays: number;
  }