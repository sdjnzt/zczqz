<template>
  <div class="document-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>公文流转跟踪</h2>
          <div class="header-actions">
            <el-button type="primary" @click="createDocument" class="create-btn">
              <el-icon><Plus /></el-icon>
              新建公文
            </el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="document-tabs">
        <el-tab-pane label="待办公文" name="pending">
          <document-list 
            :list-data="pendingDocuments" 
            :loading="loading" 
            type="pending"
            @view="viewDocument"
            @handle="handleDocument"
            @transfer="transferDocument"
            @track="trackDocument"
          />
        </el-tab-pane>
        <el-tab-pane label="已办公文" name="processed">
          <document-list 
            :list-data="processedDocuments" 
            :loading="loading" 
            type="processed"
            @view="viewDocument"
            @track="trackDocument"
          />
        </el-tab-pane>
        <el-tab-pane label="我发起的" name="created">
          <document-list 
            :list-data="createdDocuments" 
            :loading="loading" 
            type="created"
            @view="viewDocument"
            @revoke="revokeDocument"
            @track="trackDocument"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 新建公文对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建公文" width="650px" destroy-on-close>
      <document-form ref="documentFormRef" @submit="submitDocument" @cancel="createDialogVisible = false" />
    </el-dialog>
    
    <!-- 公文处理对话框 -->
    <el-dialog v-model="handleDialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <document-handle 
        v-if="currentDocument"
        :document="currentDocument"
        @submit="handleSubmit"
        @cancel="handleDialogVisible = false"
      />
    </el-dialog>
    
    <!-- 查看流转记录对话框 -->
    <el-dialog v-model="trackDialogVisible" title="公文流转记录" width="800px">
      <document-track v-if="currentDocument" :document-id="currentDocument.id" />
    </el-dialog>
    
    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="新建公文" placement="left">
        <el-button type="primary" circle class="float-btn float-btn-primary" @click="createDocument">
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="刷新" placement="left">
        <el-button type="info" circle class="float-btn float-btn-info" @click="refreshData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="回到顶部" placement="left">
        <el-button circle class="float-btn" @click="scrollToTop">
          <el-icon><Top /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Top } from '@element-plus/icons-vue'
import DocumentList from './components/DocumentList.vue'
import DocumentForm from './components/DocumentForm.vue'
import DocumentHandle from './components/DocumentHandle.vue'
import DocumentTrack from './components/DocumentTrack.vue'
import type { 
  PendingDocument, 
  ProcessedDocument, 
  CreatedDocument,
  DocumentHandleFormData
} from '@/types/document'

// 状态
const activeTab = ref('pending')
const loading = ref(false)
const createDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const trackDialogVisible = ref(false)
const dialogTitle = ref('')
const currentDocument = ref<PendingDocument | ProcessedDocument | CreatedDocument | null>(null)
const documentFormRef = ref()

// 模拟数据
const pendingDocuments = ref<PendingDocument[]>([
  {
    id: '1',
    title: '关于加强城镇基层治理的通知',
    docNumber: 'QZFWJ-2025-065',
    type: '通知',
    urgency: '急',
    sender: '张明',
    department: '政府办公室',
    createTime: '2025-06-15 09:30:45',
    deadline: '2025-06-18',
    status: '待审批'
  },
  {
    id: '2',
    title: '2025年度农村人居环境整治工作计划',
    docNumber: 'QZFWJ-2025-066',
    type: '计划',
    urgency: '特急',
    sender: '李强',
    department: '农业农村办公室',
    createTime: '2025-06-16 10:15:22',
    deadline: '2025-06-19',
    status: '待审批'
  },
  {
    id: '3',
    title: '关于开展防汛安全检查的通知',
    docNumber: 'QZFWJ-2025-067',
    type: '通知',
    urgency: '平件',
    sender: '王佳',
    department: '应急管理办公室',
    createTime: '2025-06-16 14:05:37',
    deadline: '2025-06-23',
    status: '待处理'
  },
  {
    id: '10',
    title: '关于开展城前镇2025年度安全生产月活动的通知',
    docNumber: 'QZFWJ-2025-066',
    type: '通知',
    urgency: '急',
    sender: '周琦',
    department: '安全生产委员会',
    createTime: '2025-06-17 08:22:15',
    deadline: '2025-06-20',
    status: '待审批'
  },
  {
    id: '11',
    title: '城前镇重点工程项目土地征收补偿方案',
    docNumber: 'QZFWJ-2025-067',
    type: '方案',
    urgency: '特急',
    sender: '赵敏',
    department: '城建办公室',
    createTime: '2025-06-17 09:10:45',
    deadline: '2025-06-21',
    status: '待审批'
  },
  {
    id: '12',
    title: '关于统计上报2025年第二季度财政收支情况的通知',
    docNumber: 'QZFWJ-2025-068',
    type: '通知',
    urgency: '平件',
    sender: '钱华',
    department: '财政所',
    createTime: '2025-06-17 11:30:22',
    deadline: '2025-06-25',
    status: '待处理'
  }
])

