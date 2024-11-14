'use client';

import { Screen } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface ScreensListProps {
  screens: Screen[];
  onUpdate: (screens: Screen[]) => void;
}

export default function ScreensList({ screens, onUpdate }: ScreensListProps) {
  const addScreen = () => {
    onUpdate([
      ...screens,
      {
        id: crypto.randomUUID(),
        name: '',
        complexity: 'normal',
        effort: 0,
      },
    ]);
  };

  const removeScreen = (id: string) => {
    onUpdate(screens.filter(screen => screen.id !== id));
  };

  const updateScreen = (id: string, field: keyof Screen, value: any) => {
    onUpdate(
      screens.map(screen =>
        screen.id === id ? { ...screen, [field]: value } : screen
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Ekranlar</CardTitle>
        <Button onClick={addScreen} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Ekran Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {screens.map((screen) => (
            <div key={screen.id} className="flex gap-2 items-start">
              <Input
                placeholder="Ekran adı"
                value={screen.name}
                onChange={(e) => updateScreen(screen.id, 'name', e.target.value)}
                className="flex-1"
              />
              <select
                className="border rounded p-2"
                value={screen.complexity}
                onChange={(e) => updateScreen(screen.id, 'complexity', e.target.value as Screen['complexity'])}
              >
                <option value="simple">Basit</option>
                <option value="normal">Normal</option>
                <option value="complex">Karmaşık</option>
              </select>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={screen.effort}
                onChange={(e) => updateScreen(screen.id, 'effort', Number(e.target.value))}
                className="w-24"
                placeholder="Gün"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeScreen(screen.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}