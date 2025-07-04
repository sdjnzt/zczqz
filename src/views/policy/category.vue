<template>
  <div class="policy-category-container">
    <el-card class="category-header-card">
      <template #header>
        <div class="card-header">
          <h2>政策法规分类</h2>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词搜索分类"
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
          </div>
        </div>
      </template>
      
      <!-- 分类导航 -->
      <div class="category-nav">
        <el-radio-group v-model="selectedCategory" @change="handleCategoryChange" size="large">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button v-for="category in categories" :key="category.value" :label="category.value">
            {{ category.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 分类项目列表 -->
      <div class="category-list">
        <div v-if="selectedCategory !== 'all'" class="current-category-info">
          <el-tag :type="getTagType(selectedCategory)" effect="dark" size="large">
            {{ getCategoryName(selectedCategory) }}
          </el-tag>
          <div class="category-description">
            {{ getCategoryDescription(selectedCategory) }}
          </div>
        </div>
        
        <el-empty v-if="filteredPolicies.length === 0" description="暂无相关政策" />
        <el-table
          v-else
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
      </div>
    </el-card>
    
    <!-- 分类统计 -->
    <el-card class="category-stats-card">
      <template #header>
        <div class="card-header">
          <h3>政策分布统计</h3>
          <div class="chart-actions">
            <el-radio-group v-model="chartView" size="small">
              <el-radio-button label="category">分类分布</el-radio-button>
              <el-radio-button label="year">年份分布</el-radio-button>
              <el-radio-button label="level">级别分布</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="stats-details">
            <h4>{{ getStatsTitle() }}</h4>
            <div class="stats-table">
              <el-table
                :data="getStatsData()"
                :show-header="false"
                :border="true"
                style="width: 100%"
              >
                <el-table-column prop="name" label="名称" width="180">
                  <template #default="scope">
                    <el-tag :type="getStatTagType(scope.row)" effect="plain">{{ scope.row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="数量" align="center" width="80" />
                <el-table-column prop="percent" label="百分比" align="right">
                  <template #default="scope">
                    <div class="percent-bar-container">
                      <div class="percent-bar" :style="{ width: scope.row.percent + '%', backgroundColor: scope.row.color }"></div>
                      <span class="percent-text">{{ scope.row.percent }}%</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="筛选" placement="left">
        <el-button type="primary" circle class="action-button" @click="handleSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="下载" placement="left">
        <el-button type="success" circle class="action-button" @click="downloadCategories">
          <el-icon><Download /></el-icon>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Document, Download, Top } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

// 路由
const route = useRoute()
const router = useRouter()

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索和筛选
const searchKeyword = ref('')
const selectedCategory = ref('all')
const chartView = ref('category')

// 分类数据
const categories = [
  { label: '农业政策', value: 'agriculture', description: '涵盖农业生产、农村发展、农民增收等方面的政策法规。' },
  { label: '教育政策', value: 'education', description: '涉及教育改革、学校管理、教师队伍建设等方面的政策法规。' },
  { label: '医疗卫生', value: 'healthcare', description: '包括医疗服务、公共卫生、疾病防控等方面的政策法规。' },
  { label: '社会保障', value: 'social-security', description: '关于社会保险、社会救助、社会福利等方面的政策法规。' },
  { label: '财政金融', value: 'finance', description: '涉及财政预算、金融服务、税收管理等方面的政策法规。' },
  { label: '城乡建设', value: 'construction', description: '关于城乡规划、住房保障、基础设施等方面的政策法规。' },
  { label: '交通运输', value: 'transportation', description: '包括道路交通、公共交通、物流运输等方面的政策法规。' },
  { label: '政务服务', value: 'government', description: '关于行政审批、公共服务、政府信息公开等方面的政策法规。' }
]

// 级别数据
const levels = [
  { label: '国家级', value: 'national' },
  { label: '省级', value: 'provincial' },
  { label: '市级', value: 'city' },
  { label: '县级', value: 'county' },
  { label: '镇级', value: 'town' }
]

// 图表颜色
const chartColors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
]

// 示例政策数据
const policies = ref([
  {
    id: 1,
    title: '关于促进城前镇农业产业化发展的实施意见',
    summary: '为加快推进城前镇农业产业化发展，提升农业现代化水平，特制定本实施意见。',
    category: 'agriculture',
    level: 'town',
    publishDate: '2025-06-01',
    source: '邹城市城前镇人民政府',
    views: 245
  },
  {
    id: 2,
    title: '城前镇农村宅基地管理办法（试行）',
    summary: '规范城前镇农村宅基地管理，保障农民合法权益，促进农村和谐稳定。',
    category: 'construction',
    level: 'town',
    publishDate: '2025-05-20',
    source: '邹城市自然资源局',
    views: 198
  },
  {
    id: 3,
    title: '关于加强城前镇基层医疗服务体系建设的通知',
    summary: '加强基层医疗卫生服务体系建设，提高农村医疗服务质量和水平。',
    category: 'healthcare',
    level: 'city',
    publishDate: '2025-05-15',
    source: '邹城市卫健委',
    views: 165
  },
  {
    id: 4,
    title: '城前镇农业生产补贴政策实施细则',
    summary: '明确农业生产补贴政策的实施范围、申请条件、补贴标准和程序。',
    category: 'agriculture',
    level: 'town',
    publishDate: '2025-05-10',
    source: '邹城市财政局',
    views: 320
  },
  {
    id: 5,
    title: '城前镇义务教育优质均衡发展实施方案',
    summary: '推进城前镇义务教育优质均衡发展，缩小城乡教育差距。',
    category: 'education',
    level: 'county',
    publishDate: '2025-05-05',
    source: '邹城市教育局',
    views: 185
  },
  {
    id: 6,
    title: '关于加强城前镇乡村治理体系建设的指导意见',
    summary: '健全完善城前镇乡村治理体系，提升乡村治理能力和水平。',
    category: 'social-security',
    level: 'county',
    publishDate: '2025-05-01',
    source: '邹城市民政局',
    views: 176
  },
  {
    id: 7,
    title: '山东省耕地保护与质量提升行动方案',
    summary: '加强耕地保护，提升耕地质量，保障粮食安全。',
    category: 'agriculture',
    level: 'provincial',
    publishDate: '2025-04-15',
    source: '山东省农业农村厅',
    views: 210
  },
  {
    id: 8,
    title: '邹城市农村人居环境整治提升五年行动实施方案',
    summary: '改善农村人居环境，建设美丽宜居乡村。',
    category: 'construction',
    level: 'city',
    publishDate: '2025-04-10',
    source: '邹城市农业农村局',
    views: 132
  },
  {
    id: 9,
    title: '关于开展城前镇农村人居环境整治行动的通知',
    summary: '开展农村人居环境整治，提升农村生活品质。',
    category: 'construction',
    level: 'town',
    publishDate: '2025-04-05',
    source: '邹城市城前镇人民政府',
    views: 156
  },
  {
    id: 10,
    title: '城前镇新型农村合作医疗制度实施方案',
    summary: '完善新型农村合作医疗制度，提高农村医疗保障水平。',
    category: 'healthcare',
    level: 'town',
    publishDate: '2025-04-01',
    source: '邹城市城前镇人民政府',
    views: 190
  },
  {
    id: 11,
    title: '关于实施乡村振兴战略的指导意见',
    summary: '全面实施乡村振兴战略，加快推进农业农村现代化。',
    category: 'agriculture',
    level: 'national',
    publishDate: '2025-03-20',
    source: '中共中央、国务院',
    views: 458
  },
  {
    id: 12,
    title: '邹城市城乡一体化发展规划',
    summary: '推进城乡一体化发展，缩小城乡差距。',
    category: 'construction',
    level: 'city',
    publishDate: '2025-03-15',
    source: '邹城市发改委',
    views: 178
  }
])

// 图表引用
const categoryChartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 过滤政策数据
const filteredPolicies = computed(() => {
  let result = [...policies.value]
  
  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(policy => policy.category === selectedCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(policy => 
      policy.title.toLowerCase().includes(keyword) ||
      policy.summary.toLowerCase().includes(keyword) ||
      policy.source.toLowerCase().includes(keyword)
    )
  }
  
  // 设置总数
  total.value = result.length
  
  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return result.slice(startIndex, endIndex)
})

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 处理每页显示条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理分类变化
const handleCategoryChange = () => {
  currentPage.value = 1
}

// 查看政策详情
const viewPolicy = (id: number) => {
  router.push(`/policy/detail/${id}`)
}

// 下载政策
const downloadPolicy = (policy: any) => {
  ElMessage.success(`正在下载: ${policy.title}`)
}

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.label : categoryId
}

// 获取分类描述
const getCategoryDescription = (categoryId: string): string => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.description : ''
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
    'construction': '',
    'transportation': 'success',
    'government': 'info'
  }
  return typeMap[categoryId] || ''
}