const processedDocuments = ref<ProcessedDocument[]>([
  {
    id: '4',
    title: '关于做好夏季安全生产工作的通知',
    docNumber: 'QZFWJ-2025-062',
    type: '通知',
    urgency: '急',
    sender: '张明',
    department: '安监办',
    createTime: '2025-06-10 11:22:33',
    processTime: '2025-06-12 09:45:12',
    status: '已审批',
    result: '同意'
  },
  {
    id: '5',
    title: '2025年第二季度财政预算执行情况报告',
    docNumber: 'QZFWJ-2025-063',
    type: '报告',
    urgency: '平件',
    sender: '赵敏',
    department: '财政所',
    createTime: '2025-06-08 16:30:25',
    processTime: '2025-06-11 14:18:05',
    status: '已审批',
    result: '同意'
  },
  {
    id: '6',
    title: '关于调整城前镇村级组织运转经费保障政策的请示',
    docNumber: 'QZFWJ-2025-064',
    type: '请示',
    urgency: '急',
    sender: '刘畅',
    department: '民政所',
    createTime: '2025-06-09 09:15:40',
    processTime: '2025-06-12 16:40:22',
    status: '已审批',
    result: '同意并附建议'
  },
  {
    id: '13',
    title: '城前镇农村公路养护项目验收报告',
    docNumber: 'QZFWJ-2025-068',
    type: '报告',
    urgency: '平件',
    sender: '孙磊',
    department: '城建办公室',
    createTime: '2025-06-05 08:40:25',
    processTime: '2025-06-08 10:12:30',
    status: '已审批',
    result: '同意'
  },
  {
    id: '14',
    title: '关于申请2025年度农村饮水安全工程专项资金的请示',
    docNumber: 'QZFWJ-2025-069',
    type: '请示',
    urgency: '急',
    sender: '杨帆',
    department: '水务局',
    createTime: '2025-06-06 10:20:18',
    processTime: '2025-06-09 15:33:45',
    status: '已审批',
    result: '同意'
  },
  {
    id: '15',
    title: '关于加强城前镇文物保护工作的意见',
    docNumber: 'QZFWJ-2025-060',
    type: '意见',
    urgency: '平件',
    sender: '胡敏',
    department: '文化旅游局',
    createTime: '2025-06-07 14:25:32',
    processTime: '2025-06-10 11:05:18',
    status: '已退回',
    result: '需要修改后重新提交'
  },
  {
    id: '16',
    title: '城前镇2025年度政府信息公开工作要点',
    docNumber: 'QZFWJ-2025-061',
    type: '通知',
    urgency: '平件',
    sender: '郭静',
    department: '政府办公室',
    createTime: '2025-06-08 09:18:40',
    processTime: '2025-06-10 16:22:50',
    status: '已审批',
    result: '同意并要求尽快落实'
  }
])

const createdDocuments = ref<CreatedDocument[]>([
  {
    id: '7',
    title: '关于开展农村人居环境整治工作的请示',
    docNumber: 'QZFWJ-2025-068',
    type: '请示',
    urgency: '急',
    receiver: '镇政府办',
    createTime: '2025-06-17 08:45:12',
    status: '流转中',
    currentHandler: '王镇长',
    currentDepartment: '镇政府办'
  },
  {
    id: '8',
    title: '关于申请增加社区文化活动经费的报告',
    docNumber: 'QZFWJ-2025-069',
    type: '报告',
    urgency: '平件',
    receiver: '财政所',
    createTime: '2025-06-17 11:30:45',
    status: '流转中',
    currentHandler: '李所长',
    currentDepartment: '财政所'
  },
  {
    id: '17',
    title: '关于推进农村集体经济发展的意见',
    docNumber: 'QZFWJ-2025-060',
    type: '意见',
    urgency: '平件',
    receiver: '农业农村办公室',
    createTime: '2025-06-16 09:20:15',
    status: '流转中',
    currentHandler: '陈主任',
    currentDepartment: '农业农村办公室'
  },
  {
    id: '18',
    title: '关于申请城前镇老旧小区改造项目资金的请示',
    docNumber: 'QZFWJ-2025-061',
    type: '请示',
    urgency: '急',
    receiver: '财政所',
    createTime: '2025-06-16 11:05:30',
    status: '已完成',
    currentHandler: '已办结',
    currentDepartment: '财政所'
  },
  {
    id: '19',
    title: '关于组织开展2025年度农村低保评审工作的请示',
    docNumber: 'QZFWJ-2025-062',
    type: '请示',
    urgency: '平件',
    receiver: '民政所',
    createTime: '2025-06-15 14:22:38',
    status: '已退回',
    currentHandler: '张所长',
    currentDepartment: '民政所'
  },
  {
    id: '20',
    title: '城前镇2025年度基础教育质量提升计划',
    docNumber: 'QZFWJ-2025-063',
    type: '计划',
    urgency: '平件',
    receiver: '教育科',
    createTime: '2025-06-15 16:40:20',
    status: '已完成',
    currentHandler: '已办结',
    currentDepartment: '教育科'
  }
])

