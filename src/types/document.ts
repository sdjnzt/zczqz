// 公文基础类型
export interface BaseDocument {
  id: string;
  title: string;
  docNumber: string;
  type: string;
  urgency: string;
  createTime: string;
  status: string;
  content?: string;
  attachments?: DocumentAttachment[];
}

// 公文附件
export interface DocumentAttachment {
  name: string;
  url: string;
}

// 待处理公文
export interface PendingDocument extends BaseDocument {
  sender: string;
  department: string;
  deadline: string;
}

// 已处理公文
export interface ProcessedDocument extends BaseDocument {
  sender: string;
  department: string;
  processTime: string;
  result: string;
  feedbackRequired?: boolean;
  feedbackDeadline?: string;
  priority?: string;
}

// 已创建公文
export interface CreatedDocument extends BaseDocument {
  receiver: string;
  currentHandler?: string;
  currentDepartment?: string;
}

// 公文处理表单数据
export interface DocumentHandleFormData {
  action: 'approve' | 'reject' | 'transfer';
  comment?: string;
  transferTo?: string;
  needFeedback?: boolean;
  deadline?: string;
  priority?: string;
}

// 公文流转记录
export interface DocumentTrackRecord {
  id: string;
  documentId: string;
  action: string;
  userName: string;
  userRole?: string;
  fromDept?: string;
  toDept?: string;
  time: string;
  content: string;
  comment?: string;
  attachments: DocumentAttachment[];
}

// 公文类型联合类型
export type Document = PendingDocument | ProcessedDocument | CreatedDocument; 