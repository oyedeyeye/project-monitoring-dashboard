import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { updateProject } from '../hooks/useProjects';
import { Project } from '../types/api';

const ONDO_LGAS = [
  'Statewide',
  'Akoko North-East',
  'Akoko North-West',
  'Akoko South-East',
  'Akoko South-West',
  'Akure North',
  'Akure South',
  'Ese Odo',
  'Idanre',
  'Ifedore',
  'Ilaje',
  'Ile Oluji/Okeigbo',
  'Irele',
  'Odigbo',
  'Okitipupa',
  'Ondo East',
  'Ondo West',
  'Ose',
  'Owo',
];

const SENATORIAL_DISTRICTS = [
  'Statewide',
  'Ondo North',
  'Ondo Central',
  'Ondo South',
];

const SECTORS = [
  'General',
  'Administration',
  'Agriculture',
  'Education',
  'Environment',
  'Finance',
  'Health',
  'Infrastructure',
  'Judiciary',
  'Social Welfare',
  'Water Resources',
];

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen, onClose, project, onSuccess,
}) => {
  // Basic formatting for dates
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    title: project.title || '',
    sector: project.sector || '',
    lga: project.lga || '',
    senatorialDistrict: project.senatorialDistrict || '',
    locationText: project.locationText || '',
    startDate: formatDateForInput(project.startDate),
    endDate: formatDateForInput(project.endDate),
    approvedBudget: project.approvedBudget?.toString() || '',
    fundingSource: project.fundingSource || '',
    contractor: project.contractor || '',
    status: project.status || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Project Title is required.');
      return;
    }

    const numericBudget = parseFloat(formData.approvedBudget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    setLoading(true);
    try {
      const updatePayload: Partial<Project> = {
        title: formData.title,
        sector: formData.sector,
        lga: formData.lga,
        senatorialDistrict: formData.senatorialDistrict,
        locationText: formData.locationText,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : project.startDate,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : project.endDate,
        approvedBudget: numericBudget,
        fundingSource: formData.fundingSource,
        contractor: formData.contractor,
        status: formData.status,
      };

      await updateProject(project.projectId, updatePayload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project Details" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
        {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
          {error}
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Project Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Sector</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            >
              <option value="">Select Sector</option>
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Approved Budget (₦)
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="approvedBudget"
              step="0.01"
              value={formData.approvedBudget}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">LGA</label>
            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            >
              <option value="">Select LGA</option>
              {ONDO_LGAS.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Senatorial District</label>
            <select
              name="senatorialDistrict"
              value={formData.senatorialDistrict}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            >
              <option value="">Select District</option>
              {SENATORIAL_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Location Details</label>
            <input
              type="text"
              name="locationText"
              value={formData.locationText}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Funding Source</label>
            <input
              type="text"
              name="fundingSource"
              value={formData.fundingSource}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Contractor</label>
            <input
              type="text"
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            >
              <option value="Not Started">Not Started</option>
              <option value="In-progress">In-progress</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="pt-4 mt-6 flex justify-end gap-2 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;
