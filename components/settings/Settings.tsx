// components/settings/Settings.tsx
'use client';

import { Settings as SettingsType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SettingsProps {
  settings: SettingsType;
  setSettings: (settings: SettingsType) => void;
}

export default function Settings({ settings, setSettings }: SettingsProps) {
  const updateSetting = (field: keyof SettingsType, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Ayarlar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Takım Büyüklüğü
            </label>
            <Input
              type="number"
              min="1"
              value={settings.teamSize}
              onChange={(e) => updateSetting('teamSize', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Buffer (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={settings.bufferPercentage}
              onChange={(e) => updateSetting('bufferPercentage', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tatil Günleri
            </label>
            <Input
              type="number"
              min="0"
              value={settings.holidayDays}
              onChange={(e) => updateSetting('holidayDays', Number(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}