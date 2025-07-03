<template>
  <div class="grid-container">
    <!-- 网格概览 -->
    <el-row :gutter="20" class="grid-overview">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in overviewData" :key="index">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <el-icon class="card-icon" :class="item.type">
              <component :is="item.icon" />
            </el-icon>
            <div class="stat-content">
              <div class="stat-title">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-trend up" v-if="item.trend">
                <el-icon v-if="item.trend === 'up'"><Top /></el-icon>
                <el-icon v-else><Bottom /></el-icon>
                {{ item.trendText }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 只保留下方的el-tabs及其内容 -->
    <el-card class="grid-management" shadow="hover" v-loading="loading">
      <el-tabs v-model="activeTab" class="custom-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="网格员管理" name="staff">
          <div class="tab-header">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item>
                <el-input
                  v-model="searchForm.keyword"
                  placeholder="姓名/手机号"
                  clearable
                  :prefix-icon="Search"
                />
              </el-form-item>
              <el-form-item>
                <el-select v-model="searchForm.grid" placeholder="所属网格" clearable>
                  <el-option
                    v-for="item in gridOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" :icon="Plus" @click="handleAddStaff">新增网格员</el-button>
          </div>

          <StaffTable
            :data="staffList"
            :loading="tableLoading"
            @view="viewStaff"
            @edit="editStaff"
            @delete="deleteStaff"
          />

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-tab-pane>

        <!-- 事件处理 -->
        <el-tab-pane label="事件处理" name="events">
          <div class="tab-header">
            <el-form :inline="true" :model="eventSearchForm" class="search-form">
              <el-form-item>
                <el-input
                  v-model="eventSearchForm.keyword"
                  placeholder="事件标题"
                  clearable
                  :prefix-icon="Search"
                />
              </el-form-item>
              <el-form-item>
                <el-select v-model="eventSearchForm.status" placeholder="处理状态" clearable>
                  <el-option label="待处理" value="pending" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleEventSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="resetEventSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" :icon="Plus" @click="handleAddEvent">新增事件</el-button>
          </div>

          <el-table
            :data="eventList"
            style="width: 100%"
            border
            stripe
            highlight-current-row
            v-loading="tableLoading"
          >
            <el-table-column type="index" width="50" align="center" />
            <el-table-column prop="title" label="事件标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="type" label="事件类型" width="120" />
            <el-table-column prop="grid" label="所属网格" width="120" />
            <el-table-column prop="reporter" label="上报人" width="120" />
            <el-table-column prop="reportTime" label="上报时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventStatusType(row.status)" effect="dark">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" :icon="View" @click="viewEvent(row)" />
                  <el-button type="warning" :icon="Edit" @click="handleEvent(row)" />
                  <el-button type="danger" :icon="Delete" @click="deleteEvent(row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="eventCurrentPage"
              v-model:page-size="eventPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="eventTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleEventSizeChange"
              @current-change="handleEventCurrentChange"
            />
          </div>
        </el-tab-pane>

        <!-- 统计分析 -->
        <el-tab-pane label="统计分析" name="analysis">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>事件类型分布</span>
                    <el-radio-group v-model="chartTimeRange" size="small">
                      <el-radio-button label="week">本周</el-radio-button>
                      <el-radio-button label="month">本月</el-radio-button>
                      <el-radio-button label="year">全年</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-container" ref="eventTypeChartRef"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>事件处理趋势</span>
                    <el-radio-group v-model="trendTimeRange" size="small">
                      <el-radio-button label="week">本周</el-radio-button>
                      <el-radio-button label="month">本月</el-radio-button>
                      <el-radio-button label="year">全年</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-container" ref="eventTrendChartRef"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 网格管理对话框 -->
    <CommonDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="网格名称" prop="name">
          <el-input v-model="formData.name" :disabled="dialogTitle === '查看网格'" />
        </el-form-item>
        <el-form-item label="网格长" prop="manager">
          <el-input v-model="formData.manager" :disabled="dialogTitle === '查看网格'" />
        </el-form-item>
        <el-form-item label="人口" prop="population">
          <el-input v-model="formData.population" :disabled="dialogTitle === '查看网格'" />
        </el-form-item>
        <el-form-item label="户数" prop="households">
          <el-input v-model="formData.households" :disabled="dialogTitle === '查看网格'" />
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input v-model="formData.area" :disabled="dialogTitle === '查看网格'">
            <template #append>平方公里</template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" :disabled="dialogTitle === '查看网格'" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
      </template>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import {
  Refresh,
  Search,
  Plus,
  View,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import StaffTable from '@/components/StaffTable.vue'
import { gridList, gridMethods } from '@/store/data'
import * as echarts from 'echarts'

// 定义类型
interface OverviewItem {
  label: string
  value: string
  unit: string
  icon: string
  type: string
  trend?: 'up' | 'down'
  trendText?: string
  tag?: string
  tagType?: string
}

interface SearchForm {
  keyword: string
  status: string
  grid: string
}

interface FormData {
  name: string
  manager: string
  population: string
  households: string
  area: string
  status: string
}

interface StaffItem {
  id: number
  name: string
  phone: string
  grid: string
  area: string
  status: '在岗' | '请假'
}

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)

// 搜索表单
const searchForm = reactive<SearchForm>({
  keyword: '',
  status: '',
  grid: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const eventCurrentPage = ref(1)
const eventPageSize = ref(10)
const eventTotal = ref(100)

// 图表时间范围
const chartTimeRange = ref('month')
const trendTimeRange = ref('month')

// 概览数据
const overviewData = ref<OverviewItem[]>([
  {
    label: '网格总数',
    value: '5',
    unit: '个',
    icon: 'Location',
    type: 'primary',
    trend: 'up',
    trendText: '较上年增加1个',
    tag: '正常',
    tagType: 'success'
  },
  {
    label: '网格人口',
    value: '6,080',
    unit: '人',
    icon: 'User',
    type: 'success',
    trend: 'up',
    trendText: '较上年增长2.5%',
    tag: '正常',
    tagType: 'success'
  },
  {
    label: '网格户数',
    value: '1,750',
    unit: '户',
    icon: 'UserFilled',
    type: 'warning',
    trend: 'up',
    trendText: '较上年增加50户',
    tag: '正常',
    tagType: 'success'
  },
  {
    label: '网格面积',
    value: '12.5',
    unit: '平方公里',
    icon: 'Money',
    type: 'info',
    trend: 'up',
    trendText: '较上年增加0.5平方公里',
    tag: '正常',
    tagType: 'success'
  }
])

// 当前激活的标签页
const activeTab = ref('staff')

// 事件搜索表单
const eventSearchForm = reactive({
  keyword: '',
  status: ''
})

// 网格选项
const gridOptions = [
  { value: '城前镇北区网格', label: '城前镇北区网格' },
  { value: '城前镇南区网格', label: '城前镇南区网格' },
  { value: '城前镇中心区网格', label: '城前镇中心区网格' },
  { value: '城前镇东区网格', label: '城前镇东区网格' },
  { value: '城前镇西区网格', label: '城前镇西区网格' },
  { value: '城前镇农业园区网格', label: '城前镇农业园区网格' }
]

// 网格员列表数据
const staffList = ref<StaffItem[]>([
  { id: 1, name: '张志强', phone: '15865432198', grid: '城前镇北区网格', area: '城前镇北区新村、北环路社区、光明小区', status: '在岗' },
  { id: 2, name: '李建国', phone: '13776549821', grid: '城前镇南区网格', area: '城前镇南区幸福里、文昌社区、和平村', status: '在岗' },
  { id: 3, name: '王文明', phone: '18932156478', grid: '城前镇中心区网格', area: '城前镇中心区政府广场、商业街、振兴路', status: '在岗' },
  { id: 4, name: '赵丽娜', phone: '13798765432', grid: '城前镇东区网格', area: '城前镇东区阳光社区、东风村、长兴路', status: '请假' },
  { id: 5, name: '孙志远', phone: '17865432109', grid: '城前镇西区网格', area: '城前镇西区西湖家园、康居苑、西郊村', status: '在岗' }
])

// 事件列表数据
const eventList = ref([
  { id: 1, title: '城前镇北区新村2号楼下水管道堵塞', type: '基础设施', grid: '城前镇北区网格', reporter: '居民王大明', reportTime: '2025-06-15 08:30', status: '待处理' },
  { id: 2, title: '城前镇南区幸福里小区垃圾清运不及时', type: '环境卫生', grid: '城前镇南区网格', reporter: '网格员李建国', reportTime: '2025-06-14 14:20', status: '处理中' },
  { id: 3, title: '城前镇中心区商业街店铺与居民噪音纠纷', type: '矛盾纠纷', grid: '城前镇中心区网格', reporter: '商户张老板', reportTime: '2025-06-13 09:15', status: '已完成' },
  { id: 4, title: '城前镇东区阳光社区5栋电线老化需更换', type: '安全隐患', grid: '城前镇东区网格', reporter: '物业刘经理', reportTime: '2025-06-12 11:40', status: '待处理' },
  { id: 5, title: '城前镇西区西湖家园公共健身设施损坏', type: '基础设施', grid: '城前镇西区网格', reporter: '居民老张', reportTime: '2025-06-11 16:50', status: '处理中' },
  { id: 6, title: '城前镇中心区振兴路夜市摊位扰民投诉', type: '矛盾纠纷', grid: '城前镇中心区网格', reporter: '居民李大爷', reportTime: '2025-06-10 19:25', status: '待处理' },
  { id: 7, title: '城前镇北区光明小区雨后积水严重', type: '基础设施', grid: '城前镇北区网格', reporter: '网格员张志强', reportTime: '2025-06-09 08:30', status: '处理中' },
  { id: 8, title: '城前镇农业园区智慧农业区灌溉系统故障', type: '基础设施', grid: '城前镇农业园区网格', reporter: '工作人员小李', reportTime: '2025-06-08 10:10', status: '已完成' },
  { id: 9, title: '城前镇东区长兴路路灯不亮', type: '基础设施', grid: '城前镇东区网格', reporter: '居民陈大姐', reportTime: '2025-06-07 17:20', status: '待处理' },
  { id: 10, title: '城前镇西区康居苑小区门禁系统故障', type: '安全隐患', grid: '城前镇西区网格', reporter: '物业王经理', reportTime: '2025-06-06 12:00', status: '处理中' }
])

// 图表引用
const eventTypeChartRef = ref<null | HTMLElement>(null)
const eventTrendChartRef = ref<null | HTMLElement>(null)
let eventTypeChartInstance: echarts.ECharts | null = null
let eventTrendChartInstance: echarts.ECharts | null = null

// 获取事件状态对应的标签类型
const getEventStatusType = (status: string) => {
  switch (status) {
    case '待处理':
      return 'warning'
    case '处理中':
      return 'primary'
    case '已完成':
      return 'success'
    default:
      return 'info'
  }
}

// 初始化事件类型分布图表
const initEventTypeChart = () => {
  nextTick(() => {
    if (!eventTypeChartRef.value) return
    if (eventTypeChartInstance) {
      eventTypeChartInstance.dispose()
    }
    eventTypeChartInstance = echarts.init(eventTypeChartRef.value)
    const option = {
      title: {
        text: '事件类型分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        padding: 5
      },
      series: [
        {
          name: '事件类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
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
          data: [
            { value: 42, name: '基础设施' },
            { value: 18, name: '环境卫生' },
            { value: 15, name: '矛盾纠纷' },
            { value: 12, name: '安全隐患' },
            { value: 8, name: '其他' }
          ]
        }
      ]
    }
    eventTypeChartInstance.setOption(option)
  })
}

// 初始化事件处理趋势图表
const initEventTrendChart = () => {
  nextTick(() => {
    if (!eventTrendChartRef.value) return
    if (eventTrendChartInstance) {
      eventTrendChartInstance.dispose()
    }
    eventTrendChartInstance = echarts.init(eventTrendChartRef.value)
    const option = {
      title: {
        text: '事件处理趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['4月', '5月', '6月', '7月', '8月', '9月'],
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '事件数量'
      },
      series: [
        {
          name: '事件数量',
          type: 'line',
          smooth: true,
          data: [45, 52, 63, 58, 71, 65],
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 3
          },
          itemStyle: {
            borderWidth: 2
          }
        }
      ]
    }
    eventTrendChartInstance.setOption(option)
  })
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const handleEventSizeChange = (val: number) => {
  eventPageSize.value = val
  // 重新加载数据
}

const handleEventCurrentChange = (val: number) => {
  eventCurrentPage.value = val
  // 重新加载数据
}

// 网格员管理相关方法
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.grid = ''
}

const handleAddStaff = () => {
  dialogTitle.value = '新增网格员'
  Object.keys(formData).forEach(key => {
    (formData as any)[key] = key === 'status' ? '在岗' : ''
  })
  dialogVisible.value = true
}

const viewStaff = (row: StaffItem) => {
  dialogTitle.value = '查看网格员'
  Object.keys(formData).forEach(key => {
    (formData as any)[key] = (row as any)[key]
  })
  dialogVisible.value = true
}

const editStaff = (row: StaffItem) => {
  dialogTitle.value = '编辑网格员'
  Object.keys(formData).forEach(key => {
    (formData as any)[key] = (row as any)[key]
  })
  dialogVisible.value = true
}

const deleteStaff = (row: StaffItem) => {
  ElMessageBox.confirm(`确定要删除网格员"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 删除网格员逻辑
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 事件处理相关方法
const handleEventSearch = () => {
  console.log('搜索条件:', eventSearchForm)
}

const resetEventSearch = () => {
  eventSearchForm.keyword = ''
  eventSearchForm.status = ''
}

const handleAddEvent = () => {
  console.log('新增事件')
}

const viewEvent = (row: any) => {
  console.log('查看事件:', row)
}

const handleEvent = (row: any) => {
  console.log('处理事件:', row)
}

const deleteEvent = (row: any) => {
  console.log('删除事件:', row)
}

// 监听图表时间范围变化
watch([chartTimeRange, trendTimeRange], () => {
  // 重新加载图表数据
  initEventTypeChart()
  initEventTrendChart()
})

const handleTabClick = (tab: any) => {
  if (tab.paneName === 'analysis') {
    setTimeout(() => {
      initEventTypeChart()
      initEventTrendChart()
    }, 0)
  }
}

onMounted(() => {
  initEventTypeChart()
  initEventTrendChart()
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive<FormData>({
  name: '',
  manager: '',
  population: '',
  households: '',
  area: '',
  status: '正常'
})
const formRules = {
  name: [{ required: true, message: '请输入网格名称', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入网格长姓名', trigger: 'blur' }],
  population: [{ required: true, message: '请输入人口数量', trigger: 'blur' }],
  households: [{ required: true, message: '请输入户数', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 网格员管理相关方法
const handleSubmit = (formData: FormData) => {
  if (dialogTitle.value === '新增网格') {
    gridMethods.add(formData)
    ElMessage.success('添加成功')
  } else if (dialogTitle.value === '编辑网格') {
    const id = gridList.value.find(item => item.name === formData.name)?.id
    if (id) {
      gridMethods.update(id, formData)
      ElMessage.success('更新成功')
    }
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.grid-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.grid-overview {
  margin-bottom: 20px;
}

.overview-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon {
  font-size: 48px;
  margin-right: 20px;
}

.card-icon.primary {
  color: #409EFF;
}

.card-icon.success {
  color: #67C23A;
}

.card-icon.warning {
  color: #E6A23C;
}

.card-icon.info {
  color: #909399;
}

.card-info {
  flex: 1;
}

.card-info .value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.card-info .label {
  font-size: 14px;
  color: #909399;
}

.grid-management {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-button) {
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
}

:deep(.el-button--primary):not(.is-link) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #fff;
}

:deep(.el-button--primary:not(.is-link):hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--primary.is-link:hover) {
  background: none !important;
  border: none !important;
  color: #409EFF !important;
  box-shadow: none !important;
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .grid-container {
    padding: 10px;
  }

  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form {
    margin-bottom: 10px;
  }

  .chart-container {
    height: 300px;
  }
}
</style>