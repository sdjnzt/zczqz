<template>
  <div class="policy-container">
    <el-card class="policy-header">
      <template #header>
        <div class="card-header">
          <h2>政策法规查询系统</h2>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词搜索政策法规"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-select v-model="selectedCategory" placeholder="政策分类" clearable @change="handleCategoryChange">
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select v-model="selectedLevel" placeholder="发布级别" clearable @change="handleLevelChange">
              <el-option
                v-for="item in levels"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select v-model="selectedYear" placeholder="发布年份" clearable @change="handleYearChange">
              <el-option
                v-for="year in years"
                :key="year"
                :label="year + '年'"
                :value="year"
              />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="policy-tabs">
        <el-tab-pane label="最新政策" name="latest">
          <div class="latest-policies">
            <div class="policy-item" v-for="(policy, index) in latestPolicies" :key="policy.id">
              <h4 class="title" @click="viewPolicy(policy.id)">
                <el-icon class="icon"><Document /></el-icon>
                {{ policy.title }}
              </h4>
              <div class="meta">
                <span class="date">
                  <el-icon class="icon"><Calendar /></el-icon>
                  {{ policy.publishDate }}
                </span>
                <span class="source">
                  <el-icon class="icon"><OfficeBuilding /></el-icon>
                  {{ policy.source }}
                </span>
                <span class="views">
                  <el-icon class="icon"><View /></el-icon>
                  {{ policy.views }}次阅读
                </span>
              </div>
              <div class="actions">
                <el-button type="primary" size="small" @click="viewPolicy(policy.id)">
                  <el-icon><Document /></el-icon>
                  查看详情
                </el-button>
                <el-button type="success" size="small" @click="downloadPolicy(policy)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </div>
          <div class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="totalPolicies"
              :page-size="pageSize"
              @current-change="handlePageChange"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="热门政策" name="hot">
          <div class="hot-policies">
            <div class="card-header">
              <h3>热门政策</h3>
              <span class="more" @click="navigateToList">
                更多
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
            <div class="policy-item" v-for="(policy, index) in hotPolicies" :key="policy.id">
              <h4 class="title" @click="viewPolicy(policy.id)">
                <el-icon class="icon"><HotWater /></el-icon>
                {{ policy.title }}
              </h4>
              <div class="meta">
                <span class="date">
                  <el-icon class="icon"><Calendar /></el-icon>
                  {{ policy.publishDate }}
                </span>
                <span class="views">
                  <el-icon class="icon"><View /></el-icon>
                  {{ policy.views }}次阅读
                </span>
              </div>
              <div class="actions">
                <el-button type="primary" size="small" @click="viewPolicy(policy.id)">
                  <el-icon><Document /></el-icon>
                  查看详情
                </el-button>
                <el-button type="success" size="small" @click="downloadPolicy(policy)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="政策解读" name="interpretation">
          <div class="policy-interpretation">
            <div v-for="interpretation in interpretations" :key="interpretation.id" class="interpretation-item">
              <div class="interpretation-header">
                <h3>{{ interpretation.title }}</h3>
                <div class="interpretation-meta">
                  <span>解读人: {{ interpretation.author }}</span>
                  <span>发布时间: {{ formatDate(interpretation.publishDate) }}</span>
                </div>
              </div>
              <div class="interpretation-content">
                <p>{{ interpretation.summary }}</p>
              </div>
              <div class="interpretation-footer">
                <el-button type="primary" @click="viewInterpretation(interpretation.id)">查看全文</el-button>
                <el-button type="info" @click="viewOriginalPolicy(interpretation.policyId)">查看原文</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 政策分类导航 -->
    <el-row :gutter="20" class="category-section">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="category in policyCategories" :key="category.id">
        <el-card shadow="hover" class="category-card" @click="navigateToCategory(category.id)">
          <div class="category-icon">
            <el-icon><component :is="category.icon" /></el-icon>
          </div>
          <div class="category-info">
            <h3 class="category-title">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description }}</p>
            <div class="category-count">
              <el-badge :value="category.count" class="category-badge" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 政策法规相关资源 -->
    <div class="related-resources">
      <h3 class="section-title">相关资源</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="resource-card">
            <div class="resource-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="resource-info">
              <h4>政策文件模板</h4>
              <p>包含各类政策文件模板和范例</p>
              <el-button type="primary" @click="downloadTemplate">
                下载模板
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="resource-card">
            <div class="resource-icon">
              <el-icon :size="40"><Reading /></el-icon>
            </div>
            <div class="resource-info">
              <h4>政策解读指南</h4>
              <p>帮助理解政策要点和实施方案</p>
              <el-button type="primary" @click="viewGuide">
                查看指南
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="resource-card">
            <div class="resource-icon">
              <el-icon :size="40"><Collection /></el-icon>
            </div>
            <div class="resource-info">
              <h4>法规汇编</h4>
              <p>各类法规的汇编与归类</p>
              <el-button type="primary" @click="viewLaws">
                查看汇编
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="搜索" placement="left">
        <el-button type="primary" circle class="action-button" @click="focusSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="政策列表" placement="left">
        <el-button type="success" circle class="action-button" @click="navigateToList">
          <el-icon><Document /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="回到顶部" placement="left">
        <el-button type="info" circle class="action-button" @click="scrollToTop">
          <el-icon><Top /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search,
  Download,
  Document,
  Collection,
  OfficeBuilding,
  Calendar,
  ArrowRight,
  HotWater,
  View,
  Reading,
  Top
} from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('latest')
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedLevel = ref('')
const selectedYear = ref('')
const pageSize = ref(10)
const totalPolicies = ref(125)