// 新建公文
const createDocument = () => {
  createDialogVisible.value = true
}

// 提交新建公文
const submitDocument = (formData: any) => {
  console.log('新建公文表单数据:', formData)
  
  // 这里发送请求到后台创建公文
  // 示例代码...
  
  ElMessage.success('公文已创建')
  createDialogVisible.value = false
  refreshData() // 刷新数据
}

// 查看公文
const viewDocument = (doc: PendingDocument | ProcessedDocument | CreatedDocument) => {
  currentDocument.value = doc
  handleDialogVisible.value = true
  dialogTitle.value = '查看公文'
}

// 处理公文
const handleDocument = (doc: PendingDocument) => {
  currentDocument.value = doc
  handleDialogVisible.value = true
  dialogTitle.value = '处理公文'
}

// 转发公文
const transferDocument = (doc: PendingDocument) => {
  currentDocument.value = doc
  handleDialogVisible.value = true
  dialogTitle.value = '转发公文'
}

// 撤回公文
const revokeDocument = (doc: CreatedDocument) => {
  ElMessage.info(`模拟撤回公文: ${doc.title}`)
}

// 跟踪公文
const trackDocument = (doc: PendingDocument | ProcessedDocument | CreatedDocument) => {
  currentDocument.value = doc
  trackDialogVisible.value = true
}

// 提交处理结果
const handleSubmit = (formData: DocumentHandleFormData) => {
  if (!currentDocument.value) return
  
  loading.value = true
  
  // 模拟API提交
  setTimeout(() => {
    const docId = currentDocument.value!.id
    
    if (formData.action === 'approve') {
      // 模拟批准处理
      const index = pendingDocuments.value.findIndex(doc => doc.id === docId)
      if (index > -1) {
        const doc = { ...pendingDocuments.value[index] } as any
        doc.status = '已审批'
        doc.result = formData.comment ? '同意: ' + formData.comment : '同意'
        doc.processTime = new Date().toLocaleString()
        
        if (formData.needFeedback && formData.deadline) {
          doc.feedbackRequired = true
          doc.feedbackDeadline = formData.deadline
        }
        
        if (formData.priority && formData.priority !== '普通') {
          doc.priority = formData.priority
        }
        
        pendingDocuments.value.splice(index, 1)
        processedDocuments.value.unshift(doc)
        
        ElMessage.success('公文已审批通过')
      }
    } else if (formData.action === 'reject') {
      // 模拟拒绝处理
      const index = pendingDocuments.value.findIndex(doc => doc.id === docId)
      if (index > -1) {
        const doc = { ...pendingDocuments.value[index] } as any
        doc.status = '已退回'
        doc.result = formData.comment ? '不同意: ' + formData.comment : '不同意'
        doc.processTime = new Date().toLocaleString()
        
        pendingDocuments.value.splice(index, 1)
        processedDocuments.value.unshift(doc)
        
        ElMessage.success('公文已退回')
      }
    } else if (formData.action === 'transfer') {
      // 模拟转发处理
      const transferMsg = formData.transferTo 
        ? `公文已转发至${formData.transferTo}` 
        : '公文已转发'
      
      ElMessage.success(transferMsg)
    }
    
    handleDialogVisible.value = false
    loading.value = false
  }, 1000)
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  
  setTimeout(() => {
    ElMessage.success('数据已更新')
    loading.value = false
  }, 1000)
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  // 模拟数据加载
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)
})
</script>

<style scoped>
.document-container {
  padding: 20px;
}

.main-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.card-header h2::before {
  content: '';
  display: block;
  width: 4px;
  height: 20px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.document-tabs {
  margin-top: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.create-btn {
  padding: 8px 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s;
  background-color: #2468f2;
  border-color: #2468f2;
}

.create-btn:hover {
  background-color: #1c54c9;
  border-color: #1c54c9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(36, 104, 242, 0.2);
}

.floating-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
}

.float-btn {
  width: 44px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.float-btn-primary {
  background-color: #2468f2;
  border-color: #2468f2;
}

.float-btn-primary:hover {
  background-color: #1c54c9;
  border-color: #1c54c9;
}

.float-btn-info {
  background-color: #909399;
  border-color: #909399;
}

.float-btn-info:hover {
  background-color: #7c7f85;
  border-color: #7c7f85;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 12px;
    width: 100%;
  }
}
</style> 