import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Users, Video, TrendingUp, Edit, Trash2, Save, X } from 'lucide-react';
import { attendanceService } from '../services/api';
import type { MonthlyAttendance, YearlyAttendance } from '../types/attendance';

export function AttendanceTable() {
  const [yearlyData, setYearlyData] = useState<YearlyAttendance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    salonAttendance: '',
    zoomAttendance: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (year?: number) => {
    const targetYear = year ?? expandedYear ?? selectedYear;
    try {
      setLoading(true);
      const [yearly, monthly] = await Promise.all([
        attendanceService.getYearlyAttendance(),
        attendanceService.getMonthlyAttendance(targetYear),
      ]);
      setYearlyData(yearly);
      setMonthlyData(monthly);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expandedYear !== null) {
      loadMonthlyData(expandedYear);
    }
  }, [expandedYear]);

  const loadMonthlyData = async (year: number) => {
    try {
      const monthly = await attendanceService.getMonthlyAttendance(year);
      setMonthlyData(monthly);
    } catch (error) {
      console.error('Error loading monthly data:', error);
    }
  };

  const toggleYear = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
      setSelectedYear(year);
    }
  };

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record.id);
    setEditForm({
      salonAttendance: record.salonAttendance.toString(),
      zoomAttendance: record.zoomAttendance.toString()
    });
  };

  const handleSave = async (recordId: string) => {
    try {
      console.log("editForm", editForm);
      await attendanceService.updateAttendance(recordId, {
        salonAttendance: parseInt(editForm.salonAttendance),
        zoomAttendance: parseInt(editForm.zoomAttendance)
      });
      console.log("editForm 2", editForm);
      setEditingRecord(null);
      loadData(expandedYear ?? selectedYear);
    } catch (error) {
      console.error('Error updating record:', error);
    }
    finally {
      console.log("editForm 3", editForm);
      setEditingRecord(null);
      setEditForm({ salonAttendance: '', zoomAttendance: '' });
    }
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        await attendanceService.deleteAttendance(recordId);
        loadData(expandedYear ?? selectedYear);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setEditForm({ salonAttendance: '', zoomAttendance: '' });
  };

  const monthOrder = [
    'septiembre', 'octubre', 'noviembre', 'diciembre',
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto'
  ];

  const sortedMonthlyData = monthlyData.sort((a, b) => {
    return monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase());
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Registro de Asistencia
      </h2>

      {/* Yearly Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Resumen Anual</h3>
        <div className="space-y-2">
          {yearlyData.map((year) => (
            <div key={year.year} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleYear(year.year)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {expandedYear === year.year ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-800">{year.year}</span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">
                  Total: {year.total}
                </div>
              </div>
              </button>

              {expandedYear === year.year && (
                <div className="border-t border-gray-200">
                  {/* Monthly Summary */}
                  <div className="p-4">
                    <h4 className="font-semibold mb-3 text-gray-700">Mensuales</h4>
                    <div className="space-y-2">
                      {sortedMonthlyData.map((month) => (
                        <div key={month.month} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleMonth(month.month)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                {expandedMonths.has(month.month) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="capitalize text-gray-700 font-medium">{month.month}</span>
                              </div>
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                                Total: {month.total}
                              </div>
                            </div>
                          </button>

                          {expandedMonths.has(month.month) && (
                            <div className="border-t border-gray-200">
                              <div className="p-4">
                                <h5 className="font-semibold mb-3 text-gray-700">Detalles Diarios</h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-2 w-1/5">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Fecha
                                          </div>
                                        </th>
                                        <th className="text-left py-2 px-2 w-1/5">
                                          <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Salón
                                          </div>
                                        </th>
                                        <th className="text-left py-2 px-2 w-1/5">
                                          <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4" />
                                            Zoom
                                          </div>
                                        </th>
                                        <th className="text-left py-2 px-2 w-1/6 font-semibold">Total</th>
                                        <th className="text-left py-2 px-2 w-1/6 font-semibold">Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {month.records.map((record) => (
                                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="py-2 px-2 w-1/5">
                                            {(() => {
                                              const date = new Date(record.date + 'T00:00:00');
                                              return date.toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                              });
                                            })()}
                                          </td>
                                          <td className="py-2 px-2 w-1/5">
                                            {editingRecord === record.id ? (
                                              <input
                                                type="number"
                                                value={editForm.salonAttendance}
                                                onChange={(e) => setEditForm({...editForm, salonAttendance: e.target.value})}
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                min="0"
                                              />
                                            ) : (
                                              record.salonAttendance
                                            )}
                                          </td>
                                          <td className="py-2 px-2 w-1/5">
                                            {editingRecord === record.id ? (
                                              <input
                                                type="number"
                                                value={editForm.zoomAttendance}
                                                onChange={(e) => setEditForm({...editForm, zoomAttendance: e.target.value})}
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                min="0"
                                              />
                                            ) : (
                                              record.zoomAttendance
                                            )}
                                          </td>
                                          <td className="py-2 px-2 w-1/6 font-semibold">
                                            {editingRecord === record.id 
                                              ? parseInt(editForm.salonAttendance) + parseInt(editForm.zoomAttendance)
                                              : record.totalAttendance
                                            }
                                          </td>
                                          <td className="py-2 px-2 w-1/6">
                                            {editingRecord === record.id ? (
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => handleSave(record.id)}
                                                  className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                                                  title="Guardar"
                                                >
                                                  <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={handleCancel}
                                                  className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                  title="Cancelar"
                                                >
                                                  <X className="w-4 h-4" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => handleEdit(record)}
                                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                  title="Editar"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => handleDelete(record.id)}
                                                  className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                  title="Eliminar"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
