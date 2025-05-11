
'use client';

import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
       <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
        <SelectTrigger className="w-full sm:w-[200px] text-sm">
          <div className="flex items-center gap-2">
            {theme === 'light' && <Sun className="h-4 w-4 text-muted-foreground" />}
            {theme === 'dark' && <Moon className="h-4 w-4 text-muted-foreground" />}
            {theme === 'system' && <Laptop className="h-4 w-4 text-muted-foreground" />}
            <SelectValue placeholder="Choisir un thème" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2 text-sm">
              <Sun className="h-4 w-4" /> Clair
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2 text-sm">
              <Moon className="h-4 w-4" /> Sombre
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2 text-sm">
              <Laptop className="h-4 w-4" /> Système
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
