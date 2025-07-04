<template>
  <div class="policy-list-container">
    <el-card class="policy-card">
      <template #header>
        <div class="card-header">
          <h2>政策法规列表</h2>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词搜索政策"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch" class="search-btn">
                  搜索
                </el-button>
              </template>
            </el-input>
            
            <el-select 
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              class="filter-select"
              @change="handleFilterChange"
            >
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            
            <el-select 
              v-model="selectedLevel"
              placeholder="选择级别"
              clearable
              class="filter-select"
              @change="handleFilterChange"
            >
              <el-option
                v-for="item in levels"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </template>
      
      <!-- 政策列表 -->
      <div class="policy-filter-tags" v-if="selectedCategory || selectedLevel || searchKeyword">
        <span class="filter-label">筛选条件:</span>
        <el-tag v-if="searchKeyword" closable @close="searchKeyword = ''; handleFilterChange()">
          关键词: {{ searchKeyword }}
        </el-tag>
        <el-tag v-if="selectedCategory" closable @close="selectedCategory = ''; handleFilterChange()" type="success">
          分类: {{ getCategoryName(selectedCategory) }}
        </el-tag>
        <el-tag v-if="selectedLevel" closable @close="selectedLevel = ''; handleFilterChange()" type="info">
          级别: {{ getLevelName(selectedLevel) }}
        </el-tag>
        <el-button type="text" @click="clearAllFilters">清除全部</el-button>
      </div>
      
      <el-table
        v-loading="loading"
        :data="filteredPolicies"
        style="width: 100%"
        @row-click="handleRowClick"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
      >
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column prop="title" label="标题" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <div class="policy-title-container">
              <span class="policy-title-link">{{ scope.row.title }}</span>
              <el-tag 
                v-if="scope.row.status === 'active'"
                size="small" 
                effect="plain" 
                type="success"
                class="status-tag"
              >
                有效
              </el-tag>
              <el-tag 
                v-else
                size="small" 
                effect="plain" 
                type="info"
                class="status-tag"
              >
                已废止
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.category)" effect="plain" size="small">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" width="120" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.publishDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <el-tag size="small" effect="plain" :type="scope.row.level === 'town' ? 'success' : 'info'">
              {{ getLevelName(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="发布机构" width="180" show-overflow-tooltip />
        <el-table-column prop="views" label="阅读量" width="100" sortable align="center" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click.stop="viewPolicy(scope.row.id)">
              <el-icon><Document /></el-icon>
              查看
            </el-button>
            <el-button type="success" size="small" @click.stop="downloadPolicy(scope.row)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 高级搜索抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        title="高级搜索"
        direction="rtl"
        size="400px"
      >
        <div class="advanced-search-content">
          <el-form :model="advancedSearchForm" label-width="100px">
            <el-form-item label="关键词">
              <el-input v-model="advancedSearchForm.keyword" placeholder="标题、内容、发布机构等" />
            </el-form-item>
            
            <el-form-item label="政策分类">
              <el-select v-model="advancedSearchForm.category" placeholder="请选择" clearable style="width: 100%">
                <el-option
                  v-for="item in categories"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="发布级别">
              <el-select v-model="advancedSearchForm.level" placeholder="请选择" clearable style="width: 100%">
                <el-option
                  v-for="item in levels"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="发布日期">
              <el-date-picker
                v-model="advancedSearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="发布机构">
              <el-input v-model="advancedSearchForm.source" placeholder="请输入发布机构名称" />
            </el-form-item>
            
            <el-form-item label="政策效力">
              <el-radio-group v-model="advancedSearchForm.status">
                <el-radio label="active">现行有效</el-radio>
                <el-radio label="expired">已废止</el-radio>
                <el-radio label="all">全部</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          
          <div class="drawer-footer">
            <el-button @click="resetAdvancedSearch">重置</el-button>
            <el-button type="primary" @click="applyAdvancedSearch">应用</el-button>
          </div>
        </div>
      </el-drawer>
    </el-card>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-tooltip content="高级搜索" placement="left">
        <el-button type="primary" circle @click="drawerVisible = true">
          <el-icon><Filter /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="批量导出" placement="left">
        <el-button type="success" circle @click="exportPolicies">
          <el-icon><Download /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="返回顶部" placement="left">
        <el-button circle @click="scrollToTop">
          <el-icon><Top /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    
    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="筛选" placement="left">
        <el-button type="primary" circle class="action-button">
          <el-icon><Filter /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="下载" placement="left">
        <el-button type="success" circle class="action-button">
          <el-icon><Download /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="回到顶部" placement="left">
        <el-button circle class="action-button" @click="scrollToTop">
          <el-icon><Top /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, Download, Top, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 加载状态
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索和筛选
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedLevel = ref('')
const dateRange = ref<[string, string] | null>(null)

// 高级搜索抽屉
const drawerVisible = ref(false)
const advancedSearchForm = reactive({
  keyword: '',
  category: '',
  level: '',
  dateRange: null as [string, string] | null,
  source: '',
  status: 'all'
})

// 分类数据
const categories = [
  { label: '农业政策', value: 'agriculture' },
  { label: '教育政策', value: 'education' },
  { label: '医疗卫生', value: 'healthcare' },
  { label: '社会保障', value: 'social-security' },
  { label: '财政金融', value: 'finance' },
  { label: '城乡建设', value: 'construction' },
  { label: '交通运输', value: 'transportation' },
  { label: '政务服务', value: 'government' }
]

// 级别数据
const levels = [
  { label: '国家级', value: 'national' },
  { label: '省级', value: 'provincial' },
  { label: '市级', value: 'city' },
  { label: '县级', value: 'county' },
  { label: '镇级', value: 'town' }
]

// 政策数据
const policyData = [
  {
    id: 1,
    title: '关于促进城前镇农业产业化发展的实施意见',
    summary: '为加快推进城前镇农业产业化发展，提升农业现代化水平，特制定本实施意见。',
    category: 'agriculture',
    level: 'town',
    publishDate: '2025-06-01',
    source: '邹城市城前镇人民政府',
    views: 245,
    status: 'active'
  },
  {
    id: 2,
    title: '城前镇农村宅基地管理办法（试行）',
    summary: '规范城前镇农村宅基地管理，保障农民合法权益，促进农村和谐稳定。',
    category: 'construction',
    level: 'town',
    publishDate: '2025-05-20',
    source: '邹城市自然资源局',
    views: 198,
    status: 'active'
  },
  {
    id: 3,
    title: '关于加强城前镇基层医疗服务体系建设的通知',
    summary: '加强基层医疗卫生服务体系建设，提高农村医疗服务质量和水平。',
    category: 'healthcare',
    level: 'city',
    publishDate: '2025-05-15',
    source: '邹城市卫健委',
    views: 165,
    status: 'active'
  },
  {
    id: 4,
    title: '城前镇农业生产补贴政策实施细则',
    summary: '明确农业生产补贴政策的实施范围、申请条件、补贴标准和程序。',
    category: 'agriculture',
    level: 'town',
    publishDate: '2025-05-10',
    source: '邹城市财政局',
    views: 320,
    status: 'active'
  },
  {
    id: 5,
    title: '城前镇义务教育优质均衡发展实施方案',
    summary: '推进城前镇义务教育优质均衡发展，缩小城乡教育差距。',
    category: 'education',
    level: 'county',
    publishDate: '2025-05-05',
    source: '邹城市教育局',
    views: 185,
    status: 'active'
  },
  {
    id: 6,
    title: '关于加强城前镇乡村治理体系建设的指导意见',
    summary: '健全完善城前镇乡村治理体系，提升乡村治理能力和水平。',
    category: 'social-security',
    level: 'county',
    publishDate: '2025-05-01',
    source: '邹城市民政局',
    views: 176,
    status: 'active'
  },
  {
    id: 7,
    title: '山东省耕地保护与质量提升行动方案',
    summary: '加强耕地保护，提升耕地质量，保障粮食安全。',
    category: 'agriculture',
    level: 'provincial',
    publishDate: '2025-04-15',
    source: '山东省农业农村厅',
    views: 210,
    status: 'active'
  },
  {
    id: 8,
    title: '邹城市农村人居环境整治提升五年行动实施方案',
    summary: '改善农村人居环境，建设美丽宜居乡村。',
    category: 'construction',
    level: 'city',
    publishDate: '2025-04-10',
    source: '邹城市农业农村局',
    views: 132,
    status: 'active'
  },
  {
    id: 9,
    title: '关于开展城前镇农村人居环境整治行动的通知',
    summary: '开展农村人居环境整治，提升农村生活品质。',
    category: 'construction',
    level: 'town',
    publishDate: '2025-04-05',
    source: '邹城市城前镇人民政府',
    views: 156,
    status: 'active'
  },
  {
    id: 10,
    title: '城前镇新型农村合作医疗制度实施方案',
    summary: '完善新型农村合作医疗制度，提高农村医疗保障水平。',
    category: 'healthcare',
    level: 'town',
    publishDate: '2025-04-01',
    source: '邹城市城前镇人民政府',
    views: 190,
    status: 'active'
  },
  {
    id: 11,
    title: '关于实施乡村振兴战略的指导意见',
    summary: '全面实施乡村振兴战略，加快推进农业农村现代化。',
    category: 'agriculture',
    level: 'national',
    publishDate: '2025-03-20',
    source: '中共中央、国务院',
    views: 458,
    status: 'active'
  },
  {
    id: 12,
    title: '邹城市城乡一体化发展规划',
    summary: '推进城乡一体化发展，缩小城乡差距。',
    category: 'construction',
    level: 'city',
    publishDate: '2025-03-15',
    source: '邹城市发改委',
    views: 178,
    status: 'active'
  }
]

// 过滤政策数据
const filteredPolicies = computed(() => {
  let result = [...policyData]
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(policy => 
      policy.title.toLowerCase().includes(keyword) ||
      policy.summary.toLowerCase().includes(keyword) ||
      policy.source.toLowerCase().includes(keyword)
    )
  }
  
  // 按分类筛选
  if (selectedCategory.value) {
    result = result.filter(policy => policy.category === selectedCategory.value)
  }
  
  // 按级别筛选
  if (selectedLevel.value) {
    result = result.filter(policy => policy.level === selectedLevel.value)
  }
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    result = result.filter(policy => {
      const publishDate = new Date(policy.publishDate)
      return publishDate >= startDate && publishDate <= endDate
    })
  }
  
  // 设置总数
  total.value = result.length
  
  return result
})

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchPolicyList()
}