// 分类数据
const categories = [
  { label: '农业政策', value: 'agriculture' },
  { label: '教育政策', value: 'education' },
  { label: '医疗卫生', value: 'healthcare' },
  { label: '社会保障', value: 'social-security' },
  { label: '财政金融', value: 'finance' },
  { label: '城乡建设', value: 'construction' }
]

// 级别数据
const levels = [
  { label: '国家级', value: 'national' },
  { label: '省级', value: 'provincial' },
  { label: '市级', value: 'city' },
  { label: '县级', value: 'county' },
  { label: '镇级', value: 'town' }
]

// 年份数据
const years = [2025, 2024, 2023, 2022, 2021, 2020]

// 最新政策数据
const latestPolicies = ref([
  {
    id: 1,
    title: '关于促进城前镇农业产业化发展的实施意见',
    summary: '为加快推进城前镇农业产业化发展，提升农业现代化水平，特制定本实施意见。',
    category: 'agriculture',
    publishDate: '2025-06-01',
    source: '邹城市城前镇人民政府',
    views: 245
  },
  {
    id: 2,
    title: '城前镇农村宅基地管理办法（试行）',
    summary: '规范城前镇农村宅基地管理，保障农民合法权益，促进农村和谐稳定。',
    category: 'construction',
    publishDate: '2025-05-20',
    source: '邹城市自然资源局',
    views: 198
  },
  {
    id: 3,
    title: '关于加强城前镇基层医疗服务体系建设的通知',
    summary: '加强基层医疗卫生服务体系建设，提高农村医疗服务质量和水平。',
    category: 'healthcare',
    publishDate: '2025-05-15',
    source: '邹城市卫健委',
    views: 165
  },
  {
    id: 4,
    title: '城前镇农业生产补贴政策实施细则',
    summary: '明确农业生产补贴政策的实施范围、申请条件、补贴标准和程序。',
    category: 'agriculture',
    publishDate: '2025-05-10',
    source: '邹城市财政局',
    views: 320
  },
  {
    id: 5,
    title: '城前镇义务教育优质均衡发展实施方案',
    summary: '推进城前镇义务教育优质均衡发展，缩小城乡教育差距。',
    category: 'education',
    publishDate: '2025-05-05',
    source: '邹城市教育局',
    views: 185
  },
  {
    id: 6,
    title: '关于加强城前镇乡村治理体系建设的指导意见',
    summary: '健全完善城前镇乡村治理体系，提升乡村治理能力和水平。',
    category: 'social-security',
    publishDate: '2025-05-01',
    source: '邹城市民政局',
    views: 176
  }
])

// 热门政策数据与最新政策相同，但按浏览量排序
const hotPolicies = ref([...latestPolicies.value].sort((a, b) => b.views - a.views))

// 政策解读数据
const interpretations = ref([
  {
    id: 1,
    title: '《关于促进城前镇农业产业化发展的实施意见》政策解读',
    author: '李农业',
    publishDate: '2025-06-02',
    summary: '本文对《关于促进城前镇农业产业化发展的实施意见》进行了详细解读，明确了政策出台的背景、主要内容和预期成效。',
    policyId: 1
  },
  {
    id: 2,
    title: '《城前镇农村宅基地管理办法》要点解析',
    author: '王建设',
    publishDate: '2025-05-22',
    summary: '详细解析了《城前镇农村宅基地管理办法》的主要内容、亮点和实施要点，帮助群众更好理解政策。',
    policyId: 2
  },
  {
    id: 3,
    title: '《城前镇农业生产补贴政策实施细则》解读',
    author: '赵财政',
    publishDate: '2025-05-12',
    summary: '对《城前镇农业生产补贴政策实施细则》进行了全面解读，明确了各类补贴的申请条件、标准和程序。',
    policyId: 4
  }
])

