import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { ReportService, type MonthlyReport } from '../services/reportService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyReportProps {
  year: number;
  month: number;
}

export function MonthlyReport({ year, month }: MonthlyReportProps) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const handleGenerateReport = async () => {
      setLoading(true);
      setError('');
      setShowReport(false);
      
      try {
        const monthlyReport = await ReportService.generateMonthlyReport(year, month);
        setReport(monthlyReport);
        setShowReport(true);
      } catch (err) {
        setError('Error al generar el reporte');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('generateReport', handleGenerateReport);
    
    return () => {
      window.removeEventListener('generateReport', handleGenerateReport);
    };
  }, [year, month]);

  const generatePDF = async () => {
    if (!report) return;
    
    setLoading(true);
    try {
      // Usamos 'p' para vertical, 'mm' y formato 'a4'
      const pdf = new jsPDF('p', 'mm', 'a4');

      // 1. Encabezados Superiores (Simulando la estructura de la imagen)
      
      // Mes y año
      pdf.setFontSize(12);
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthName = monthNames[month - 1];
      pdf.text(`Mes: ${monthName}`, 148, 31);

      // 2. Definición de la Tabla Principal
      // Mapeamos los datos de report.weeklyReports para las dos filas
      const entreSemana = ['reunion de entre semana', '', '', '', '', '', '', ''];
      const finSemana = ['reunion de fin de semana', '', '', '', '', '', '', ''];

      // Llenar datos por semana con valores correctos
      console.log('📊 DEBUG - Weekly Reports:', report.weeklyReports);
      
      report.weeklyReports.forEach((week) => {
        const columnIndex = week.week; // 1-5 para las columnas de semanas
        console.log(`Semana ${week.week}: ${week.weekMeetings}, Total: ${week.totalAttendance}, Columna: ${columnIndex}`);
        
        if (columnIndex <= 5) {
          if (week.weekMeetings === 'weekday') {
            entreSemana[columnIndex] = week.totalAttendance.toString();
            console.log(`✅ Entre semana - Columna ${columnIndex}: ${week.totalAttendance}`);
          } else {
            finSemana[columnIndex] = week.totalAttendance.toString();
            console.log(`✅ Fin de semana - Columna ${columnIndex}: ${week.totalAttendance}`);
          }
        }
      });
      
      console.log('📊 DEBUG - Entre semana array:', entreSemana);
      console.log('📊 DEBUG - Fin de semana array:', finSemana);

      // Calcular totales y promedios por tipo de reunión
      const weekdayTotal = report.weeklyReports
        .filter(w => w.weekMeetings === 'weekday')
        .reduce((sum, week) => sum + week.totalAttendance, 0);
      const weekdayAverage = report.weeklyReports
        .filter(w => w.weekMeetings === 'weekday')
        .length > 0 ? weekdayTotal / report.weeklyReports.filter(w => w.weekMeetings === 'weekday').length : 0;
      
      const weekendTotal = report.weeklyReports
        .filter(w => w.weekMeetings === 'weekend')
        .reduce((sum, week) => sum + week.totalAttendance, 0);
      const weekendAverage = report.weeklyReports
        .filter(w => w.weekMeetings === 'weekend')
        .length > 0 ? weekendTotal / report.weeklyReports.filter(w => w.weekMeetings === 'weekend').length : 0;

      // Asignar totales y promedios
      entreSemana[6] = weekdayTotal.toString();
      entreSemana[7] = weekdayAverage.toFixed(1);
      
      finSemana[6] = weekendTotal.toString();
      finSemana[7] = weekendAverage.toFixed(1);

      // 3. Renderizado de la Tabla usando autoTable para que se vea como la imagen
      autoTable(pdf, {
        startY: 40,
        head: [['', 'Primera semana', 'Segunda semana', 'Tercera semana', 'Cuarta semana', 'Quinta semana', 'Total', 'Promedio']],
        body: [entreSemana, finSemana],
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            halign: 'center',
            fontSize: 8
        },
        styles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
            halign: 'center',
            fontSize: 9
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }
        }
      });

      pdf.save(`Congregacion Oeste - Reporte Asistencia ${month}-${year}.pdf`);
    } catch (err) {
      setError('Error al generar PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Reporte Mensual</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showReport && report && (
        <div className="space-y-6">
          {/* Botón de exportar PDF */}
          <div className="flex justify-end">
            <button
              onClick={generatePDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Generando PDF...' : 'Exportar a PDF'}
            </button>
          </div>

          {/* Resumen general */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Resumen del Mes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Total Asistentes</div>
                <div className="text-2xl font-bold text-blue-600">{report.totalAttendance}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Promedio</div>
                <div className="text-2xl font-bold text-green-600">{report.averageAttendance.toFixed(1)}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Reun. Entre Semana</div>
                <div className="text-2xl font-bold text-purple-600">{report.weekdayMeetings}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-600">Reun. Fin de Semana</div>
                <div className="text-2xl font-bold text-orange-600">{report.weekendMeetings}</div>
              </div>
            </div>
          </div>

          {/* Reporte por semanas - Formato PDF */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Reporte por Semanas</h4>
            
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-700"></th>
                        <th className="text-center p-3 font-medium text-gray-700">Primera semana</th>
                        <th className="text-center p-3 font-medium text-gray-700">Segunda semana</th>
                        <th className="text-center p-3 font-medium text-gray-700">Tercera semana</th>
                        <th className="text-center p-3 font-medium text-gray-700">Cuarta semana</th>
                        <th className="text-center p-3 font-medium text-gray-700">Quinta semana</th>
                        <th className="text-center p-3 font-medium text-gray-700">Total</th>
                        <th className="text-center p-3 font-medium text-gray-700">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Fila de reuniones entre semana */}
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-800">reunion de entre semana</td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 1 && w.weekMeetings === 'weekday')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 2 && w.weekMeetings === 'weekday')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 3 && w.weekMeetings === 'weekday')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 4 && w.weekMeetings === 'weekday')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 5 && w.weekMeetings === 'weekday')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {report.weeklyReports
                            .filter(w => w.weekMeetings === 'weekday')
                            .reduce((sum, week) => sum + week.totalAttendance, 0)}
                        </td>
                        <td className="p-3 text-center">
                          {(() => {
                            const weekdayWeeks = report.weeklyReports.filter(w => w.weekMeetings === 'weekday');
                            const total = weekdayWeeks.reduce((sum, week) => sum + week.totalAttendance, 0);
                            return weekdayWeeks.length > 0 ? (total / weekdayWeeks.length).toFixed(1) : '0';
                          })()}
                        </td>
                      </tr>
                      
                      {/* Fila de reuniones fin de semana */}
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-800">reunion de fin de semana</td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 1 && w.weekMeetings === 'weekend')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 2 && w.weekMeetings === 'weekend')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 3 && w.weekMeetings === 'weekend')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 4 && w.weekMeetings === 'weekend')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {report.weeklyReports.find(w => w.week === 5 && w.weekMeetings === 'weekend')?.totalAttendance || '-'}
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {report.weeklyReports
                            .filter(w => w.weekMeetings === 'weekend')
                            .reduce((sum, week) => sum + week.totalAttendance, 0)}
                        </td>
                        <td className="p-3 text-center">
                          {(() => {
                            const weekendWeeks = report.weeklyReports.filter(w => w.weekMeetings === 'weekend');
                            const total = weekendWeeks.reduce((sum, week) => sum + week.totalAttendance, 0);
                            return weekendWeeks.length > 0 ? (total / weekendWeeks.length).toFixed(1) : '0';
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
