<template>
  <div class="document-list">
    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <div class="search-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索公文标题或编号"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="btn-group">
          <el-button type="primary" @click="handleSearch" class="action-btn search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          
          <el-button @click="resetFilter" class="action-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        
        <el-button 
          :type="showAdvancedSearch ? 'primary' : 'default'" 
          :plain="!showAdvancedSearch"
          @click="showAdvancedSearch = !showAdvancedSearch" 
          class="action-btn filter-toggle-btn"
        >
          <el-icon class="filter-icon">
            <component :is="showAdvancedSearch ? 'ArrowUp' : 'Filter'" />
          </el-icon>
          {{ showAdvancedSearch ? '收起筛选' : '高级筛选' }}
        </el-button>
      </div>
      
      <div v-show="showAdvancedSearch" class="filter-items">
        <div class="filter-row">
          <el-select v-model="filterType" placeholder="公文类型" clearable @change="handleFilter">
            <el-option
              v-for="item in documentTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          
          <el-select v-model="filterUrgency" placeholder="紧急程度" clearable @change="handleFilter">
            <el-option
              v-for="item in urgencyLevels"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 320px"
            @change="handleFilter"
          />
        </div>
      </div>
      
      <!-- 选中的筛选条件标签 -->
      <div v-if="hasActiveFilters" class="filter-tags">
        <el-tag
          v-if="filterType"
          closable
          @close="filterType = ''"
        >
          类型: {{ filterType }}
        </el-tag>
        <el-tag
          v-if="filterUrgency"
          closable
          @close="filterUrgency = ''"
        >
          紧急程度: {{ filterUrgency }}
        </el-tag>
        <el-tag
          v-if="dateRange && dateRange.length === 2"
          closable
          @close="dateRange = []"
        >
          时间范围: {{ dateRange[0] }} 至 {{ dateRange[1] }}
        </el-tag>
      </div>
    </div>
    
    <!-- 公文列表 -->
    <el-table
      v-loading="loading"
      :data="filteredDocuments"
      border
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      @row-click="rowClick"
    >
      <el-table-column label="公文标题" min-width="250" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="document-title">
            <el-tag v-if="row.urgency === '特急'" type="danger" effect="dark" size="small">特急</el-tag>
            <el-tag v-else-if="row.urgency === '急'" type="warning" size="small">急</el-tag>
            <span class="title-text">{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="docNumber" label="文号" width="150" show-overflow-tooltip />
      
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getDocTypeTag(row.type)" size="small">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      
      <template v-if="type === 'pending'">
        <el-table-column prop="sender" label="发文人" width="100" />
        <el-table-column prop="department" label="发文部门" width="120" />
        <el-table-column prop="createTime" label="发文时间" width="160" />
        <el-table-column prop="deadline" label="办理期限" width="100">
          <template #default="{ row }">
            <span 
              :class="[
                'deadline', 
                isNearDeadline(row.deadline) ? 'near-deadline' : '',
                isOverdue(row.deadline) ? 'overdue' : ''
              ]"
            >
              {{ row.deadline }}
            </span>
          </template>
        </el-table-column>
      </template>
      
      <template v-else-if="type === 'processed'">
        <el-table-column prop="sender" label="发文人" width="100" />
        <el-table-column prop="department" label="发文部门" width="120" />
        <el-table-column prop="createTime" label="发文时间" width="160" />
        <el-table-column prop="processTime" label="办理时间" width="160" />
      </template>
      
      <template v-else-if="type === 'created'">
        <el-table-column prop="receiver" label="接收部门" width="120" />
        <el-table-column prop="createTime" label="发文时间" width="160" />
        <el-table-column prop="currentHandler" label="当前处理人" width="110" />
        <el-table-column prop="currentDepartment" label="当前部门" width="120" />
      </template>
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 表格操作列 -->
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button type="primary" size="small" @click.stop="handleView(row)" class="btn-view">
              <el-icon><View /></el-icon> 查看
            </el-button>
            
            <!-- 待办公文操作 -->
            <template v-if="type === 'pending'">
              <el-button type="success" size="small" @click.stop="handleProcess(row)" class="btn-action">
                <el-icon><Edit /></el-icon> 处理
              </el-button>
              <el-button type="info" size="small" @click.stop="handleTransfer(row)" class="btn-action">
                <el-icon><SwitchButton /></el-icon> 转发
              </el-button>
            </template>
            
            <!-- 我发起的操作 -->
            <template v-if="type === 'created' && row.status !== '已完成'">
              <el-button type="warning" size="small" @click.stop="handleRevoke(row)" class="btn-action">
                <el-icon><Back /></el-icon> 撤回
              </el-button>
            </template>
            
            <el-button plain size="small" @click.stop="handleTrack(row)" class="btn-track">
              <el-icon><Connection /></el-icon> 跟踪
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-if="filteredDocuments.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
      
      <div v-else class="empty-tip">
        暂无相关公文
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh, ArrowDown, ArrowUp, View, Edit, SwitchButton, Back, Connection, Filter } from '@element-plus/icons-vue'
import type { Document } from '@/types/document'

