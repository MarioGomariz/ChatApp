import { useState } from 'react';
import { Calendar, Users, Video, Save, X } from 'lucide-react';
import { attendanceService } from '../services/api';
import type { CreateAttendanceDto } from '../types/attendance';

interface AttendanceFormProps {
  onSuccess: () => void;
}

export function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const getCurrentDateGMT3 = () => {
    const now = new Date();
    // Ajustar a GMT-3 (restando 3 horas)
    return new Date(now.getTime() - (3 * 60 * 60 * 1000));
  };

  const [formData, setFormData] = useState<CreateAttendanceDto>({
    date: getCurrentDateGMT3().toISOString().split('T')[0], // YYYY-MM-DD format in GMT-3
    salonAttendance: 0,
    zoomAttendance: 0,
  });
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      await attendanceService.createAttendance(formData);
      setFormData({
        date: getCurrentDateGMT3().toISOString().split('T')[0],
        salonAttendance: 0,
        zoomAttendance: 0,
      });
      setShowConfirm(false);
      onSuccess();
    } catch (err) {
      setError('Error al guardar la asistencia. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAttendance = formData.salonAttendance + formData.zoomAttendance;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Registrar Asistencia
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha (GMT-3)
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Salón
            </label>
            <input
              type="number"
              value={formData.salonAttendance}
              onChange={(e) => setFormData({ ...formData, salonAttendance: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Zoom
            </label>
            <input
              type="number"
              value={formData.zoomAttendance}
              onChange={(e) => setFormData({ ...formData, zoomAttendance: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-gray-800">
            Total: {totalAttendance}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar Registro</h3>
            <div className="space-y-2 mb-6">
              <p><strong>Fecha:</strong> {(() => {
              const date = new Date(formData.date + 'T00:00:00');
              return date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            })()}</p>
              <p><strong>Salón:</strong> {formData.salonAttendance}</p>
              <p><strong>Zoom:</strong> {formData.zoomAttendance}</p>
              <p><strong>Total:</strong> {totalAttendance}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={confirmSave}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
