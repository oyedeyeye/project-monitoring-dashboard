import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { uploadCsv } from '../hooks/useProjects';
import { api } from '../lib/api';

interface ImportProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ImportProjectsModal: React.FC<ImportProjectsModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccessMsg(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/projects/import/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'projects_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error('Failed to download template', err);
            setError('Failed to download template. Please try again later.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file to upload.');
            return;
        }

        if (!file.name.endsWith('.csv')) {
            setError('Only .csv files are allowed.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const result = await uploadCsv(file);
            setSuccessMsg(`Successfully imported ${result.importedCount} projects.`);
            setFile(null);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to import projects.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Projects" maxWidth="md">
            <div className="space-y-6">
                {/* Template Download Section */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-start gap-4">
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900">Step 1: Download Template</h4>
                        <p className="text-xs text-blue-700 mt-1 mb-3">
                            Download the CSV template. Fill it out with your project details using the exact format: <strong>mda, project, budget</strong>. The first row for any MDA can be left blank for project and budget to serve as a demarcation header.
                        </p>
                        <Button type="button" size="sm" variant="outline" onClick={handleDownloadTemplate} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                            Download CSV Template
                        </Button>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Step 2: Upload Completed CSV</h4>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 break-words whitespace-pre-wrap">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                                {successMsg}
                            </div>
                        )}

                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand transition-colors relative bg-gray-50/50">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand">
                                        <span>Select a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">CSV up to 10MB</p>
                                {file && <p className="text-sm font-semibold text-brand mt-2">{file.name}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!file || loading} isLoading={loading}>
                                Import Data
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default ImportProjectsModal;
