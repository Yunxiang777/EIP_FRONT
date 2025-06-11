import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LeaveRequest } from '../types';
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Clock,
  User
} from 'lucide-react';

// 更新的介面定義以符合資料庫架構
interface LeaveForm {
  formId: string;
  applicantCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'signed' | 'rejected' | 'canceled' | 'approved';
  applyDate: string;
  lastUpdate: string;
}

interface LeaveFlow {
  flowId: string;
  formId: string;
  stepNo: number;
  signerCode: string;
  signStatus: 'pending' | 'signed' | 'rejected';
  signDate?: string;
  remark?: string;
  signerName?: string; // 用於顯示簽核人姓名
}

interface LeaveFormWithFlow extends LeaveForm {
  applicantName?: string;
  flows: LeaveFlow[];
  currentStep?: number;
  days: number;
}

// Mock data adapted to new structure
const mockLeaveRequests: LeaveFormWithFlow[] = [
  {
    formId: '1',
    applicantCode: '1',
    applicantName: 'John Doe',
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    days: 3,
    reason: '家庭旅遊',
    status: 'approved',
    applyDate: '2024-01-20',
    lastUpdate: '2024-01-22',
    currentStep: 2,
    flows: [
      {
        flowId: '1-1',
        formId: '1',
        stepNo: 1,
        signerCode: 'manager1',
        signerName: '直屬主管',
        signStatus: 'signed',
        signDate: '2024-01-21',
        remark: '同意'
      },
      {
        flowId: '1-2',
        formId: '1',
        stepNo: 2,
        signerCode: 'hr1',
        signerName: 'HR經理',
        signStatus: 'signed',
        signDate: '2024-01-22',
        remark: '核准通過'
      }
    ]
  },
  {
    formId: '2',
    applicantCode: '1',
    applicantName: 'John Doe',
    leaveType: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-11',
    days: 2,
    reason: '感冒發燒',
    status: 'pending',
    applyDate: '2024-01-08',
    lastUpdate: '2024-01-08',
    currentStep: 1,
    flows: [
      {
        flowId: '2-1',
        formId: '2',
        stepNo: 1,
        signerCode: 'manager1',
        signerName: '直屬主管',
        signStatus: 'pending'
      }
    ]
  },
  {
    formId: '3',
    applicantCode: '2',
    applicantName: 'Sarah Johnson',
    leaveType: 'personal',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    days: 1,
    reason: '個人事務處理',
    status: 'rejected',
    applyDate: '2024-01-25',
    lastUpdate: '2024-01-26',
    currentStep: 1,
    flows: [
      {
        flowId: '3-1',
        formId: '3',
        stepNo: 1,
        signerCode: 'manager1',
        signerName: '直屬主管',
        signStatus: 'rejected',
        signDate: '2024-01-26',
        remark: '該日期部門會議重要，建議調整時間'
      }
    ]
  }
];

// 模擬簽核流程設定
const approvalChainConfig = {
  sick: [
    { stepNo: 1, signerCode: 'manager1', signerName: '直屬主管' }
  ],
  personal: [
    { stepNo: 1, signerCode: 'manager1', signerName: '直屬主管' }
  ],
  annual: [
    { stepNo: 1, signerCode: 'manager1', signerName: '直屬主管' },
    { stepNo: 2, signerCode: 'hr1', signerName: 'HR經理' }
  ],
  emergency: [
    { stepNo: 1, signerCode: 'manager1', signerName: '直屬主管' },
    { stepNo: 2, signerCode: 'hr1', signerName: 'HR經理' }
  ]
};