// 接收props
const props = defineProps({
  listData: {
    type: Array as () => Document[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'pending', // 'pending' | 'processed' | 'created'
    validator: (value: string) => {
      return ['pending', 'processed', 'created'].includes(value)
    }
  }
})

// 定义事件
const emit = defineEmits(['view', 'handle', 'transfer', 'revoke', 'track'])

// 状态管理
const searchKeyword = ref('')
const filterType = ref('')
const filterUrgency = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showAdvancedSearch = ref(false)

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filterType.value !== '' || 
         filterUrgency.value !== '' || 
         (dateRange.value && dateRange.value.length === 2)
})

// 公文类型选项
const documentTypes = [
  { label: '通知', value: '通知' },
  { label: '请示', value: '请示' },
  { label: '报告', value: '报告' },
  { label: '决定', value: '决定' },
  { label: '计划', value: '计划' },
  { label: '函', value: '函' },
  { label: '会议纪要', value: '会议纪要' }
]

// 紧急程度选项
const urgencyLevels = [
  { label: '特急', value: '特急' },
  { label: '急', value: '急' },
  { label: '平件', value: '平件' }
]

// 根据类型获取标签类型
const getDocTypeTag = (type: string): string => {
  const typeMap: Record<string, string> = {
    '通知': '',
    '请示': 'success',
    '报告': 'info',
    '决定': 'danger',
    '计划': 'warning',
    '函': '',
    '会议纪要': 'info'
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

// 筛选后的文档列表
const filteredDocuments = computed(() => {
  let result = [...props.listData]
  
  // 关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((doc: Document) => 
      doc.title.toLowerCase().includes(keyword) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(keyword))
    )
  }
  
  // 按公文类型筛选
  if (filterType.value) {
    result = result.filter((doc: Document) => doc.type === filterType.value)
  }
  
  // 按紧急程度筛选
  if (filterUrgency.value) {
    result = result.filter((doc: Document) => doc.urgency === filterUrgency.value)
  }
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59)
    
    result = result.filter((doc: Document) => {
      const createDate = new Date(doc.createTime)
      return createDate >= startDate && createDate <= endDate
    })
  }
  
  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 总数量
const total = computed(() => {
  let result = [...props.listData]
  
  // 关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((doc: Document) => 
      doc.title.toLowerCase().includes(keyword) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(keyword))
    )
  }
  
  // 按公文类型筛选
  if (filterType.value) {
    result = result.filter((doc: Document) => doc.type === filterType.value)
  }
  
  // 按紧急程度筛选
  if (filterUrgency.value) {
    result = result.filter((doc: Document) => doc.urgency === filterUrgency.value)
  }
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59)
    
    result = result.filter((doc: Document) => {
      const createDate = new Date(doc.createTime)
      return createDate >= startDate && createDate <= endDate
    })
  }
  
  return result.length
})

// 监听数据变化
watch(() => props.listData, () => {
  currentPage.value = 1
}, { deep: true })

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterUrgency.value = ''
  dateRange.value = []
  currentPage.value = 1
  showAdvancedSearch.value = false
}

// 行点击事件
const rowClick = (row: Document) => {
  handleView(row)
}

// 查看公文
const handleView = (row: Document) => {
  emit('view', row)
}

// 处理公文
const handleProcess = (row: Document) => {
  emit('handle', row)
}

// 转发公文
const handleTransfer = (row: Document) => {
  emit('transfer', row)
}

// 撤回公文
const handleRevoke = (row: Document) => {
  emit('revoke', row)
}

// 跟踪公文
const handleTrack = (row: Document) => {
  emit('track', row)
}
</script>

<style scoped>
.document-list {
  width: 100%;
}

.filter-container {
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.search-input {
  width: 250px;
}

.action-btn {
  border-radius: 4px;
  padding: 8px 15px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-btn {
  background-color: #2468f2;
  border-color: #2468f2;
}

.search-btn:hover {
  background-color: #1c54c9;
  border-color: #1c54c9;
}

.filter-toggle-btn {
  transition: all 0.2s ease;
}

.filter-icon {
  margin-right: 4px;
}

.filter-items {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s;
}

.filter-items::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 15px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #f9f9f9;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.filter-tags .el-tag {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 28px;
}

.document-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-actions .el-button {
  min-width: 76px;
  padding: 6px 12px;
  transition: all 0.2s;
}

.btn-view {
  background-color: #409EFF;
  border-color: #409EFF;
}

.btn-view:hover {
  background-color: #337ecc;
  border-color: #337ecc;
}

.btn-action {
  font-weight: 500;
}

.btn-track {
  background-color: #f4f4f5;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-track:hover {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  margin: 40px 0;
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

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-group {
    display: flex;
    width: 100%;
  }
  
  .btn-group .el-button {
    flex: 1;
  }
  
  .filter-toggle-btn {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 