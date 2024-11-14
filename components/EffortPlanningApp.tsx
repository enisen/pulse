'use client'

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronDown,
  Table as TableIcon 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer 
} from 'recharts';

// const COMPLEXITY_FACTORS = {
//   easy: 0.5,    // Yeni eklenen
//   simple: 0.7,
//   normal: 1,
//   complex: 1.5
// };

const BASE_SCREEN_DAYS = {
  easy: 1,      // Yeni eklenen
  simple: 2,
  normal: 3,
  complex: 5
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric'
  });
};


const ProjectEstimationTool = () => {
  const [projectName, setProjectName] = useState("");
  const [screenGroups, setScreenGroups] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [bufferPercentage, setBufferPercentage] = useState(10);
  const [teamSize, setTeamSize] = useState(1);
  const [holidays, setHolidays] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [startDate, setStartDate] = useState(new Date());

  
  const addScreenGroup = () => {
    setScreenGroups([...screenGroups, {
      id: Date.now(),
      name: '',
      screens: []
    }]);
  };

  const addTaskGroup = () => {
    setTaskGroups([...taskGroups, {
      id: Date.now(),
      name: '',
      tasks: []
    }]);
  };

  const addScreen = (groupId) => {
    setScreenGroups(screenGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          screens: [...group.screens, {
            id: Date.now(),
            name: '',
            complexity: 'normal',
            effortDays: BASE_SCREEN_DAYS.normal
          }]
        };
      }
      return group;
    }));
  };

  const addTask = (groupId) => {
    setTaskGroups(taskGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: [...group.tasks, {
            id: Date.now(),
            name: '',
            effortDays: 0
          }]
        };
      }
      return group;
    }));
  };

  const updateScreenGroup = (groupId, field, value) => {
    setScreenGroups(screenGroups.map(group => 
      group.id === groupId ? { ...group, [field]: value } : group
    ));
  };

  const updateTaskGroup = (groupId, field, value) => {
    setTaskGroups(taskGroups.map(group => 
      group.id === groupId ? { ...group, [field]: value } : group
    ));
  };

  const updateScreen = (groupId, screenId, field, value) => {
    setScreenGroups(screenGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          screens: group.screens.map(screen => {
            if (screen.id === screenId) {
              if (field === 'complexity') {
                return {
                  ...screen,
                  [field]: value,
                  effortDays: BASE_SCREEN_DAYS[value]
                };
              }
              return { ...screen, [field]: value };
            }
            return screen;
          })
        };
      }
      return group;
    }));
  };

  const updateTask = (groupId, taskId, field, value) => {
    setTaskGroups(taskGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: group.tasks.map(task => 
            task.id === taskId ? { ...task, [field]: value } : task
          )
        };
      }
      return group;
    }));
  };

  const deleteScreenGroup = (groupId) => {
    setScreenGroups(screenGroups.filter(group => group.id !== groupId));
  };

  const deleteTaskGroup = (groupId) => {
    setTaskGroups(taskGroups.filter(group => group.id !== groupId));
  };

  const deleteScreen = (groupId, screenId) => {
    setScreenGroups(screenGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          screens: group.screens.filter(screen => screen.id !== screenId)
        };
      }
      return group;
    }));
  };

  const deleteTask = (groupId, taskId) => {
    setTaskGroups(taskGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: group.tasks.filter(task => task.id !== taskId)
        };
      }
      return group;
    }));
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const calculateTotalEffort = () => {
    const screensEffort = screenGroups.reduce((sum, group) => {
      return sum + group.screens.reduce((groupSum, screen) => {
        return groupSum + Number(screen.effortDays); // çarpan kaldırıldı
      }, 0);
    }, 0);
  
    const tasksEffort = taskGroups.reduce((sum, group) => {
      return sum + group.tasks.reduce((groupSum, task) => {
        return groupSum + Number(task.effortDays);
      }, 0);
    }, 0);
  
    const subtotal = screensEffort + tasksEffort;
    const bufferDays = (subtotal * bufferPercentage) / 100;
    return subtotal + bufferDays;
  };

  const calculateEstimatedDuration = () => {
    const totalEffort = calculateTotalEffort();
    return Math.ceil(totalEffort / teamSize) + holidays.length;
  };


  const summaryData = useMemo(() => {
    const summary = {
      totalScreenGroups: screenGroups.length,
      totalScreens: screenGroups.reduce((sum, group) => sum + group.screens.length, 0),
      totalTaskGroups: taskGroups.length,
      totalTasks: taskGroups.reduce((sum, group) => sum + group.tasks.length, 0),
      screenEffort: screenGroups.reduce((sum, group) => {
        return sum + group.screens.reduce((groupSum, screen) => {
          return groupSum + (Number(screen.effortDays));
        }, 0);
      }, 0),
      taskEffort: taskGroups.reduce((sum, group) => {
        return sum + group.tasks.reduce((groupSum, task) => {
          return groupSum + Number(task.effortDays);
        }, 0);
      }, 0),
    };
    
    summary.totalEffort = summary.screenEffort + summary.taskEffort;
    summary.bufferDays = (summary.totalEffort * bufferPercentage) / 100;
    summary.finalEffort = summary.totalEffort + summary.bufferDays;
    
    return summary;
  }, [screenGroups, taskGroups, bufferPercentage]);

  const exportProject = () => {
    const projectData = {
      projectName,
      screenGroups,
      taskGroups,
      bufferPercentage,
      teamSize,
      holidays,
      totalEffort: calculateTotalEffort(),
      estimatedDuration: calculateEstimatedDuration()
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-')}-estimation.json`;
    a.click();
  };

  const importProject = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const projectData = JSON.parse(e.target.result);
        setProjectName(projectData.projectName);
        setScreenGroups(projectData.screenGroups);
        setTaskGroups(projectData.taskGroups);
        setBufferPercentage(projectData.bufferPercentage);
        setTeamSize(projectData.teamSize);
        setHolidays(projectData.holidays);
      };
      reader.readAsText(file);
    }
  };

  const GanttSection = () => {
    const ganttData = useMemo(() => {
      let currentDate = new Date(startDate);
      const data = [];
      let order = 0;
  
      const addBusinessDays = (date, days) => {
        let currentDate = new Date(date);
        let remainingDays = days;
        
        while (remainingDays > 0) {
          currentDate.setDate(currentDate.getDate() + 1);
          
          // Skip weekends and holidays
          const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
          const isHoliday = holidays.some(h => h.toDateString() === currentDate.toDateString());
          
          if (!isWeekend && !isHoliday) {
            remainingDays -= 1;
          }
        }
        
        return currentDate;
      };
  
      // Process screens
      screenGroups.forEach(group => {
        group.screens.forEach(screen => {
          const duration = screen.effortDays; // çarpan kaldırıldı
          const endDate = addBusinessDays(currentDate, duration);
          
          data.push({
            name: `${group.name} - ${screen.name}`,
            startDate: currentDate,
            endDate: endDate,
            duration: duration,
            type: 'Screen',
            start: Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24))
          });
          
          currentDate = new Date(endDate);
        });
      });
  
      // Process tasks
      taskGroups.forEach(group => {
        group.tasks.forEach(task => {
          const endDate = addBusinessDays(currentDate, task.effortDays);
          
          data.push({
            name: `${group.name} - ${task.name}`,
            startDate: currentDate,
            endDate: endDate,
            duration: task.effortDays,
            type: 'Task',
            start: Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24))
          });
          
          currentDate = new Date(endDate);
        });
      });
  
      return data;
    }, [screenGroups, taskGroups, holidays, startDate]);
  
    // Calculate total project duration
    const projectEndDate = ganttData.length > 0 
      ? ganttData[ganttData.length - 1].endDate 
      : startDate;
    
    const totalDays = Math.ceil((projectEndDate - startDate) / (1000 * 60 * 60 * 24));
  
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Başlangıç Tarihi:</label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                {formatDate(startDate)}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Başlangıç Tarihi</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                className="rounded-md border"
              />
            </DialogContent>
          </Dialog>
        </div>
  
        {/* Gantt Chart */}
        <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
  <BarChart
    data={ganttData}
    layout="vertical"
    margin={{ top: 20, right: 30, left: 150, bottom: 50 }}
  >
    <XAxis 
      type="number" 
      domain={[0, totalDays]}
      tickFormatter={(value) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + value);
        return formatDate(date);
      }}
      angle={-45}
      textAnchor="end"
      height={70}
    />
    <YAxis 
      type="category" 
      dataKey="name" 
      width={150}
    />
    <Tooltip
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div className="bg-white p-2 border rounded shadow">
              <p className="font-semibold">{data.name}</p>
              <p>Başlangıç: {formatDate(data.startDate)}</p>
              <p>Bitiş: {formatDate(data.endDate)}</p>
              <p>Süre: {data.duration} gün</p>
            </div>
          );
        }
        return null;
      }}
    />
    <Bar 
      dataKey="duration"
      fill="#3b82f6"
      shape={(props) => {
        const { x, y, width, height, fill, payload } = props;
        const barX = x + (payload.start * (width / totalDays));
        const barWidth = payload.duration * (width / totalDays);
        
        return (
          <rect
            x={barX}
            y={y}
            width={barWidth}
            height={height}
            fill={fill}
          />
        );
      }}
    />
  </BarChart>