// 获取统计标签类型
const getStatTagType = (stat: any): string => {
  if (chartView.value === 'category') {
    return getTagType(stat.id)
  }
  if (chartView.value === 'level') {
    return stat.id === 'town' ? 'success' : 'info'
  }
  return ''
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dateStr
}

// 处理行点击
const handleRowClick = (row: any) => {
  viewPolicy(row.id)
}

// 统计数据计算
const getCategoryStats = () => {
  return categories.map((category, index) => {
    const count = policies.value.filter(policy => policy.category === category.value).length
    const percent = Math.round((count / policies.value.length) * 100)
    return {
      id: category.value,
      name: category.label,
      value: count,
      percent: percent,
      color: chartColors[index % chartColors.length]
    }
  }).sort((a, b) => b.value - a.value)
}

const getYearStats = () => {
  const years = ['2021', '2022', '2025', '2024', '2025']
  return years.map((year, index) => {
    const count = policies.value.filter(policy => policy.publishDate.startsWith(year)).length
    const percent = Math.round((count / policies.value.length) * 100)
    return {
      id: year,
      name: year + '年',
      value: count,
      percent: percent,
      color: chartColors[index % chartColors.length]
    }
  }).sort((a, b) => b.value - a.value)
}

const getLevelStats = () => {
  return levels.map((level, index) => {
    const count = policies.value.filter(policy => policy.level === level.value).length
    const percent = Math.round((count / policies.value.length) * 100)
    return {
      id: level.value,
      name: level.label,
      value: count,
      percent: percent,
      color: chartColors[index % chartColors.length]
    }
  }).sort((a, b) => b.value - a.value)
}

