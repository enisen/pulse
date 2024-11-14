
// components/components/ComponentsList.tsx
'use client';

import { CommonComponent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
interface ComponentsListProps {
  components: CommonComponent[];
  setComponents: React.Dispatch<React.SetStateAction<CommonComponent[]>>;
}

export default function ComponentsList({
  components,
  setComponents,
}: ComponentsListProps) {
  const addComponent = () => {
    setComponents([
      ...components,
      {
        id: crypto.randomUUID(),
        name: '',
        effort: 0,
      },
    ]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(component => component.id !== id));
  };

  const updateComponent = (id: string, field: keyof CommonComponent, value: any) => {
    setComponents(
      components.map(component =>
        component.id === id ? { ...component, [field]: value } : component
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Ortak Bileşenler</CardTitle>
        <Button onClick={addComponent} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Bileşen Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {components.map((component) => (
            <div key={component.id} className="flex gap-2 items-start">
              <Input
                placeholder="Bileşen adı"
                value={component.name}
                onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                step="0.5"
                value={component.effort}
                onChange={(e) => updateComponent(component.id, 'effort', Number(e.target.value))}
                className="w-24"
                placeholder="Gün"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeComponent(component.id)}
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