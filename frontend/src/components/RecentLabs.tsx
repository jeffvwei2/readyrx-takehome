import React, { useState, useMemo } from 'react';
import { RecentLabsProps, convertFirestoreTimestamp } from '../types';

const RecentLabs: React.FC<RecentLabsProps> = ({ labOrders, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateValue: string | { _seconds: number; _nanoseconds: number }) => {
    return convertFirestoreTimestamp(dateValue).toLocaleDateString();
  };

  // Sort by completion date (most recent first) and calculate pagination
  const { sortedOrders, totalPages, paginatedOrders } = useMemo(() => {
    const sorted = [...labOrders].sort((a, b) => {
      const dateA = a.completedDate || a.orderedDate;
      const dateB = b.completedDate || b.orderedDate;
      return convertFirestoreTimestamp(dateB).getTime() - convertFirestoreTimestamp(dateA).getTime();
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = sorted.slice(startIndex, endIndex);

    return {
      sortedOrders: sorted,
      totalPages,
      paginatedOrders: paginated
    };
  }, [labOrders, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-[40rem] flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Recent Lab Orders
      </h2>
      
      {loading ? (
        <div className="text-center py-8 flex-1 flex items-center justify-center">
          <div>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading lab orders...</p>
          </div>
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="text-center py-8 flex-1 flex items-center justify-center">
          <p className="text-gray-500">No lab orders found</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{order.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Order ID:</span> {order.orderId}
                  </div>
                  <div>
                    <span className="font-medium">Lab:</span> {order.labName}
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span> {order.orderingProvider}
                  </div>
                  <div>
                    <span className="font-medium">Ordered:</span> {formatDate(order.orderedDate)}
                  </div>
                  {order.completedDate && (
                    <div className="col-span-2">
                      <span className="font-medium">Completed:</span> {formatDate(order.completedDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of {sortedOrders.length} orders
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentLabs;