// 获取统计标题
const getStatsTitle = () => {
  if (chartView.value === 'category') return '政策分类统计'
  if (chartView.value === 'year') return '政策年份统计'
  if (chartView.value === 'level') return '政策级别统计'
  return ''
}

// 获取统计数据
const getStatsData = () => {
  if (chartView.value === 'category') return getCategoryStats()
  if (chartView.value === 'year') return getYearStats()
  if (chartView.value === 'level') return getLevelStats()
  return []
}

// 更新图表
const updateChart = () => {
  if (!categoryChartRef.value) return
  if (!chart) {
    chart = echarts.init(categoryChartRef.value)
  }
  
  let statsData = getStatsData()
  let title = getStatsTitle()
  
  chart.setOption({
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: statsData.map(item => item.name)
    },
    series: [
      {
        name: '政策数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: statsData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  })
}

// 监听路由参数变化
watch(() => route.query, (query) => {
  if (query.id) {
    selectedCategory.value = query.id as string
  }
}, { immediate: true })

// 监听分类视图变化
watch(chartView, () => {
  updateChart()
})

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  chart?.resize()
}

// 下载分类数据
const downloadCategories = () => {
  ElMessage.success('正在下载分类数据...')
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  // 初始化数据，在实际应用中这里会从API获取数据
  total.value = policies.value.length
  
  // 初始化图表
  setTimeout(() => {
    updateChart()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  }, 200)
})
</script>

<style scoped>
.policy-category-container {
  padding: 20px;
}

.category-header-card,
.category-stats-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.category-header-card:hover,
.category-stats-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
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
  font-size: 18px;
  display: flex;
  align-items: center;
}

.card-header h2::before,
.card-header h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
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

.category-nav {
  margin: 20px 0;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
}

.current-category-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.category-description {
  margin-top: 10px;
  color: #606266;
  line-height: 1.6;
}

.category-list {
  margin-bottom: 20px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.chart-actions {
  margin-bottom: 15px;
}

.stats-details {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.stats-details h4 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.stats-table {
  flex: 1;
  overflow-y: auto;
}

.percent-bar-container {
  position: relative;
  height: 20px;
  background-color: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.percent-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #409EFF;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.percent-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #303133;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 10px;
  }
  
  .chart-actions {
    margin-top: 10px;
    width: 100%;
  }
  
  .chart-container {
    height: 300px;
    margin-bottom: 20px;
  }
  
  .stats-details {
    height: auto;
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