// 处理每页显示条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPolicyList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPolicyList()
}

// 处理过滤条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchPolicyList()
}

// 处理行点击
const handleRowClick = (row: any) => {
  viewPolicy(row.id)
}

// 查看政策详情
const viewPolicy = (id: number) => {
  router.push(`/policy/detail/${id}`)
}

// 下载政策
const downloadPolicy = (policy: any) => {
  ElMessage.success(`正在下载: ${policy.title}`)
}

// 批量导出政策
const exportPolicies = () => {
  ElMessage.success('正在导出所选政策，请稍候...')
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 重置高级搜索表单
const resetAdvancedSearch = () => {
  advancedSearchForm.keyword = ''
  advancedSearchForm.category = ''
  advancedSearchForm.level = ''
  advancedSearchForm.dateRange = null
  advancedSearchForm.source = ''
  advancedSearchForm.status = 'all'
}

// 应用高级搜索
const applyAdvancedSearch = () => {
  // 将高级搜索的值同步到主搜索框
  searchKeyword.value = advancedSearchForm.keyword
  selectedCategory.value = advancedSearchForm.category
  selectedLevel.value = advancedSearchForm.level
  dateRange.value = advancedSearchForm.dateRange
  
  // 关闭抽屉并搜索
  drawerVisible.value = false
  currentPage.value = 1
  fetchPolicyList()
}

// 获取政策列表数据
const fetchPolicyList = () => {
  loading.value = true
  
  setTimeout(() => {
    // 模拟API请求延迟
    total.value = policyData.length // 实际应用中这会从API响应获取
    loading.value = false
  }, 500)
}

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.label : categoryId
}

