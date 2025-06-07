import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LeaveRequest } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

// Mock leave requests data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    days: 3,
    reason: '家庭旅遊',
    status: 'approved',
    appliedDate: '2024-01-20',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-01-22'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-11',
    days: 2,
    reason: '感冒發燒',
    status: 'pending',
    appliedDate: '2024-01-08'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'personal',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    days: 1,
    reason: '個人事務處理',
    status: 'rejected',
    appliedDate: '2024-01-25',
    comments: '該日期部門會議重要，建議調整時間'
  }
];

const Leave: React.FC = () => {
  const { user } = useAuth();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRequest, setNewRequest] = useState({
    type: 'annual' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypeLabels = {
    annual: '年假',
    sick: '病假',
    personal: '事假',
    emergency: '緊急假'
  };

  const statusLabels = {
    pending: '待審核',
    approved: '已核准',
    rejected: '已拒絕'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: AlertCircle,
    approved: CheckCircle,
    rejected: XCircle
  };

  // Filter requests based on user role
  const allRequests = useMemo(() => {
    if (user?.role === 'manager') {
      return mockLeaveRequests;
    } else {
      return mockLeaveRequests.filter(req => req.employeeId === user?.id);
    }
  }, [user]);

  const filteredRequests = useMemo(() => {
    let filtered = allRequests;
    
    if (filter !== 'all') {
      filtered = filtered.filter(req => req.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [allRequests, filter, searchTerm]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      alert('請填寫所有必要欄位');
      return;
    }

    const startDate = new Date(newRequest.startDate);
    const endDate = new Date(newRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    console.log('提交請假申請:', {
      ...newRequest,
      days,
      employeeId: user?.id,
      employeeName: user?.name,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    });

    setShowNewRequestModal(false);
    setNewRequest({
      type: 'annual',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handleApprove = (requestId: string) => {
    console.log('核准請假:', requestId);
  };

  const handleReject = (requestId: string) => {
    const comment = prompt('請輸入拒絕原因:');
    if (comment) {
      console.log('拒絕請假:', requestId, comment);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">請假管理</h1>
              <p className="mt-2 text-gray-600">
                {user?.role === 'manager' ? '管理所有員工的請假申請' : '管理您的請假申請'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                申請請假
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜尋員工姓名或請假原因..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部狀態</option>
                <option value="pending">待審核</option>
                <option value="approved">已核准</option>
                <option value="rejected">已拒絕</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有請假記錄</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? '目前沒有任何請假申請' : `沒有${statusLabels[filter]}的請假申請`}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const StatusIcon = statusIcons[request.status];
              return (
                <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {leaveTypeLabels[request.type]}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[request.status]}
                          </span>
                        </div>
                        
                        {user?.role === 'manager' && (
                          <p className="text-sm text-gray-600 mb-2">
                            申請人: {request.employeeName}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">請假期間</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(request.startDate).toLocaleDateString('zh-TW')} ~ {new Date(request.endDate).toLocaleDateString('zh-TW')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">請假天數</p>
                            <p className="text-sm font-medium text-gray-900">{request.days} 天</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-500">請假原因</p>
                          <p className="text-sm text-gray-900">{request.reason}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          申請日期: {new Date(request.appliedDate).toLocaleDateString('zh-TW')}
                          {request.approvedBy && (
                            <> • 審核人: {request.approvedBy}</>
                          )}
                          {request.approvedDate && (
                            <> • 審核日期: {new Date(request.approvedDate).toLocaleDateString('zh-TW')}</>
                          )}
                        </div>
                        
                        {request.comments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                              <strong>審核意見:</strong> {request.comments}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {user?.role === 'manager' && request.status === 'pending' && (
                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            核准
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            拒絕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Request Modal */}
        {showNewRequestModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">申請請假</h3>
              </div>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    請假類型
                  </label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as LeaveRequest['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="annual">年假</option>
                    <option value="sick">病假</option>
                    <option value="personal">事假</option>
                    <option value="emergency">緊急假</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日期
                  </label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    結束日期
                  </label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    請假原因
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="請輸入請假原因..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    提交申請
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leave;