<template>
  <div class="document-track">
    <!-- 流转记录 -->
    <el-timeline>
      <el-timeline-item
        v-for="(record, index) in trackRecords"
        :key="index"
        :timestamp="record.time"
        :type="getTimelineItemType(record.action)"
        :icon="getTimelineIcon(record.action)"
        :color="getTimelineColor(record.action)"
      >
        <el-card class="track-card">
          <div class="track-header">
            <span class="track-action">{{ getActionText(record.action) }}</span>
            <span class="track-user">
              <el-icon><User /></el-icon>
              {{ record.userName }}
            </span>
          </div>
          
          <div class="track-content">
            <p v-if="record.content">{{ record.content }}</p>
            <p v-if="record.fromDept">
              <span class="dept-label">处理部门：</span>{{ record.fromDept }}
            </p>
            <p v-if="record.toDept">
              <span class="dept-label">转发至：</span>{{ record.toDept }}
            </p>
          </div>
          
          <div v-if="record.comment" class="track-comment">
            <div class="comment-title">处理意见：</div>
            <div class="comment-content">{{ record.comment }}</div>
          </div>
          
          <div v-if="record.attachments && record.attachments.length > 0" class="track-attachments">
            <div class="attachment-title">附件：</div>
            <div class="attachment-list">
              <el-link
                v-for="(attachment, attachIndex) in record.attachments"
                :key="attachIndex"
                type="primary"
                :href="attachment.url"
                target="_blank"
                :underline="false"
              >
                <el-icon><Document /></el-icon>
                {{ attachment.name }}
              </el-link>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    
    <!-- 无流转记录时的提示 -->
    <div v-if="trackRecords.length === 0" class="empty-tip">
      <el-empty description="暂无流转记录" />
    </div>
    
    <el-divider content-position="center">
      <el-icon><InfoFilled /></el-icon> 流程说明
    </el-divider>
    
    <el-card class="process-desc">
      <div class="process-title">公文流转流程：</div>
      <div class="process-steps">
        <div class="step">
          <span class="step-dot" style="background-color: #409EFF;"></span>
          <span class="step-text">创建</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-dot" style="background-color: #E6A23C;"></span>
          <span class="step-text">审核</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-dot" style="background-color: #67C23A;"></span>
          <span class="step-text">审批</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-dot" style="background-color: #909399;"></span>
          <span class="step-text">完成</span>
        </div>
      </div>
      
      <div class="process-note">
        <p>1. 文件由创建人提交后，自动流转至指定部门负责人；</p>
        <p>2. 部门负责人可对公文进行审核、转发或退回操作；</p>
        <p>3. 最终审批人对公文进行处理后流程结束；</p>
        <p>4. 公文创建人可随时查看公文流转状态与处理进度。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  User, 
  Document, 
  InfoFilled,
  Edit,
  Check,
  CircleCheck,
  Close,
  Position,
  Upload
} from '@element-plus/icons-vue'

// 接收文档ID
const props = defineProps({
  documentId: {
    type: String,
    required: true
  }
})

// 定义流转记录类型
interface TrackRecord {
  id: string;
  documentId: string;
  action: string;
  userName: string;
  userRole: string;
  fromDept: string;
  time: string;
  content: string;
  toDept?: string;
  comment?: string;
  attachments: Array<{ name: string; url: string }>;
}

// 流转记录
const trackRecords = ref<TrackRecord[]>([
  {
    id: '1',
    documentId: '1',
    action: 'create',
    userName: '张明',
    userRole: '科员',
    fromDept: '政府办公室',
    time: '2023-05-15 09:30:45',
    content: '创建了公文《关于加强城镇基层治理的通知》',
    attachments: []
  },
  {
    id: '2',
    documentId: '1',
    action: 'receive',
    userName: '李强',
    userRole: '主任',
    fromDept: '政府办公室',
    time: '2023-05-15 10:15:22',
    content: '收到公文《关于加强城镇基层治理的通知》',
    attachments: []
  },
  {
    id: '3',
    documentId: '1',
    action: 'transfer',
    userName: '李强',
    userRole: '主任',
    fromDept: '政府办公室',
    toDept: '民政所',
    time: '2023-05-15 11:30:15',
    content: '转发公文至民政所',
    comment: '请民政所提供相关意见',
    attachments: []
  },
  {
    id: '4',
    documentId: '1',
    action: 'receive',
    userName: '王佳',
    userRole: '所长',
    fromDept: '民政所',
    time: '2023-05-15 13:45:30',
    content: '收到公文《关于加强城镇基层治理的通知》',
    attachments: []
  },
  {
    id: '5',
    documentId: '1',
    action: 'approve',
    userName: '王佳',
    userRole: '所长',
    fromDept: '民政所',
    time: '2023-05-16 09:20:10',
    content: '审批通过公文',
    comment: '同意该通知内容，建议加强社区网格员管理，提高基层治理能力。',
    attachments: [
      { name: '社区网格化管理实施方案.docx', url: '#' },
      { name: '基层治理工作计划.xlsx', url: '#' }
    ]
  }
])

