import React from 'react';
import { RawMaterial, Status } from '../types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  materials: RawMaterial[];
}

export const MaterialTable: React.FC<Props> = ({ materials }) => {
  
  const getStatusBadge = (status: Status, expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    let color = "bg-gray-100 text-gray-800";
    let icon = <CheckCircle className="w-3 h-3 mr-1" />;

    if (status === Status.SAFE) {
      color = "bg-green-100 text-green-800 border border-green-200";
      icon = <CheckCircle className="w-3 h-3 mr-1" />;
    } else if (status === Status.WARNING) {
      // Urgent warning check
      if (days <= 15) {
         color = "bg-orange-100 text-orange-800 border border-orange-200 font-semibold";
      } else {
         color = "bg-yellow-100 text-yellow-800 border border-yellow-200";
      }
      icon = <AlertTriangle className="w-3 h-3 mr-1" />;
    } else if (status === Status.EXPIRED) {
      color = "bg-red-100 text-red-800 border border-red-200 font-bold";
      icon = <XCircle className="w-3 h-3 mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material / ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material.material_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{material.name}</span>
                  <span className="text-xs text-gray-500">ID: {material.material_id} • Outlet: {material.outlet_id}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.supplier}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{material.halal_certificate_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                  {material.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {material.expiry_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(material.agent_status, material.expiry_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};