// 政策分类导航数据
const policyCategories = ref([
  {
    id: 'agriculture',
    name: '农业政策',
    description: '农业发展、补贴、农村建设等相关政策',
    icon: 'Crop',
    count: 48
  },
  {
    id: 'education',
    name: '教育政策',
    description: '教育资源建设、师资队伍、教学质量等政策',
    icon: 'School',
    count: 32
  },
  {
    id: 'healthcare',
    name: '医疗卫生',
    description: '基础医疗、公共卫生、医保政策等',
    icon: 'FirstAid',
    count: 27
  },
  {
    id: 'social-security',
    name: '社会保障',
    description: '社保、养老、低保、特殊人群关怀等政策',
    icon: 'User',
    count: 35
  },
  {
    id: 'finance',
    name: '财政金融',
    description: '财政预算、金融服务、补贴资金等政策',
    icon: 'Money',
    count: 23
  },
  {
    id: 'construction',
    name: '城乡建设',
    description: '基础设施、人居环境、村镇规划等政策',
    icon: 'House',
    count: 41
  },
  {
    id: 'transportation',
    name: '交通运输',
    description: '道路建设、公共交通、物流体系等政策',
    icon: 'Van',
    count: 18
  },
  {
    id: 'government',
    name: '政务服务',
    description: '行政审批、便民服务、政务公开等政策',
    icon: 'OfficeBuilding',
    count: 29
  }
])

// 获取当前政策数据
const currentPolicies = computed(() => {
  return activeTab.value === 'latest' ? latestPolicies.value : hotPolicies.value
})

// 根据分页获取政策数据
const getPaginatedPolicies = computed(() => {
  return currentPolicies.value.slice(0, pageSize.value)
})

// 处理页面变化
const handlePageChange = (page: number) => {
  // 在实际应用中，这里需要根据页码获取数据
  console.log('当前页码:', page)
  ElMessage.info(`加载第${page}页数据`)
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  router.push({
    path: '/policy/list',
    query: { keyword: searchKeyword.value.trim() }
  })
}

// 处理分类变化
const handleCategoryChange = () => {
  ElMessage.info(`已选择分类: ${selectedCategory.value}`)
}

// 处理级别变化
const handleLevelChange = () => {
  ElMessage.info(`已选择级别: ${selectedLevel.value}`)
}

// 处理年份变化
const handleYearChange = () => {
  ElMessage.info(`已选择年份: ${selectedYear.value}`)
}

// 查看政策详情
const viewPolicy = (id: number) => {
  router.push(`/policy/detail/${id}`)
}

// 跳转到政策列表页面
const navigateToList = () => {
  router.push('/policy/list')
}

// 下载政策
const downloadPolicy = (policy: any) => {
  ElMessage.success(`正在下载: ${policy.title}`)
}

// 查看政策解读详情
const viewInterpretation = (id: number) => {
  router.push(`/policy/interpretation/${id}`)
}

// 查看原文
const viewOriginalPolicy = (id: number) => {
  router.push(`/policy/detail/${id}`)
}

// 导航到分类
const navigateToCategory = (id: string) => {
  router.push({
    path: '/policy/category',
    query: { id }
  })
}

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.label : categoryId
}

// 获取标签类型
const getTagType = (categoryId: string) => {
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
const formatDate = (dateStr: string) => {
  return dateStr
}

// 下载政策模板
const downloadTemplate = () => {
  ElMessage.success('正在下载政策文件模板...')
}

// 查看政策解读指南
const viewGuide = () => {
  router.push('/policy/category')
}

// 查看法规汇编
const viewLaws = () => {
  router.push('/policy/list')
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 聚焦到搜索框
const searchInputRef = ref<HTMLInputElement | null>(null)
const focusSearch = () => {
  // 滚动到搜索框位置
  const searchElement = document.querySelector('.banner')
  if (searchElement) {
    searchElement.scrollIntoView({ behavior: 'smooth' })
  }
  
  // 聚焦搜索框
  setTimeout(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  }, 500)
}

onMounted(() => {
  // 这里应该从API获取数据
  console.log('政策中心页面已加载')
})
</script>

<style scoped>
.policy-container {
  padding: 20px;
}

.policy-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.card-header h2,
.card-header h3 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 350px;
}

.policy-tabs {
  margin-top: 20px;
}

.latest-policies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.policy-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.policy-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
}

.meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.policy-interpretation {
  margin-bottom: 20px;
}

.interpretation-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.interpretation-header h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.interpretation-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.interpretation-content {
  margin-bottom: 15px;
}

.interpretation-footer {
  display: flex;
  gap: 10px;
}

.category-section {
  margin-bottom: 20px;
}

.category-card {
  height: 100%;
  display: flex;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 40px;
  color: #409EFF;
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.category-info {
  flex: 1;
}

.category-title {
  margin: 0 0 5px;
  font-size: 16px;
}

.category-desc {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
}

.related-resources {
  margin-top: 30px;
  margin-bottom: 30px;
}

.section-title {
  margin: 30px 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.resource-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.resource-icon {
  color: #409EFF;
  margin-bottom: 15px;
}

.resource-info h4 {
  font-size: 16px;
  margin: 0 0 10px;
  color: #303133;
}

.resource-info p {
  color: #606266;
  font-size: 14px;
  margin: 0 0 20px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 10px;
  }
  
  .latest-policies {
    grid-template-columns: 1fr;
  }
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
</style> 