// 获取时间线项目类型
const getTimelineItemType = (action: string): string => {
  const typeMap: Record<string, string> = {
    'create': 'primary',
    'receive': 'info',
    'transfer': 'warning',
    'approve': 'success',
    'reject': 'danger',
    'revoke': 'info',
    'complete': 'success'
  }
  return typeMap[action] || 'info'
}

// 获取时间线图标
const getTimelineIcon = (action: string): any => {
  const iconMap: Record<string, any> = {
    'create': Edit,
    'receive': Document,
    'transfer': Position,
    'approve': CircleCheck,
    'reject': Close,
    'revoke': Upload,
    'complete': Check
  }
  return iconMap[action] || Document
}

// 获取时间线颜色
const getTimelineColor = (action: string): string => {
  const colorMap: Record<string, string> = {
    'create': '#409EFF',
    'receive': '#909399',
    'transfer': '#E6A23C',
    'approve': '#67C23A',
    'reject': '#F56C6C',
    'revoke': '#909399',
    'complete': '#67C23A'
  }
  return colorMap[action] || '#909399'
}

// 获取动作文本
const getActionText = (action: string): string => {
  const textMap: Record<string, string> = {
    'create': '创建公文',
    'receive': '接收公文',
    'transfer': '转发公文',
    'approve': '审批通过',
    'reject': '退回公文',
    'revoke': '撤回公文',
    'complete': '办结完成'
  }
  return textMap[action] || action
}

// 加载流转记录
const loadTrackRecords = () => {
  // 这里应该调用API获取流转记录
  // 目前使用模拟数据
  
  // 根据文档ID过滤记录
  if (props.documentId !== '1') {
    trackRecords.value = [
      {
        id: '1',
        documentId: props.documentId,
        action: 'create',
        userName: '张明',
        userRole: '科员',
        fromDept: '政府办公室',
        time: '2023-05-16 14:30:45',
        content: `创建了公文`,
        attachments: []
      },
      {
        id: '2',
        documentId: props.documentId,
        action: 'receive',
        userName: '李强',
        userRole: '主任',
        fromDept: '政府办公室',
        time: '2023-05-16 15:15:22',
        content: `收到公文`,
        attachments: []
      }
    ]
  }
}

onMounted(() => {
  loadTrackRecords()
})
</script>

<style scoped>
.document-track {
  padding: 10px;
}

.track-card {
  margin-bottom: 10px;
}

.track-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.track-action {
  font-weight: bold;
  color: #303133;
}

.track-user {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.track-content {
  margin-bottom: 10px;
  color: #303133;
}

.track-content p {
  margin: 4px 0;
}

.dept-label {
  color: #909399;
  margin-right: 4px;
}

.track-comment {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.comment-title {
  color: #606266;
  margin-bottom: 5px;
  font-weight: 500;
}

.comment-content {
  color: #303133;
  white-space: pre-wrap;
  line-height: 1.5;
}

.track-attachments {
  margin-top: 10px;
}

.attachment-title {
  color: #606266;
  margin-bottom: 5px;
  font-weight: 500;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-list .el-link {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-tip {
  padding: 30px 0;
  text-align: center;
}

.process-desc {
  margin-top: 20px;
}

.process-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.step-text {
  font-size: 14px;
  color: #606266;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #EBEEF5;
  margin: 0 10px;
}

.process-note {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.process-note p {
  margin: 5px 0;
}
</style> 