</ResponsiveContainer>
        </div>
  
        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detaylı Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Görev</TableHead>
                  <TableHead>Tip</TableHead>
         
                  <TableHead>Süre (Gün)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ganttData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type === 'Screen' ? 'Ekran' : 'Görev'}</TableCell>
 
                    <TableCell>{item.duration}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={3}>Toplam Süre</TableCell>
                  <TableCell colSpan={2}>
                    {totalDays} gün ({formatDate(startDate)} - {formatDate(projectEndDate)})
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };


  return (
    <div className="space-y-8 p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Proje Efor Planlama Aracı</CardTitle>
            <div className="space-x-2">
              <Button onClick={exportProject}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => document.getElementById('import-input').click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                id="import-input"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importProject}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="planning" className="space-y-6">
            <TabsList>
              <TabsTrigger value="planning">Planlama</TabsTrigger>
              <TabsTrigger value="summary">Özet</TabsTrigger>
            </TabsList>

            <TabsContent value="planning">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Proje Adı</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Proje adını giriniz"
                    className="mt-1"
                  />
                </div>

                {/* Ekran Grupları */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ekranlar</h3>
                  <div className="space-y-4">
                    {screenGroups.map(group => (
                      <Card key={group.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGroup(group.id)}
                                >
                                  {expandedGroups[group.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </Button>
                                <Input
                                  value={group.name}
                                  onChange={(e) => updateScreenGroup(group.id, 'name', e.target.value)}
                                  placeholder="Grup Adı"
                                  className="w-64"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteScreenGroup(group.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {expandedGroups[group.id] && (
                              <div className="pl-6">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Ekran Adı</TableHead>
                                      <TableHead>Karmaşıklık</TableHead>
                                      <TableHead>Efor (Gün)</TableHead>
                                      <TableHead></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.screens.map(screen => (
                                      <TableRow key={screen.id}>
                                        <TableCell>
                                          <Input
                                            value={screen.name}
                                            onChange={(e) => updateScreen(group.id, screen.id, 'name', e.target.value)}
                                            placeholder="Ekran adı"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Select
                                            value={screen.complexity}
                                            onValueChange={(value) => updateScreen(group.id, screen.id, 'complexity', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="easy">Kolay</SelectItem>
                                              <SelectItem value="simple">Basit</SelectItem>
                                              <SelectItem value="normal">Normal</SelectItem>
                                              <SelectItem value="complex">Karmaşık</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            step="0.1"
                                            value={screen.effortDays}
                                            onChange={(e) => updateScreen(group.id, screen.id, 'effortDays', e.target.value)}
                                            placeholder="0"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => deleteScreen(group.id, screen.id)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                <Button 
                                  onClick={() => addScreen(group.id)} 
                                  className="mt-4 w-full"
                                  variant="outline"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Ekran Ekle
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button 
                      onClick={addScreenGroup}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ekran Grubu Ekle
                    </Button>
                  </div>
                </div>

                {/* Görev Grupları */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ortak Görevler</h3>
                  <div className="space-y-4">
                    {taskGroups.map(group => (
                      <Card key={group.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGroup(group.id)}
                                >
                                  {expandedGroups[group.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </Button>
                                <Input
                                  value={group.name}
                                  onChange={(e) => updateTaskGroup(group.id, 'name', e.target.value)}
                                  placeholder="Grup Adı"
                                  className="w-64"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTaskGroup(group.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {expandedGroups[group.id] && (
                              <div className="pl-6">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Görev Adı</TableHead>
                                      <TableHead>Efor (Gün)</TableHead>
                                      <TableHead></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.tasks.map(task => (
                                      <TableRow key={task.id}>
                                        <TableCell>
                                          <Input
                                            value={task.name}
                                            onChange={(e) => updateTask(group.id, task.id, 'name', e.target.value)}
                                            placeholder="Görev adı"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            step="0.1"
                                            value={task.effortDays}
                                            onChange={(e) => updateTask(group.id, task.id, 'effortDays', e.target.value)}
                                            placeholder="0"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => deleteTask(group.id, task.id)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                <Button 
                                  onClick={() => addTask(group.id)} 
                                  className="mt-4 w-full"
                                  variant="outline"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Görev Ekle
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button 
                      onClick={addTaskGroup}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Görev Grubu Ekle
                    </Button>
                  </div>
                </div>

                {/* Tatil Günleri */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Resmi Tatil Günleri</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Tatil Günlerini Seç</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Tatil Günleri</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="multiple"
                        selected={holidays}
                        onSelect={setHolidays}
                        className="rounded-md border"
                      />
                    </DialogContent>
                  </Dialog>
                  <div className="mt-2">
                    Seçili tatil günü sayısı: {holidays.length}
                  </div>
                </div>

                {/* Buffer ve Takım Boyutu */}
               {/* Buffer ve Takım Boyutu */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="text-sm font-medium">Buffer Yüzdesi (%)</label>
    <Input
      type="number"
      min="0" // minimum değer 0 olabilir
      max="100" // maksimum değer 100 olsun
      value={bufferPercentage}
      onChange={(e) => setBufferPercentage(Math.max(0, Number(e.target.value)))} // negatif değerleri engelle
      className="mt-1"
    />
  </div>
  <div>
    <label className="text-sm font-medium">Takım Boyutu</label>
    <Input
      type="number"
      min="1" // en az 1 kişi olmalı
      value={teamSize}
      onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
      className="mt-1"
    />
  </div>
</div>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-6">
              <Card>
      <CardHeader>
        <CardTitle>Proje Özeti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Ekranlar</h4>
            <div className="space-y-1">
              <p>Toplam Grup: {summaryData.totalScreenGroups}</p>
              <p>Toplam Ekran: {summaryData.totalScreens}</p>
              <p>Toplam Efor: {summaryData.screenEffort.toFixed(1)} gün</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ortak Görevler</h4>
            <div className="space-y-1">
              <p>Toplam Grup: {summaryData.totalTaskGroups}</p>
              <p>Toplam Görev: {summaryData.totalTasks}</p>
              <p>Toplam Efor: {summaryData.taskEffort.toFixed(1)} gün</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Toplam Efor Dağılımı</h4>
          <div className="space-y-1">
            <p>Alt Toplam: {summaryData.totalEffort.toFixed(1)} gün</p>
            <p>Buffer (%{bufferPercentage}): {summaryData.bufferDays.toFixed(1)} gün</p>
            <p className="font-bold">Genel Toplam: {summaryData.finalEffort.toFixed(1)} gün</p>
            <p>Tahmini Süre: {calculateEstimatedDuration()} gün</p>
            <p>Tatil Günleri: {holidays.length} gün</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <GanttSection />

              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEstimationTool;