'use client';

import { Screen, CommonComponent, Settings } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface ResultsProps {
  screens: Screen[];
  components: CommonComponent[];
  settings: Settings;
}

const complexityMultipliers = {
  simple: 0.7,
  normal: 1,
  complex: 1.5,
};

export default function Results({ screens, components, settings }: ResultsProps) {
  const calculateTotalEffort = () => {
    // Gün bazında hesaplama
    const screensEffort = screens.reduce((total, screen) => {
      return total + screen.effort * complexityMultipliers[screen.complexity];
    }, 0);

    const componentsEffort = components.reduce((total, component) => {
      return total + component.effort;
    }, 0);

    const subtotal = screensEffort + componentsEffort;
    const withBuffer = subtotal * (1 + settings.bufferPercentage / 100);
    
    // Tatil günleri ekleniyor ve takım büyüklüğüne bölünüyor
    const totalDays = Math.ceil(withBuffer / settings.teamSize) + settings.holidayDays;

    return {
      screensEffort,
      componentsEffort,
      subtotal,
      withBuffer,
      totalDays,
    };
  };

  const results = calculateTotalEffort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Hesaplanan Efor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Ekranlar Toplam Efor</p>
            <p className="text-lg font-medium">{results.screensEffort.toFixed(1)} gün</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bileşenler Toplam Efor</p>
            <p className="text-lg font-medium">{results.componentsEffort.toFixed(1)} gün</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ara Toplam</p>
            <p className="text-lg font-medium">{results.subtotal.toFixed(1)} gün</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Buffer ile Toplam</p>
            <p className="text-lg font-medium">{results.withBuffer.toFixed(1)} gün</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Tahmini Tamamlanma Süresi</p>
            <p className="text-lg font-medium">{results.totalDays} iş günü</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}