const Leave: React.FC = () => {
  const { user } = useAuth();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'signed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRequest, setNewRequest] = useState({
    leaveType: 'annual',
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
    signed: '審核中',
    approved: '已核准',
    rejected: '已拒絕',
    canceled: '已取消'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    signed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-600'
  };

  const statusIcons = {
    pending: Clock,
    signed: AlertCircle,
    approved: CheckCircle,
    rejected: XCircle,
    canceled: XCircle
  };

  // 生成唯一ID的函數
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // 計算請假天數
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  // Filter requests based on user role
  const allRequests = useMemo(() => {
    if (user?.role === 'manager') {
      return mockLeaveRequests;
    } else {
      return mockLeaveRequests.filter(req => req.applicantCode === user?.id);
    }
  }, [user]);

  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    if (filter !== 'all') {
      filtered = filtered.filter(req => req.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime());
  }, [allRequests, filter, searchTerm]);

  // 建立責任鏈簽核流程
  const createApprovalChain = (leaveType: string): LeaveFlow[] => {
    const chainConfig = approvalChainConfig[leaveType as keyof typeof approvalChainConfig] || [];
    return chainConfig.map(config => ({
      flowId: generateId(),
      formId: '', // 將在提交時設定
      stepNo: config.stepNo,
      signerCode: config.signerCode,
      signerName: config.signerName,
      signStatus: 'pending' as const
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      alert('請填寫所有必要欄位');
      return;
    }

    if (new Date(newRequest.startDate) > new Date(newRequest.endDate)) {
      alert('結束日期不能早於開始日期');
      return;
    }

    const formId = generateId();
    const days = calculateLeaveDays(newRequest.startDate, newRequest.endDate);
    const currentDate = new Date().toISOString().split('T')[0];

    // 建立請假申請表單資料
    const leaveForm: LeaveForm = {
      formId: formId,
      applicantCode: user?.id || '',
      leaveType: newRequest.leaveType,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      reason: newRequest.reason,
      status: 'pending',
      applyDate: currentDate,
      lastUpdate: currentDate
    };

    // 建立責任鏈簽核流程
    const approvalFlows = createApprovalChain(newRequest.leaveType);
    approvalFlows.forEach(flow => {
      flow.formId = formId;
    });

    console.log('提交請假申請 - LEAVE_FORM:', leaveForm);
    console.log('建立簽核流程 - LEAVE_FLOW:', approvalFlows);

    // 這裡應該呼叫 API 將資料寫入資料庫
    try {
      // 模擬 API 呼叫
      // await submitLeaveRequest(leaveForm, approvalFlows);

      alert('請假申請已成功提交！');
      setShowNewRequestModal(false);
      setNewRequest({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
    } catch (error) {
      console.error('提交請假申請失敗:', error);
      alert('提交失敗，請稍後再試');
    }
  };

  const handleApprove = (formId: string, flowId: string) => {
    console.log('核准請假 - Form ID:', formId, 'Flow ID:', flowId);
    // 這裡應該更新對應的 LEAVE_FLOW 記錄
  };

  const handleReject = (formId: string, flowId: string) => {
    const remark = prompt('請輸入拒絕原因:');
    if (remark) {
      console.log('拒絕請假 - Form ID:', formId, 'Flow ID:', flowId, 'Remark:', remark);
      // 這裡應該更新對應的 LEAVE_FLOW 記錄
    }
  };

  // 渲染簽核流程
  const renderApprovalFlow = (flows: LeaveFlow[]) => {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">簽核流程</h4>
        <div className="space-y-2">
          {flows.map((flow, index) => (
            <div key={flow.flowId} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${flow.signStatus === 'signed' ? 'bg-green-100 text-green-800' :
                    flow.signStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {flow.stepNo}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {flow.signerName}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${flow.signStatus === 'signed' ? 'bg-green-100 text-green-800' :
                      flow.signStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {flow.signStatus === 'signed' ? '已簽核' :
                      flow.signStatus === 'rejected' ? '已拒絕' : '待簽核'}
                  </span>
                </div>
                {flow.signDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(flow.signDate).toLocaleDateString('zh-TW')}
                  </p>
                )}
                {flow.remark && (
                  <p className="text-xs text-gray-600 mt-1">
                    意見: {flow.remark}
                  </p>
                )}
              </div>
              {user?.role === 'manager' && flow.signStatus === 'pending' && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleApprove(flow.formId, flow.flowId)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    核准
                  </button>
                  <button
                    onClick={() => handleReject(flow.formId, flow.flowId)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    拒絕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
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
                <option value="signed">審核中</option>
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
                <div key={request.formId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {leaveTypeLabels[request.leaveType as keyof typeof leaveTypeLabels]}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[request.status]}
                          </span>
                        </div>

                        {user?.role === 'manager' && (
                          <p className="text-sm text-gray-600 mb-2">
                            申請人: {request.applicantName}
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
                          申請日期: {new Date(request.applyDate).toLocaleDateString('zh-TW')}
                          {request.lastUpdate !== request.applyDate && (
                            <> • 最後更新: {new Date(request.lastUpdate).toLocaleDateString('zh-TW')}</>
                          )}
                        </div>

                        {/* 顯示簽核流程 */}
                        {renderApprovalFlow(request.flows)}
                      </div>
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
                <p className="text-sm text-gray-600 mt-1">
                  系統將根據請假類型自動建立簽核流程
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    請假類型
                  </label>
                  <select
                    value={newRequest.leaveType}
                    onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="annual">年假</option>
                    <option value="sick">病假</option>
                    <option value="personal">事假</option>
                    <option value="emergency">緊急假</option>
                  </select>

                  {/* 顯示將會建立的簽核流程 */}
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <p className="font-medium text-blue-800 mb-1">簽核流程:</p>
                    {approvalChainConfig[newRequest.leaveType as keyof typeof approvalChainConfig]?.map((step, index) => (
                      <div key={step.stepNo} className="flex items-center space-x-1 text-blue-700">
                        <span>{step.stepNo}.</span>
                        <User className="w-3 h-3" />
                        <span>{step.signerName}</span>
                      </div>
                    ))}
                  </div>
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

                {newRequest.startDate && newRequest.endDate && (
                  <div className="text-sm text-gray-600">
                    請假天數: {calculateLeaveDays(newRequest.startDate, newRequest.endDate)} 天
                  </div>
                )}

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