// 获取级别名称
const getLevelName = (levelId: string): string => {
  const level = levels.find(item => item.value === levelId)
  return level ? level.label : levelId
}

// 获取标签类型
const getTagType = (categoryId: string): string => {
  const typeMap: { [key: string]: string } = {
    'agriculture': 'success',
    'education': 'primary',
    'healthcare': 'info',
    'social-security': 'warning',
    'finance': 'danger',
    'construction': ''
  }
  return typeMap[categoryId] || ''
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dateStr
}

// 清除所有筛选条件
const clearAllFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedLevel.value = ''
  handleFilterChange()
}

onMounted(() => {
  // 初始化获取政策列表
  fetchPolicyList()
})
</script>

<style scoped>
.policy-list-container {
  padding: 20px;
  position: relative;
}

.policy-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.policy-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
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

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 350px;
}

.search-input .el-input__wrapper {
  border-radius: 4px 0 0 4px;
}

.search-btn {
  border-radius: 0 4px 4px 0;
}

.filter-select {
  width: 160px;
}

.policy-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.policy-title-link {
  color: #409EFF;
  cursor: pointer;
  font-weight: 500;
}

.policy-title-link:hover {
  text-decoration: underline;
}

.status-tag {
  margin-left: auto;
}

.policy-filter-tags {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  color: #606266;
  font-weight: 500;
  margin-right: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.toolbar {
  position: fixed;
  right: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
  display: none; /* 隐藏原来的工具栏 */
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

.action-button {
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.action-button:hover {
  transform: scale(1.1);
}

.advanced-search-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 0;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 10px;
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .toolbar {
    right: 20px;
    bottom: 20px;
  }
}
</style> 