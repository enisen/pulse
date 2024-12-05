/* eslint @typescript-eslint/no-explicit-any: 0 */  // --> OFF
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react";

// Veri tipleri
interface Team {
  id: string;
  name: string;
  startDate: Date;
  effort: number;
  isParallel: boolean;
}

interface SubTask {
  id: string;
  name: string;
  description: string;
  teams: Team[];
  dependencies: string[];
}

interface Task {
  id: string;
  name: string;
  description: string;
  subTasks: SubTask[];
  dependencies: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

const ProjectPlanner = () => {
  const [project, setProject] = useState<Project>({
    id: "1",
    name: "",
    description: "",
    tasks: [],
  });

  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  // İş günü hesaplama yardımcı fonksiyonu
  const addBusinessDays = (startDate: Date, days: number): Date => {
    const end = new Date(startDate);
    let businessDays = 0;
    while (businessDays < days) {
      end.setDate(end.getDate() + 1);
      if (end.getDay() !== 0 && end.getDay() !== 6) {
        businessDays++;
      }
    }
    return end;
  };

  const taskColors = {
    task: "#1e293b", // Koyu slate rengi
    subtask: "#475569", // Orta koyu slate rengi
  };

  // Güvenli tarih formatı dönüşümü
  const safeDateToISOString = (date: Date | string | null): string => {
    if (!date) return "";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const prepareGanttData = () => {
    // Takım renklerini tut
    const teamColors = new Map<string, string>();
    const colors = [
      "#2563eb",
      "#16a34a",
      "#dc2626",
      "#9333ea",
      "#ea580c",
      "#0891b2",
      "#4f46e5",
      "#be123c",
    ];
    let colorIndex = 0;

    // Önce tüm takımları topla ve renk ata
    project.tasks.forEach((task) => {
      task.subTasks.forEach((subTask) => {
        subTask.teams.forEach((team) => {
          if (!teamColors.has(team.name)) {
            teamColors.set(team.name, colors[colorIndex % colors.length]);
            colorIndex++;
          }
        });
      });
    });

    const flattenedTasks: any[] = [];
    let minDate: Date | null | any = null;
    let maxDate: Date | null | any = null;

    // Ana taskları işle
    project.tasks.forEach((task) => {
      let taskStartDate: Date | null | any = null;
      let taskEndDate: Date | null | any = null;

      // Önce tüm alt taskları ve takımları işleyerek ana task'ın tarih aralığını bul
      task.subTasks.forEach((subTask) => {
        subTask.teams.forEach((team) => {
          const startDate = new Date(team.startDate);
          const endDate = addBusinessDays(startDate, team.effort);

          if (!taskStartDate || startDate < taskStartDate)
            taskStartDate = startDate;
          if (!taskEndDate || endDate > taskEndDate) taskEndDate = endDate;
          if (!minDate || startDate < minDate) minDate = startDate;
          if (!maxDate || endDate > maxDate) maxDate = endDate;
        });
      });

      if (taskStartDate && taskEndDate) {
        // 1. Ana task'ı ekle
        flattenedTasks.push({
          id: `task-${task.id}`,
          taskName: task.name,
          startDate: taskStartDate.getTime(), 
          endDate: taskEndDate.getTime(),
          level: 0,
          color: "#1e293b",
          isHeader: true,
        });

        // 2. Alt taskları ve takımları ekle
        task.subTasks.forEach((subTask) => {
          let subTaskStartDate: Date | null | any = null;
          let subTaskEndDate: Date | null | any = null;

          // Alt task'ın tarih aralığını bul
          subTask.teams.forEach((team) => {
            const startDate = new Date(team.startDate);
            const endDate = addBusinessDays(startDate, team.effort);

            if (!subTaskStartDate || startDate < subTaskStartDate)
              subTaskStartDate = startDate;
            if (!subTaskEndDate || endDate > subTaskEndDate)
              subTaskEndDate = endDate;
          });

          if (subTaskStartDate && subTaskEndDate) {
            // Alt task'ı ekle
            flattenedTasks.push({
              id: `subtask-${task.id}-${subTask.id}`,
              taskName: subTask.name,
              startDate: subTaskStartDate.getTime(),
              endDate: subTaskEndDate.getTime(),
              level: 1,
              color: "#64748b",
              isHeader: true,
              parentId: `task-${task.id}`,
            });

            // Takımları ekle
            subTask.teams.forEach((team) => {
              const startDate = new Date(team.startDate);
              const endDate = addBusinessDays(startDate, team.effort);

              flattenedTasks.push({
                id: `team-${task.id}-${subTask.id}-${team.id}`,
                taskName: team.name,
                startDate: startDate.getTime(),
                endDate: endDate.getTime(),
                effort: team.effort,
                isParallel: team.isParallel,
                level: 2,
                color: teamColors.get(team.name),
                parentId: `subtask-${task.id}-${subTask.id}`,
                parentName: subTask.name,
              });
            });
          }
        });
      }
    });

    return {
      tasks: flattenedTasks,
      minDate: minDate?.getTime() || Date.now(),
      maxDate: maxDate?.getTime() || Date.now(),
      teamColors: Array.from(teamColors.entries()).map(([name, color]) => ({
        name,
        color,
      })),
    };
  };

  // Yardımcı fonksiyonlar
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Task işlemleri
  const addTask = () => {
    const newTask: Task = {
      id: generateId(),
      name: "",
      description: "",
      subTasks: [],
      dependencies: [],
    };
    setProject((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  // SubTask işlemleri
  const addSubTask = (taskId: string) => {
    const newSubTask: SubTask = {
      id: generateId(),
      name: "",
      description: "",
      teams: [],
      dependencies: [],
    };

    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, subTasks: [...task.subTasks, newSubTask] }
          : task
      ),
    }));
  };

