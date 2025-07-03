<template>
  <div class="agriculture-container">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>耕地面积</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">13,200</div>
            <div class="unit">亩</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农业产值</span>
              <el-tag size="small" type="success">年度</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">3.2</div>
            <div class="unit">亿元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农业合作社</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">32</div>
            <div class="unit">个</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农业人口</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">16,200</div>
            <div class="unit">人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农机设备数</span>
              <el-tag size="small" type="info">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">185</div>
            <div class="unit">台/套</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农产品种类数</span>
              <el-tag size="small" type="info">年度</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">24</div>
            <div class="unit">种</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-bar">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="输入政策关键词搜索"
          clearable
          @keyup.enter="searchPolicies"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button :icon="Search" @click="searchPolicies">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="action-buttons">
        <el-button type="primary" :icon="RefreshRight" @click="refreshAllData">刷新全部数据</el-button>
        <el-button type="success" :icon="Document" @click="exportAgriculturalData">导出农业数据</el-button>
        <el-button type="warning" :icon="PieChart" @click="showAnalysisDialog = true">数据分析</el-button>
      </div>
    </div>

    <!-- 产业分布图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农业产业结构分布</span>
              <div>
                <el-button type="primary" link :icon="RefreshRight" @click="refreshChart('industry')">刷新</el-button>
                <el-button type="primary" link :icon="Download" @click="exportChart('industry')">导出</el-button>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="industryChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>农业产值趋势</span>
              <div>
                <el-button type="primary" link :icon="RefreshRight" @click="refreshChart('trend')">刷新</el-button>
                <el-button type="primary" link :icon="Download" @click="exportChart('trend')">导出</el-button>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 全局搜索框 -->
    <el-card class="search-section" shadow="hover" v-if="showSearchBox">
      <template #header>
        <div class="card-header">
          <span>查看政策详情</span>
          <el-button type="danger" link :icon="Close" @click="showSearchBox = false">关闭</el-button>
        </div>
      </template>
      <div class="policy-detail">
        <div class="detail-item">
          <span class="label">政策类型：</span>
          <span>{{ currentPolicy.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布部门：</span>
          <span>{{ currentPolicy.department }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布日期：</span>
          <span>{{ currentPolicy.publishDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="currentPolicy.status === '已生效' ? 'success' : 'warning'">
            {{ currentPolicy.status }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">政策内容：</span>
          <div class="content">{{ currentPolicy.content || '这里是政策的详细内容，包含政策的具体措施、执行时间、覆盖范围等信息。' }}</div>
        </div>
      </div>
    </el-card>

    <!-- 政策信息 -->
    <el-card class="policy-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>农业政策信息</span>
          <div>
            <el-button type="primary" size="small" :icon="Plus" @click="showPolicyDialog = true">发布政策</el-button>
            <el-button type="success" size="small" :icon="RefreshRight" @click="refreshPolicyList">刷新</el-button>
            <el-button type="info" size="small" :icon="Download" @click="exportPolicyList">导出</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleBatchDelete" :disabled="selectedPolicies.length === 0">
              批量删除
            </el-button>
          </div>
        </div>
      </template>
      <el-table 
        :data="policyList" 
        style="width: 100%" 
        v-loading="policyLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="政策标题" min-width="200" />
        <el-table-column prop="type" label="政策类型" width="100" />
        <el-table-column prop="department" label="发布部门" width="150" />
        <el-table-column prop="publishDate" label="发布日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已生效' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-tooltip content="查看详情" placement="top" effect="light">
                <el-button class="operation-button" type="primary" :icon="View" circle @click="viewPolicy(row)" />
              </el-tooltip>
              <el-tooltip content="编辑政策" placement="top" effect="light">
                <el-button class="operation-button" type="warning" :icon="Edit" circle @click="editPolicy(row)" />
              </el-tooltip>
              <el-tooltip content="删除政策" placement="top" effect="light">
                <el-button class="operation-button" type="danger" :icon="Delete" circle @click="deletePolicy(row)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="policyPage"
          v-model:page-size="policyPageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="policyTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 发布政策对话框 -->
    <el-dialog
      v-model="showPolicyDialog"
      title="发布农业政策"
      width="600px"
    >
      <el-form :model="policyForm" label-width="100px" :rules="policyRules" ref="policyFormRef">
        <el-form-item label="政策标题" prop="title">
          <el-input v-model="policyForm.title" placeholder="请输入政策标题"></el-input>
        </el-form-item>
        <el-form-item label="政策类型" prop="type">
          <el-select v-model="policyForm.type" placeholder="请选择政策类型" style="width: 100%">
            <el-option v-for="item in policyTypes" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布部门" prop="department">
          <el-select v-model="policyForm.department" placeholder="请选择发布部门" style="width: 100%">
            <el-option v-for="item in departments" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="政策内容" prop="content">
          <el-input v-model="policyForm.content" type="textarea" :rows="4" placeholder="请输入政策内容"></el-input>
        </el-form-item>
        <el-form-item label="发布日期" prop="publishDate">
          <el-date-picker v-model="policyForm.publishDate" type="date" placeholder="请选择发布日期" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="policyForm.status">
            <el-radio label="已生效">已生效</el-radio>
            <el-radio label="待生效">待生效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPolicyDialog = false">取消</el-button>
          <el-button type="primary" @click="submitPolicy">确认</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 数据分析对话框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      title="农业数据分析"
      width="800px"
    >
      <div class="analysis-content">
        <el-tabs v-model="analysisActiveTab">
          <el-tab-pane label="产业结构分析" name="structure">
            <div class="analysis-chart-container" ref="analysisChartRef"></div>
            <div class="analysis-description">
              <p>产业结构分析显示，粮食种植仍然是我镇农业的主要产业，占总产业的38%。经济作物和蔬菜种植也占据了较大比例，分别为22%和14%。未来可以适当增加经济效益更高的果树种植和畜牧养殖比例，以提升农业整体收益。</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="增长趋势分析" name="trend">
            <div class="analysis-chart-container" ref="trendAnalysisChartRef"></div>
            <div class="analysis-description">
              <p>近六年来，我镇农业产值稳步增长，从2020年的1.8亿元增长到2025年的3.2亿元，年均增长率约12.2%。这表明农业发展态势良好，特别是2024-2025年增长更为明显，这与新型农业项目的引入和农业补贴政策的优化有关。</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="建议措施" name="suggestions">
            <div class="suggestion-list">
              <h3>1. 产业结构优化建议</h3>
              <p>适当增加经济作物和特色农产品的种植面积，减少低效粮食作物面积。重点发展具有地方特色的农产品，打造农产品品牌。</p>
              
              <h3>2. 农业科技应用建议</h3>
              <p>加大智慧农业技术应用，引进先进农业设备，提高农业生产效率。建立农业大数据中心，为农业决策提供数据支持。</p>
              
              <h3>3. 农业人才培养建议</h3>
              <p>加强农民职业技能培训，培养新型农业人才。引进农业专业技术人员，为农业发展提供技术支持。</p>
              
              <h3>4. 农业政策调整建议</h3>
              <p>优化农业补贴政策，向高效、环保、可持续农业倾斜。完善农产品质量安全监管体系，提高农产品市场竞争力。</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
    
    <!-- 政策详情对话框 -->
    <el-dialog
      v-model="showPolicyDetailDialog"
      :title="currentPolicy.title"
      width="600px"
    >
      <div class="policy-detail">
        <div class="detail-item">
          <span class="label">政策类型：</span>
          <span>{{ currentPolicy.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布部门：</span>
          <span>{{ currentPolicy.department }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布日期：</span>
          <span>{{ currentPolicy.publishDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="currentPolicy.status === '已生效' ? 'success' : 'warning'">
            {{ currentPolicy.status }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">政策内容：</span>
          <div class="content">{{ currentPolicy.content || '这里是政策的详细内容，包含政策的具体措施、执行时间、覆盖范围等信息。' }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  Plus, 
  View, 
  Edit, 
  Delete, 
  Download, 
  RefreshRight, 
  Document, 
  PieChart,
  Close,
  Search
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { baseActions, dataActions } from '@/utils/buttonActions'
import type { FormInstance, FormRules } from 'element-plus'

// 图表引用
const industryChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const analysisChartRef = ref<HTMLElement>()
const trendAnalysisChartRef = ref<HTMLElement>()
let industryChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let analysisChart: echarts.ECharts | null = null
let trendAnalysisChart: echarts.ECharts | null = null

// 搜索相关
const searchKeyword = ref('')
const showSearchBox = ref(false)

// 批量删除相关
const selectedPolicies = ref<any[]>([])

// 政策相关数据
const policyLoading = ref(false)
const policyPage = ref(1)
const policyPageSize = ref(10)
const policyTotal = ref(8)
const showPolicyDialog = ref(false)
const showPolicyDetailDialog = ref(false)
const policyFormRef = ref<FormInstance>()
const currentPolicy = ref({
  id: 0,
  title: '',
  type: '',
  department: '',
  publishDate: '',
  status: '',
  content: ''
})

// 政策类型和部门选项
const policyTypes = [
  '补贴', '规划', '技术', '指导', '监管', '激励', '品牌'
]

const departments = [
  '农业办公室', '经济发展办公室', '农业技术推广站', '信息化办公室', '市场监管所', '生态环境办公室'
]

// 政策表单
const policyForm = reactive({
  title: '',
  type: '',
  department: '',
  content: '',
  publishDate: '',
  status: '已生效'
})

// 表单验证规则
const policyRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择政策类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择发布部门', trigger: 'change' }],
  publishDate: [{ required: true, message: '请选择发布日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择政策状态', trigger: 'change' }]
})

// 政策列表数据
const policyList = ref([
  {
    id: 1,
    title: '关于2025年农业补贴政策的通知',
    type: '补贴',
    department: '农业办公室',
    publishDate: '2025-06-15',
    status: '已生效'
  },
  {
    id: 2,
    title: '城前镇农业产业发展规划（2025-2027）',
    type: '规划',
    department: '经济发展办公室',
    publishDate: '2025-06-10',
    status: '已生效'
  },
  {
    id: 3,
    title: '关于加强农业技术推广工作的通知',
    type: '技术',
    department: '农业技术推广站',
    publishDate: '2025-06-05',
    status: '已生效'
  },
  {
    id: 4,
    title: '关于推进智慧农业建设的指导意见',
    type: '指导',
    department: '信息化办公室',
    publishDate: '2025-06-01',
    status: '已生效'
  },
  {
    id: 5,
    title: '农产品质量安全监管办法',
    type: '监管',
    department: '市场监管所',
    publishDate: '2025-06-10',
    status: '已生效'
  },
  {
    id: 6,
    title: '关于开展农机购置补贴的通知',
    type: '补贴',
    department: '农业办公室',
    publishDate: '2025-06-15',
    status: '已生效'
  },
  {
    id: 7,
    title: '绿色农业发展激励政策',
    type: '激励',
    department: '生态环境办公室',
    publishDate: '2025-06-20',
    status: '已生效'
  },
  {
    id: 8,
    title: '关于加强农产品品牌建设的通知',
    type: '品牌',
    department: '农业办公室',
    publishDate: '2025-06-25',
    status: '已生效'
  }
])

// 数据分析相关
const showAnalysisDialog = ref(false)
const analysisActiveTab = ref('structure')

// 刷新所有数据
const refreshAllData = () => {
  baseActions.refresh(() => {
    refreshChart('industry')
    refreshChart('trend')
    refreshPolicyList()
  })
}

// 导出农业数据
const exportAgriculturalData = () => {
  baseActions.export('农业产业')
}

// 刷新图表数据
const refreshChart = (type: string) => {
  ElMessage.info(`正在刷新${type === 'industry' ? '产业结构' : '产值趋势'}数据...`)
  
  setTimeout(() => {
    if (type === 'industry' && industryChart) {
      // 模拟更新数据
      const newData = [
        { value: 38, name: '粮食种植' },
        { value: 22, name: '经济作物' },
        { value: 14, name: '蔬菜种植' },
        { value: 10, name: '果树种植' },
        { value: 10, name: '畜牧养殖' },
        { value: 4, name: '水产养殖' },
        { value: 2, name: '其他' }
      ]
      industryChart.setOption({
        series: [{
          data: newData
        }]
      })
    } else if (type === 'trend' && trendChart) {
      // 模拟更新数据
      const newData = [1.8, 2.0, 2.3, 2.5, 2.8, 3.2]
      trendChart.setOption({
        series: [{
          data: newData
        }]
      })
    }
    
    ElMessage.success(`${type === 'industry' ? '产业结构' : '产值趋势'}数据已更新`)
  }, 800)
}

// 导出图表
const exportChart = (type: string) => {
  ElMessage.success(`已导出${type === 'industry' ? '产业结构' : '产值趋势'}图表`)
}

// 刷新政策列表
const refreshPolicyList = () => {
  policyLoading.value = true
  baseActions.refresh(() => {
    policyLoading.value = false
  })
}

// 导出政策列表
const exportPolicyList = () => {
  baseActions.export('农业政策')
}

// 搜索政策
const searchPolicies = () => {
  if (!searchKeyword.value.trim()) {
    return
  }
  
  policyLoading.value = true
  
  // 模拟搜索过程
  setTimeout(() => {
    const keyword = searchKeyword.value.toLowerCase()
    const filteredPolicies = policyList.value.filter(policy => 
      policy.title.toLowerCase().includes(keyword) || 
      policy.type.toLowerCase().includes(keyword) || 
      policy.department.toLowerCase().includes(keyword)
    )
    
    if (filteredPolicies.length > 0) {
      // 显示搜索结果
      policyList.value = filteredPolicies
      ElMessage.success(`找到 ${filteredPolicies.length} 条相关政策`)
    } else {
      ElMessage.warning('未找到相关政策')
      // 恢复原始列表
      refreshPolicyList()
    }
    
    policyLoading.value = false
  }, 500)
}

// 查看政策详情
const viewPolicy = (row: any) => {
  currentPolicy.value = {...row}
  showPolicyDetailDialog.value = true
  dataActions.view('政策详情')
}

// 编辑政策
const editPolicy = (row: any) => {
  // 填充表单
  Object.assign(policyForm, row)
  showPolicyDialog.value = true
  dataActions.edit('政策信息')
}

// 删除政策
const deletePolicy = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除政策"${row.title}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      icon: Delete
    }
  ).then(() => {
    // 模拟删除操作
    const index = policyList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      policyList.value.splice(index, 1)
      policyTotal.value -= 1
      ElMessage.success(`政策"${row.title}"已删除`)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交政策
const submitPolicy = () => {
  policyFormRef.value?.validate((valid) => {
    if (valid) {
      // 检查是否是编辑现有政策
      const existingIndex = policyList.value.findIndex(p => p.id === currentPolicy.value.id)
      
      if (existingIndex !== -1) {
        // 更新现有政策
        const updatedPolicy = {
          ...policyList.value[existingIndex],
          ...policyForm
        }
        policyList.value[existingIndex] = updatedPolicy
        ElMessage.success('政策信息已更新')
      } else {
        // 添加新政策
        const newPolicy = {
          id: Date.now(),
          ...policyForm,
          publishDate: typeof policyForm.publishDate === 'string' 
            ? policyForm.publishDate 
            : new Date(policyForm.publishDate).toLocaleDateString('zh-CN')
        }
        policyList.value.unshift(newPolicy)
        policyTotal.value += 1
        ElMessage.success('新政策已发布')
      }
      
      // 重置表单并关闭对话框
      resetPolicyForm()
      showPolicyDialog.value = false
    } else {
      ElMessage.error('请完善表单信息')
    }
  })
}

// 重置政策表单
const resetPolicyForm = () => {
  if (policyFormRef.value) {
    policyFormRef.value.resetFields()
  }
  Object.assign(policyForm, {
    title: '',
    type: '',
    department: '',
    content: '',
    publishDate: '',
    status: '已生效'
  })
  currentPolicy.value = {
    id: 0,
    title: '',
    type: '',
    department: '',
    publishDate: '',
    status: '',
    content: ''
  }
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  policyPageSize.value = size
  // 在实际项目中这里应该重新加载数据
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  policyPage.value = page
  // 在实际项目中这里应该重新加载数据
}

// 表格选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedPolicies.value = selection
}

// 批量删除处理
const handleBatchDelete = () => {
  if (selectedPolicies.value.length === 0) {
    ElMessage.warning('请先选择要删除的政策')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedPolicies.value.length} 条政策吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      icon: Delete
    }
  ).then(() => {
    // 模拟批量删除操作
    const ids = selectedPolicies.value.map(item => item.id)
    policyList.value = policyList.value.filter(item => !ids.includes(item.id))
    policyTotal.value -= selectedPolicies.value.length
    ElMessage.success(`已删除 ${selectedPolicies.value.length} 条政策`)
    selectedPolicies.value = []
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 初始化产业分布图表
const initIndustryChart = () => {
  if (!industryChartRef.value) return
  industryChart = echarts.init(industryChartRef.value)
  const option = {
    title: {
      text: '农业产业结构',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '产业分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 38, name: '粮食种植' },
          { value: 22, name: '经济作物' },
          { value: 14, name: '蔬菜种植' },
          { value: 10, name: '果树种植' },
          { value: 10, name: '畜牧养殖' },
          { value: 4, name: '水产养殖' },
          { value: 2, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  industryChart.setOption(option)
}

// 初始化产值趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    title: {
      text: '农业产值趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2025', '2025', '2025']
    },
    yAxis: {
      type: 'value',
      name: '亿元'
    },
    series: [
      {
        name: '农业产值',
        type: 'line',
        data: [1.8, 2.0, 2.3, 2.5, 2.8, 3.2],
        smooth: true,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化分析图表
const initAnalysisCharts = () => {
  if (analysisChartRef.value) {
    analysisChart = echarts.init(analysisChartRef.value)
    analysisChart.setOption({
      title: {
        text: '农业产业结构详细分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: ['粮食种植', '经济作物', '蔬菜种植', '果树种植', '畜牧养殖', '水产养殖', '其他']
      },
      series: [
        {
          name: '产业占比',
          type: 'pie',
          radius: ['50%', '70%'],
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
              fontSize: 15,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 38, name: '粮食种植' },
            { value: 22, name: '经济作物' },
            { value: 14, name: '蔬菜种植' },
            { value: 10, name: '果树种植' },
            { value: 10, name: '畜牧养殖' },
            { value: 4, name: '水产养殖' },
            { value: 2, name: '其他' }
          ]
        }
      ]
    })
  }
  
  if (trendAnalysisChartRef.value) {
    trendAnalysisChart = echarts.init(trendAnalysisChartRef.value)
    trendAnalysisChart.setOption({
      title: {
        text: '农业产值增长趋势详细分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}年<br/>{a0}: {c0}亿元<br/>增长率: {c1}%'
      },
      legend: {
        data: ['产值', '增长率'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2025', '2025', '2025']
      },
      yAxis: [
        {
          type: 'value',
          name: '亿元',
          position: 'left'
        },
        {
          type: 'value',
          name: '增长率(%)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '产值',
          type: 'bar',
          data: [1.8, 2.0, 2.3, 2.5, 2.8, 3.2]
        },
        {
          name: '增长率',
          type: 'line',
          yAxisIndex: 1,
          data: [0, 11.1, 15.0, 8.7, 12.0, 14.3]
        }
      ]
    })
  }
}

// 监听分析对话框打开
const handleAnalysisDialogOpen = () => {
  setTimeout(() => {
    initAnalysisCharts()
  }, 200)
}

onMounted(() => {
  initIndustryChart()
  initTrendChart()
})

// 监听分析对话框的打开
watch(showAnalysisDialog, (val) => {
  if (val) {
    handleAnalysisDialogOpen()
  }
})

// 监听分析选项卡切换
watch(analysisActiveTab, () => {
  nextTick(() => {
    if (analysisActiveTab.value === 'structure' && analysisChart) {
      analysisChart.resize()
    }
    if (analysisActiveTab.value === 'trend' && trendAnalysisChart) {
      trendAnalysisChart.resize()
    }
  })
})
</script>

<style scoped>
.agriculture-container {
  padding: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 10px 0;
}

.card-content .value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-content .unit {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.search-box {
  width: 300px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.policy-section {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.operation-button {
  font-size: 16px;
}

/* 政策详情样式 */
.policy-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item .label {
  font-weight: bold;
  margin-right: 10px;
}

.detail-item .content {
  margin-top: 10px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  line-height: 1.6;
}

/* 分析对话框样式 */
.analysis-chart-container {
  height: 400px;
  margin-bottom: 20px;
}

.analysis-description {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
}

.suggestion-list {
  padding: 10px;
}

.suggestion-list h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.suggestion-list p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #606266;
}

:deep(.el-card__header) {
  padding: 15px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--primary.is-link:hover) {
  background: none !important;
  border: none !important;
  color: #409EFF !important;
  box-shadow: none !important;
}

.search-section {
  margin-bottom: 20px;
}
</style> 