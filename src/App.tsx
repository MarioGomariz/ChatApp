import { useState } from 'react';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceTable } from './components/AttendanceTable';
import { MonthlyReport } from './components/MonthlyReport';
import { AnnualReport } from './components/AnnualReport';
import { Calendar, FileText, BarChart3, TrendingUp } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'table' | 'monthly' | 'annual'>('form');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [annualReportYear, setAnnualReportYear] = useState(new Date().getFullYear());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sistema de Asistencia</h1>
        
        {/* Tabs de navegación */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } cursor-pointer`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Registro
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } cursor-pointer`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Tabla
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } cursor-pointer`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reporte Mensual
            </button>
            <button
              onClick={() => setActiveTab('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } cursor-pointer`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Reporte Anual
            </button>
          </div>
        </div>

        {/* Contenido dinámico */}
        {activeTab === 'form' && (
          <AttendanceForm onSuccess={() => setActiveTab('table')} />
        )}
        
        {activeTab === 'table' && <AttendanceTable />}
        
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* Selector de mes y año con botón */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generar Reporte Mensual</h3>
                <button
                  onClick={() => {
                    // Disparar el evento para que MonthlyReport genere el reporte
                    const event = new CustomEvent('generateReport', { detail: { month: reportMonth, year: reportYear } });
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Generar Reporte
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Enero</option>
                    <option value={2}>Febrero</option>
                    <option value={3}>Marzo</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Mayo</option>
                    <option value={6}>Junio</option>
                    <option value={7}>Julio</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Septiembre</option>
                    <option value={10}>Octubre</option>
                    <option value={11}>Noviembre</option>
                    <option value={12}>Diciembre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <input
                    type="number"
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    min="2020"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Componente de reporte mensual */}
            <MonthlyReport year={reportYear} month={reportMonth} />
          </div>
        )}
        
        {activeTab === 'annual' && (
          <div className="space-y-6">
            {/* Selector de año con botón */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generar Reporte Anual</h3>
                <button
                  onClick={() => {
                    // Disparar el evento para que AnnualReport genere el reporte
                    const event = new CustomEvent('generateAnnualReport', { detail: { year: annualReportYear } });
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  Generar Reporte Anual
                </button>
              </div>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">Año de servicio</label>
                <input
                  type="number"
                  value={annualReportYear}
                  onChange={(e) => setAnnualReportYear(Number(e.target.value))}
                  min="2020"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">El año de servicio corre de septiembre a agosto</p>
              </div>
            </div>
            
            {/* Componente de reporte anual */}
            <AnnualReport />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
