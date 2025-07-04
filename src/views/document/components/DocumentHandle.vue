<template>
  <div class="document-handle">
    <!-- 公文基本信息 -->
    <el-card class="document-info">
      <template #header>
        <div class="card-header">
          <span>公文信息</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ document.title }}</el-descriptions-item>
        <el-descriptions-item label="文号">{{ document.docNumber || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getDocTypeTag(document.type)" size="small">{{ document.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag v-if="document.urgency === '特急'" type="danger" effect="dark" size="small">特急</el-tag>
          <el-tag v-else-if="document.urgency === '急'" type="warning" size="small">急</el-tag>
          <el-tag v-else size="small">平件</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发文人">{{ document.sender || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="发文部门">{{ document.department || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="发文时间">{{ document.createTime || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(document.status)" size="small">{{ document.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="document.deadline" label="办理期限">
          <span :class="[
            'deadline', 
            isNearDeadline(document.deadline) ? 'near-deadline' : '',
            isOverdue(document.deadline) ? 'overdue' : ''
          ]">{{ document.deadline }}</span>
        </el-descriptions-item>
      </el-descriptions>
      
      <div v-if="document.content" class="document-content">
        <div class="content-title">公文内容：</div>
        <div class="content-body">{{ document.content }}</div>
      </div>
      
      <div v-if="document.attachments && document.attachments.length > 0" class="document-attachments">
        <div class="attachment-title">附件：</div>
        <div class="attachment-list">
          <el-link
            v-for="(attachment, index) in document.attachments"
            :key="index"
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
    
    <!-- 处理表单 -->
    <el-card class="handle-form" v-if="showHandleForm">
      <template #header>
        <div class="card-header">
          <span>处理意见</span>
        </div>
      </template>
      
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="处理动作" prop="action">
          <el-radio-group v-model="formData.action">
            <el-radio label="approve">同意</el-radio>
            <el-radio label="reject">不同意</el-radio>
            <el-radio v-if="showTransfer" label="transfer">转发</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="formData.action === 'transfer'" label="转发至" prop="transferTo">
          <el-select v-model="formData.transferTo" placeholder="请选择转发部门" style="width: 100%">
            <el-option
              v-for="item in departments"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 额外处理选项 -->
        <template v-if="showExtraOptions">
          <el-form-item label="优先级" prop="priority">
            <el-radio-group v-model="formData.priority">
              <el-radio label="普通">普通</el-radio>
              <el-radio label="优先">优先</el-radio>
              <el-radio label="紧急">紧急</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="需要反馈">
            <el-switch v-model="formData.needFeedback" />
          </el-form-item>
          
          <el-form-item v-if="formData.needFeedback" label="反馈期限">
            <el-date-picker 
              v-model="formData.deadline"
              type="date"
              placeholder="选择反馈期限"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="(date: Date) => date < new Date()"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        
        <!-- 常用意见 -->
        <el-form-item label="常用意见">
          <div class="common-comments">
            <el-select v-model="selectedCommonComment" placeholder="选择常用意见" clearable style="width: 100%">
              <el-option
                v-for="(comment, index) in commonComments"
                :key="index"
                :label="comment"
                :value="comment"
              />
            </el-select>
            <el-button type="primary" plain @click="selectCommonComment" :disabled="!selectedCommonComment">
              插入
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="处理意见" prop="comment">
          <el-input
            v-model="formData.comment"
            type="textarea"
            rows="4"
            placeholder="请输入处理意见"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义props和emits
const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 部门选项
const departments = [
  { label: '镇政府办', value: '镇政府办' },
  { label: '财政所', value: '财政所' },
  { label: '民政所', value: '民政所' },
  { label: '社会保障所', value: '社会保障所' },
  { label: '农业农村办公室', value: '农业农村办公室' },
  { label: '城建办公室', value: '城建办公室' },
  { label: '综治办公室', value: '综治办公室' },
  { label: '安监办', value: '安监办' },
  { label: '环保办', value: '环保办' },
  { label: '文教中心', value: '文教中心' },
  { label: '卫生院', value: '卫生院' },
  { label: '水务局', value: '水务局' },
  { label: '市场监管所', value: '市场监管所' },
  { label: '安全生产委员会', value: '安全生产委员会' },
  { label: '文化旅游局', value: '文化旅游局' },
  { label: '教育科', value: '教育科' }
]

// 常用意见选项
const commonComments = [
  '同意，按程序办理',
  '同意，请抓紧办理',
  '同意，并请及时反馈处理结果',
  '请修改后再次提交',
  '不同意，请重新评估后再提交',
  '请相关部门协调处理',
  '转发至相关部门研究讨论',
  '请提供更多详细资料',
  '已收悉，按要求办理'
]

// 表单数据
const formData = reactive({
  action: 'approve',
  transferTo: '',
  comment: '',
  needFeedback: false,
  deadline: '',
  priority: '普通'
})

// 表单引用
const formRef = ref(null)

// 当前选择的常用意见
const selectedCommonComment = ref('')

// 是否显示转发选项
const showTransfer = computed(() => {
  // 根据当前用户角色和文档状态决定是否可以转发
  // 这里暂时固定为true
  return true
})

// 是否显示处理表单
const showHandleForm = computed(() => {
  return !props.viewOnly
})

// 是否显示额外选项
const showExtraOptions = computed(() => {
  return formData.action === 'transfer' || formData.action === 'approve'
})

// 根据类型获取标签类型
const getDocTypeTag = (type: string): string => {
  const typeMap: Record<string, string> = {
    '通知': '',
    '请示': 'success',
    '报告': 'info',
    '决定': 'danger',
    '计划': 'warning',
    '函': '',
    '会议纪要': 'info',
    '方案': 'warning',
    '意见': 'info'
  }
  return typeMap[type] || ''
}

// 根据状态获取标签类型
const getStatusTag = (status: string): string => {
  const statusMap: Record<string, string> = {
    '待审批': 'warning',
    '待处理': 'warning',
    '已审批': 'success',
    '已退回': 'danger',
    '流转中': 'info',
    '已完成': 'success'
  }
  return statusMap[status] || ''
}

// 判断是否临近截止日期（3天内）
const isNearDeadline = (deadline: string): boolean => {
  if (!deadline) return false
  
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return diffDays >= 0 && diffDays <= 3
}

// 判断是否已超过截止日期
const isOverdue = (deadline: string): boolean => {
  if (!deadline) return false
  
  const today = new Date()
  const deadlineDate = new Date(deadline)
  
  return today > deadlineDate
}

// 选择常用意见
const selectCommonComment = () => {
  if (selectedCommonComment.value) {
    formData.comment = selectedCommonComment.value
    selectedCommonComment.value = ''
  }
}

// 提交表单
const handleSubmit = () => {
  // 如果是转发，但没有选择转发对象，则提示
  if (formData.action === 'transfer' && !formData.transferTo) {
    ElMessage.warning('请选择转发部门')
    return
  }
  
  // 如果需要反馈但未设置期限，则使用默认期限
  if (formData.needFeedback && !formData.deadline) {
    // 默认设置为3天后
    const date = new Date()
    date.setDate(date.getDate() + 3)
    formData.deadline = date.toISOString().split('T')[0]
  }
  
  emit('submit', { ...formData })
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.document-handle {
  width: 100%;
}

.document-info {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  color: #303133;
}

.document-content {
  margin-top: 15px;
  padding: 10px;
  background-color: #f7f7f7;
  border-radius: 4px;
}

.content-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}

.content-body {
  white-space: pre-wrap;
  line-height: 1.6;
}

.document-attachments {
  margin-top: 15px;
}

.attachment-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
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

.deadline {
  font-weight: 500;
}

.near-deadline {
  color: #E6A23C;
}

.overdue {
  color: #F56C6C;
}

.handle-form {
  margin-top: 20px;
}

.common-comments {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .common-comments {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .common-comments .el-select {
    width: 100%;
  }
  
  .common-comments .el-button {
    margin-top: 5px;
  }
}
</style> 