  const updateSubTask = (
    taskId: string,
    subTaskId: string,
    updates: Partial<SubTask>
  ) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId ? { ...subTask, ...updates } : subTask
              ),
            }
          : task
      ),
    }));
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.filter(
                (subTask) => subTask.id !== subTaskId
              ),
            }
          : task
      ),
    }));
  };

  // Takım işlemleri
  const addTeam = (taskId: string, subTaskId: string) => {
    const newTeam: Team = {
      id: generateId(),
      name: "",
      startDate: new Date(),
      effort: 0,
      isParallel: false,
    };

    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? { ...subTask, teams: [...subTask.teams, newTeam] }
                  : subTask
              ),
            }
          : task
      ),
    }));
  };

  const updateTeam = (
    taskId: string,
    subTaskId: string,
    teamId: string,
    updates: Partial<Team>
  ) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? {
                      ...subTask,
                      teams: subTask.teams.map((team) =>
                        team.id === teamId
                          ? {
                              ...team,
                              ...updates,
                              // Tarih güncellemesini güvenli hale getir
                              startDate: updates.startDate
                                ? new Date(updates.startDate)
                                : team.startDate,
                            }
                          : team
                      ),
                    }
                  : subTask
              ),
            }
          : task
      ),
    }));
  };

  const deleteTeam = (taskId: string, subTaskId: string, teamId: string) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? {
                      ...subTask,
                      teams: subTask.teams.filter((team) => team.id !== teamId),
                    }
                  : subTask
              ),
            }
          : task
      ),
    }));
  };

  // JSON Import/Export
  const exportToJson = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name || "project"}_plan.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProject = JSON.parse(e.target?.result as string);
          setProject(importedProject);
        } catch (error) {
          console.error("JSON parse error:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Proje süresini hesaplama
  const calculateProjectDuration = () => {
    let earliestStart = new Date();
    let latestEnd = new Date();
    let hasStartDate = false;

    project.tasks.forEach((task) => {
      task.subTasks.forEach((subTask) => {
        subTask.teams.forEach((team) => {
          const startDate = new Date(team.startDate);
          // addBusinessDays fonksiyonunu kullanarak endDate'i hesaplamalıyız
          const endDate = addBusinessDays(startDate, team.effort);

          if (!hasStartDate || startDate < earliestStart) {
            earliestStart = startDate;
            hasStartDate = true;
          }
          if (endDate > latestEnd) {
            latestEnd = endDate;
          }
        });
      });
    });

    if (!hasStartDate) return "Henüz başlangıç tarihi girilmemiş";

    const diffTime = Math.abs(latestEnd.getTime() - earliestStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${earliestStart.toLocaleDateString()} - ${latestEnd.toLocaleDateString()} (${diffDays} gün)`;
  };

  // Özet ve Gantt Chart Komponenti
  // ProjectSummaryAndGantt komponenti (güncellendi)
  const ProjectSummaryAndGantt = () => {
    const ganttData = prepareGanttData();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [activeSubTaskId, setActiveSubTaskId] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Tüm unique takımları bul
    const uniqueTeams = Array.from(
      new Set(
        ganttData.tasks
          .filter((task) => task.level === 2)
          .map((task) => task.taskName)
      )
    );

    // Takım bazlı Gantt data hazırlama
    const prepareTeamGanttData = (teamName: string) => {
      const teamTasks = ganttData.tasks
        .filter((task) => task.level === 2 && task.taskName === teamName)
        .map((teamTask) => {
          // Ana task ve subtask bilgilerini bul
          const parentSubTask = ganttData.tasks.find(
            (t) => t.id === teamTask.parentId
          );
          const parentTask = ganttData.tasks.find(
            (t) => t.id === parentSubTask?.parentId
          );

          return {
            ...teamTask,
            taskName: `${parentTask?.taskName} > ${parentSubTask?.taskName}`,
            startDate: teamTask.startDate,
            endDate: teamTask.endDate,
            color: teamTask.color,
          };
        })
        // Başlangıç tarihine göre sırala (en eski tarih en üstte)
        .sort((a, b) => a.startDate - b.startDate);

      return {
        tasks: teamTasks,
        minDate: ganttData.minDate,
        maxDate: ganttData.maxDate,
      };
    };

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };


    const getParentTaskName = (task: any) => {
      // Önce parent subtask'ı bul
      const parentSubTask = ganttData.tasks.find((t) => t.id === task.parentId);

      // Sonra parent task'ı bul
      const parentTask = ganttData.tasks.find(
        (t) => t.id === parentSubTask?.parentId
      );

      return parentTask?.taskName || "-";
    };

    const getDateTicks = (minDate: number, maxDate: number) => {
      const startDate = new Date(minDate);
      const endDate = new Date(maxDate);
      const diffDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Proje süresine göre tick aralığını belirle
      let interval;
      if (diffDays <= 14) {
        // 2 hafta veya daha az
        interval = 1; // Her gün
      } else if (diffDays <= 60) {
        // 2 ay veya daha az
        interval = 7; // Her hafta
      } else if (diffDays <= 180) {
        // 6 ay veya daha az
        interval = 14; // 2 haftada bir
      } else {
        interval = 30; // Her ay
      }

      const ticks = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        ticks.push(currentDate.getTime());
        currentDate.setDate(currentDate.getDate() + interval);
      }

      return ticks;
    };

    const formatTaskName = (task: any) => {
      if (task.level === 0) return `mainTask:${task.taskName}`; // Ana task için özel format
      if (task.level === 1) return `subTask:${task.taskName}`; // SubTask için özel format
      if (task.level === 2)
        return `color:${task.color}      ${task.teamName || task.taskName}`; // Team için mevcut format
      return task.taskName;
    };

    const customYAxisTick = (props: any) => {
      const { x, y, payload } = props;
      const task = ganttData.tasks[payload.index];
      const formattedText = formatTaskName(task);

      let text = formattedText;
      let style: React.CSSProperties = {
        transition: "all 0.3s ease",
      };

      // Ana task için stil
      if (formattedText.startsWith("mainTask:")) {
        text = formattedText.replace("mainTask:", "");
        style = {
          ...style,
          fontSize: "15px", // Ana task font boyutunu biraz daha büyüttüm
          fontWeight: "bold",
          fill: "#1e293b",
          letterSpacing: "0.05em",
        };
      }
      // Subtask için stil
      else if (formattedText.startsWith("subTask:")) {
        text = formattedText.replace("subTask:", "");
        style = {
          ...style,
          fontSize: "13px", // Subtask font boyutunu artırdım
          fontWeight: "bold", // Bold yaptım
          fill: "#64748b", // Biraz daha açık bir renk
          transform: `translate(12, 0)`,
        };
      }
      // Takım için stil
      else if (formattedText.startsWith("color:")) {
        const [colorPart, textPart] = formattedText.split("      ");
        const color = colorPart.replace("color:", "");
        text = textPart;
        style = {
          ...style,
          fontSize: "12px",
          fontWeight: "normal", // Normal weight ile takımları ayırdık
          fill: color,
          transform: `translate(24, 0)`,
        };
      }

      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={4} textAnchor="end" style={style}>
            {text}
          </text>
        </g>
      );
    };

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Proje Özeti ve Zaman Çizelgesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Temel Metrikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">Toplam Task</div>
                  <div className="text-2xl font-bold">
                    {project.tasks.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">Alt Tasklar</div>
                  <div className="text-2xl font-bold">
                    {project.tasks.reduce(
                      (acc, task) => acc + task.subTasks.length,
                      0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">Takımlar</div>
                  <div className="text-2xl font-bold">{getUniqueTeams()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">Proje Süresi</div>
                  <div className="text-xl font-bold">
                    {calculateProjectDuration()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Takım Renk Listesi */}
            <div className="mb-4 flex flex-wrap gap-4">
              {ganttData.teamColors.map(({ name, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>

            {/* Gantt Chart */}

            {/* Tabs */}
            <Tabs defaultValue="overall" className="w-full">
              <TabsList className="w-full flex-wrap h-auto">
                <TabsTrigger value="overall" className="flex-grow">
                  Genel Görünüm
                </TabsTrigger>
                {uniqueTeams.map((team) => (
                  <TabsTrigger key={team} value={team} className="flex-grow">
                    {team}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Genel Görünüm Tab */}
              <TabsContent value="overall">
                <div className="h-[5000px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ganttData.tasks}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                    >
                      {/* Grid lines için */}
                      <CartesianGrid
                        strokeDasharray="3 3" // Kesikli çizgi stili
                        horizontal={false} // Sadece dikey grid lines istiyoruz
                        stroke="#e2e8f0" // Açık gri ton
                      />
                      {/* Alttaki X ekseni */}
                      <XAxis
                        type="number"
                        domain={[ganttData.minDate, ganttData.maxDate]}
                        tickFormatter={(date) => {
                          return new Date(date).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                          });
                        }}
                        scale="time"
                        interval="preserveStartEnd"
                        tick={({ x, y, payload }) => (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="middle"
                              className="fill-slate-600"
                              style={{ fontSize: "12px" }}
                            >
                              {new Date(payload.value).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </text>
                          </g>
                        )}
                        ticks={getDateTicks(
                          ganttData.minDate,
                          ganttData.maxDate
                        )}
                        height={30}
                        padding={{ left: 10, right: 10 }}
                      />

                      {/* Üstteki X ekseni */}
                      <XAxis
                        xAxisId="top"
                        orientation="top"
                        type="number"
                        domain={[ganttData.minDate, ganttData.maxDate]}
                        tickFormatter={(date) => {
                          return new Date(date).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                          });
                        }}
                        scale="time"
                        interval="preserveStartEnd"
                        tick={({ x, y, payload }) => (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={-8}
                              textAnchor="middle"
                              className="fill-slate-600"
                              style={{ fontSize: "12px" }}
                            >
                              {new Date(payload.value).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </text>
                          </g>
                        )}
                        ticks={getDateTicks(
                          ganttData.minDate,
                          ganttData.maxDate
                        )}
                        height={30}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="taskName"
                        width={200}
                        tick={customYAxisTick}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!payload || !payload.length) return null;
                          const data = payload[0].payload;

                          // Ana task tooltip'i - sadece click durumunda
                          if (data.level === 0 && data.id === selectedItemId) {
                            const relatedSubtasks = ganttData.tasks.filter(
                              (t) => t.level === 1 && t.parentId === data.id
                            );
                            const relatedTeams = ganttData.tasks.filter(
                              (t) =>
                                t.level === 2 &&
                                relatedSubtasks.some((s) => s.id === t.parentId)
                            );

                            const totalEffort = relatedTeams.reduce(
                              (sum, team) => sum + (team.effort || 0),
                              0
                            );

                            return (
                              <div className="bg-white p-4 border rounded shadow min-w-[300px]">
                                <p className="font-bold text-lg mb-2">
                                  {data.taskName}
                                </p>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-medium mb-1">
                                      Alt Görevler:
                                    </p>
                                    <div className="pl-2 space-y-1">
                                      {relatedSubtasks.map((subtask) => {
                                        const teamList = ganttData.tasks.filter(
                                          (t) =>
                                            t.level === 2 &&
                                            t.parentId === subtask.id
                                        );
                                        const subtaskEffort = teamList.reduce(
                                          (sum, team) =>
                                            sum + (team.effort || 0),
                                          0
                                        );

                                        return (
                                          <div
                                            key={subtask.id}
                                            className="text-sm"
                                          >
                                            <p className="font-medium">
                                              {subtask.taskName}
                                            </p>
                                            <div className="pl-2">
                                              {teamList.map((team) => (
                                                <div
                                                  key={team.id}
                                                  className="flex justify-between items-center"
                                                >
                                                  <span className="flex items-center gap-2">
                                                    <div
                                                      className="w-2 h-2 rounded-full"
                                                      style={{
                                                        backgroundColor:
                                                          team.color,
                                                      }}
                                                    />
                                                    <span>{team.taskName}</span>
                                                  </span>
                                                  <span>{team.effort} gün</span>
                                                </div>
                                              ))}
                                              <div className="flex justify-between text-sm font-medium text-slate-600 mt-1 pt-1 border-t">
                                                <span>Alt Task Toplam:</span>
                                                <span>{subtaskEffort} gün</span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t">
                                    <div className="flex justify-between font-bold">
                                      <span>Toplam Efor:</span>
                                      <span>{totalEffort} gün</span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 pt-2 border-t">
                                    {formatDate(data.startDate)} -{" "}
                                    {formatDate(data.endDate)}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Subtask tooltip'i - hover durumunda
                          if (active && data.level === 1) {
                            const teamList = ganttData.tasks.filter(
                              (t) => t.level === 2 && t.parentId === data.id
                            );
                            const subtaskEffort = teamList.reduce(
                              (sum, team) => sum + (team.effort || 0),
                              0
                            );

                            return (
                              <div className="bg-white p-3 border rounded shadow min-w-[280px]">
                                <p className="font-bold text-lg mb-1">
                                  Alt Görev
                                </p>
                                <p className="mb-3">{data.taskName}</p>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-gray-600 border-b pb-1">
                                    <span>Takım</span>
                                    <span>Efor (Gün)</span>
                                  </div>
                                  {teamList.map((team) => (
                                    <div
                                      key={team.id}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor: team.color,
                                          }}
                                        />
                                        <span>{team.taskName}</span>
                                      </span>
                                      <span className="font-medium">
                                        {team.effort}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between pt-2 mt-2 border-t text-sm font-bold">
                                    <span>Toplam Efor:</span>
                                    <span>{subtaskEffort} gün</span>
                                  </div>
                                </div>

                                <p className="text-sm mt-3 pt-2 border-t text-gray-600">
                                  {formatDate(data.startDate)} -{" "}
                                  {formatDate(data.endDate)}
                                </p>
                              </div>
                            );
                          }

                          // Takım tooltip'i - hover durumunda
                          if (active && data.level === 2) {
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <p className="font-bold">{data.taskName}</p>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  Alt Görev: {data.parentName}
                                </p>
                                <p className="text-sm font-medium">
                                  Efor: {data.effort} gün
                                </p>
                                {data.isParallel && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    Paralel Çalışma
                                  </p>
                                )}
                                <p className="text-sm mt-2 text-gray-600">
                                  {formatDate(data.startDate)} -{" "}
                                  {formatDate(data.endDate)}
                                </p>
                              </div>
                            );
                          }

                          return null;
                        }}
                      />
                      <Bar
                        dataKey={(entry) => [entry.startDate, entry.endDate]}
                        name="Süre"
                        minPointSize={2}
                        onMouseEnter={(data: any) => {
                          if (data && data.payload) {
                            if (data.payload.level === 0) {
                              setActiveTaskId(data.payload.id);
                              setActiveSubTaskId(null);
                            } else if (data.payload.level === 1) {
                              setActiveSubTaskId(data.payload.id);
                              setActiveTaskId(null);
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          setActiveTaskId(null);
                          setActiveSubTaskId(null);
                        }}
                        onClick={(data: any) => {
                          if (
                            data &&
                            data.payload &&
                            data.payload.level === 0
                          ) {
                            // Sadece ana task için
                            if (selectedItemId === data.payload.id) {
                              setSelectedItemId(null);
                            } else {
                              setSelectedItemId(data.payload.id);
                            }
                          }
                        }}
                      >
                        {ganttData.tasks.map((entry) => {
                          const isRelated = activeTaskId
                            ? entry.level === 0
                              ? entry.id === activeTaskId // Ana task için
                              : entry.level === 1
                              ? entry.parentId === activeTaskId // Subtask için
                              : ganttData.tasks.find(
                                  (t) => t.id === entry.parentId
                                )?.parentId === activeTaskId // Team için
                            : activeSubTaskId
                            ? entry.level === 1
                              ? entry.id === activeSubTaskId // Subtask için
                              : entry.level === 2
                              ? entry.parentId === activeSubTaskId // Team için
                              : false // Ana task için highlight yok
                            : false;

                          return (
                            <Cell
                              key={entry.id}
                              fill={
                                entry.level === 0
                                  ? taskColors.task
                                  : entry.level === 1
                                  ? taskColors.subtask
                                  : entry.color
                              }
                              opacity={
                                activeTaskId || activeSubTaskId
                                  ? isRelated
                                    ? 1
                                    : 0.2
                                  : entry.level < 2
                                  ? 0.9
                                  : entry.isParallel
                                  ? 0.7
                                  : 1
                              }
                              stroke="#000000"
                              strokeWidth={isRelated ? 1 : 0.5}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="fixed inset-0 z-[-1]"
                  style={{ display: selectedItemId ? "block" : "none" }}
                  onClick={() => setSelectedItemId(null)}
                />
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Alt Task</TableHead>
                        <TableHead>Takım</TableHead>
                        <TableHead>Başlangıç</TableHead>
                        <TableHead>Bitiş</TableHead>
                        <TableHead>İş Günü</TableHead>
                        {/* <TableHead>Paralel</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ganttData.tasks
                        .filter((task) => task.level === 2)
                        .map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>{getParentTaskName(task)}</TableCell>
                            <TableCell>{task.parentName}</TableCell>
                            <TableCell>{task.taskName}</TableCell>
                            <TableCell>{formatDate(task.startDate)}</TableCell>
                            <TableCell>{formatDate(task.endDate)}</TableCell>
                            <TableCell>{task.effort || "-"}</TableCell>
                            {/* <TableCell>{task.isParallel ? "Evet" : "Hayır"}</TableCell> */}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Takım bazlı Tablar */}
              {uniqueTeams.map((team) => {
                const teamData = prepareTeamGanttData(team);
                return (
                  <TabsContent key={team} value={team}>
                    <div className="h-[2000px] mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={teamData.tasks}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#e2e8f0"
                          />

                          {/* Alttaki X ekseni */}
                          <XAxis
                            type="number"
                            domain={[teamData.minDate, teamData.maxDate]}
                            tickFormatter={(date) => {
                              return new Date(date).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              );
                            }}
                            scale="time"
                            interval="preserveStartEnd"
                            tick={({ x, y, payload }) => (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={0}
                                  y={0}
                                  dy={16}
                                  textAnchor="middle"
                                  className="fill-slate-600"
                                  style={{ fontSize: "12px" }}
                                >
                                  {new Date(payload.value).toLocaleDateString(
                                    "tr-TR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    }
                                  )}
                                </text>
                              </g>
                            )}
                            ticks={getDateTicks(
                              teamData.minDate,
                              teamData.maxDate
                            )}
                            height={30}
                            padding={{ left: 10, right: 10 }}
                          />

                          {/* Üstteki X ekseni */}
                          <XAxis
                            xAxisId="top"
                            orientation="top"
                            type="number"
                            domain={[teamData.minDate, teamData.maxDate]}
                            tickFormatter={(date) => {
                              return new Date(date).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              );
                            }}
                            scale="time"
                            interval="preserveStartEnd"
                            tick={({ x, y, payload }) => (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={0}
                                  y={0}
                                  dy={-8}
                                  textAnchor="middle"
                                  className="fill-slate-600"
                                  style={{ fontSize: "12px" }}
                                >
                                  {new Date(payload.value).toLocaleDateString(
                                    "tr-TR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    }
                                  )}
                                </text>
                              </g>
                            )}
                            ticks={getDateTicks(
                              teamData.minDate,
                              teamData.maxDate
                            )}
                            height={30}
                            padding={{ left: 10, right: 10 }}
                          />

                          <YAxis
                            type="category"
                            dataKey="taskName"
                            width={200}
                            tick={({ x, y, payload }) => {
                              const task = payload.value;
                              // Ana task ve subtask'ı parçala
                              const [mainTask, subTask] = task.split(" > ");

                              return (
                                <g transform={`translate(${x},${y})`}>
                                  {/* Ana task */}
                                  <text
                                    x={0}
                                    y={-6}
                                    textAnchor="end"
                                    className="fill-slate-900 font-semibold"
                                    style={{ fontSize: "13px" }}
                                  >
                                    {mainTask}
                                  </text>
                                  {/* Alt task - daha küçük ve açık renkli */}
                                  <text
                                    x={0}
                                    y={8}
                                    textAnchor="end"
                                    className="fill-slate-600"
                                    style={{ fontSize: "11px" }}
                                  >
                                    {subTask}
                                  </text>
                                </g>
                              );
                            }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border rounded shadow">
                                    <p className="font-bold">{data.taskName}</p>
                                    <p className="text-sm mt-2">
                                      Efor: {data.effort} gün
                                    </p>
                                    {data.isParallel && (
                                      <p className="text-sm text-blue-600">
                                        Paralel Çalışma
                                      </p>
                                    )}
                                    <p className="text-sm mt-2 text-gray-600">
                                      {formatDate(data.startDate)} -{" "}
                                      {formatDate(data.endDate)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey={(entry) => [
                              entry.startDate,
                              entry.endDate,
                            ]}
                            name="Süre"
                          >
                            {teamData.tasks.map((entry) => (
                              <Cell
                                key={entry.id}
                                fill={entry.color}
                                opacity={entry.isParallel ? 0.7 : 0.9}
                                stroke="#000000"
                                strokeWidth={0.5}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Alt Task</TableHead>
                            <TableHead>Takım</TableHead>
                            <TableHead>Başlangıç</TableHead>
                            <TableHead>Bitiş</TableHead>
                            <TableHead>İş Günü</TableHead>
                            {/* <TableHead>Paralel</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ganttData.tasks
                            .filter(
                              (task) =>
                                task.level === 2 && task.taskName === team
                            )
                            .map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>{getParentTaskName(task)}</TableCell>
                                <TableCell>{task.parentName}</TableCell>
                                <TableCell>{task.taskName}</TableCell>
                                <TableCell>
                                  {formatDate(task.startDate)}
                                </TableCell>
                                <TableCell>
                                  {formatDate(task.endDate)}
                                </TableCell>
                                <TableCell>{task.effort || "-"}</TableCell>
                                {/* <TableCell>
                                  {task.isParallel ? "Evet" : "Hayır"}
                                </TableCell> */}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getUniqueTeams = () => {
    const teams = new Set();
    project.tasks.forEach((task) => {
      task.subTasks.forEach((subTask) => {
        subTask.teams.forEach((team) => {
          teams.add(team.name);
        });
      });
    });
    return teams.size;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Proje Planlama</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Proje Adı</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Proje adını giriniz"
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Proje Açıklaması</Label>
              <Textarea
                id="projectDescription"
                value={project.description}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Proje açıklamasını giriniz"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={exportToJson}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON Export
              </Button>
              <Button
                onClick={() => document.getElementById("fileInput")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                JSON Import
              </Button>
              <input
                id="fileInput"
                type="file"
                accept=".json"
                onChange={importFromJson}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Görevler</CardTitle>
          <Button onClick={addTask} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Görev Ekle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.tasks.map((task) => (
              <Card key={task.id} className="mb-4">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskExpand(task.id)}
                      >
                        {expandedTasks.includes(task.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <Input
                        value={task.name}
                        onChange={(e) =>
                          updateTask(task.id, { name: e.target.value })
                        }
                        placeholder="Görev adı"
                        className="max-w-md"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {expandedTasks.includes(task.id) && (
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Textarea
                        value={task.description}
                        onChange={(e) =>
                          updateTask(task.id, { description: e.target.value })
                        }
                        placeholder="Görev açıklaması"
                      />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">
                            Alt Görevler
                          </h4>
                          <Button
                            onClick={() => addSubTask(task.id)}
                            className="flex items-center gap-2"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                            Alt Görev Ekle
                          </Button>
                        </div>

                        {task.subTasks.map((subTask) => (
                          <Card key={subTask.id}>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <Input
                                    value={subTask.name}
                                    onChange={(e) =>
                                      updateSubTask(task.id, subTask.id, {
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder="Alt görev adı"
                                    className="max-w-md"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      deleteSubTask(task.id, subTask.id)
                                    }
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <Textarea
                                  value={subTask.description}
                                  onChange={(e) =>
                                    updateSubTask(task.id, subTask.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Alt görev açıklaması"
                                />

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-semibold">
                                      Takımlar
                                    </h5>
                                    <Button
                                      onClick={() =>
                                        addTeam(task.id, subTask.id)
                                      }
                                      size="sm"
                                      className="flex items-center gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Takım Ekle
                                    </Button>
                                  </div>

                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Takım Adı</TableHead>
                                        <TableHead>Başlangıç Tarihi</TableHead>
                                        <TableHead>Efor (Gün)</TableHead>
                                        <TableHead>Paralel Çalışma</TableHead>
                                        <TableHead>İşlemler</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {subTask.teams.map((team) => (
                                        <TableRow key={team.id}>
                                          <TableCell>
                                            <Input
                                              value={team.name}
                                              onChange={(e) =>
                                                updateTeam(
                                                  task.id,
                                                  subTask.id,
                                                  team.id,
                                                  { name: e.target.value }
                                                )
                                              }
                                              placeholder="Takım adı"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="date"
                                              value={safeDateToISOString(
                                                team.startDate
                                              )}
                                              onChange={(e) =>
                                                updateTeam(
                                                  task.id,
                                                  subTask.id,
                                                  team.id,
                                                  {
                                                    startDate: e.target.value
                                                      ? new Date(e.target.value)
                                                      : new Date(),
                                                  }
                                                )
                                              }
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              value={team.effort}
                                              onChange={(e) =>
                                                updateTeam(
                                                  task.id,
                                                  subTask.id,
                                                  team.id,
                                                  {
                                                    effort: Number(
                                                      e.target.value
                                                    ),
                                                  }
                                                )
                                              }
                                              min="0"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <input
                                              type="checkbox"
                                              checked={team.isParallel}
                                              onChange={(e) =>
                                                updateTeam(
                                                  task.id,
                                                  subTask.id,
                                                  team.id,
                                                  {
                                                    isParallel:
                                                      e.target.checked,
                                                  }
                                                )
                                              }
                                              className="w-4 h-4"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                deleteTeam(
                                                  task.id,
                                                  subTask.id,
                                                  team.id
                                                )
                                              }
                                              className="text-red-500"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <ProjectSummaryAndGantt />
    </div>
  );
};

export default ProjectPlanner;
