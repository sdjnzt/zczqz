<template>
  <div class="village-container">
    <!-- 村务概览 -->
    <el-row :gutter="20" class="village-overview">
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

    <!-- 村务管理标签页 -->
    <el-card class="village-management" shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="header-title">村务管理</span>
          <div class="header-actions">
            <el-button-group>
              <el-button type="primary" :icon="Refresh" @click="refreshData">刷新</el-button>
              <el-button type="success" :icon="Download" @click="exportData">导出</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 村务信息 -->
        <el-tab-pane label="村务信息" name="info">
          <div class="tab-header">
            <el-form :inline="true" :model="villageSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="villageSearchForm.keyword" placeholder="村名/村支书" clearable :prefix-icon="Search" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleVillageSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="resetVillageSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" :icon="Plus" @click="handleAddVillage">新增村务</el-button>
          </div>
          <el-table :data="villageList" border stripe highlight-current-row style="width: 100%" v-loading="tableLoading">
            <el-table-column type="index" width="50" align="center" />
            <el-table-column prop="name" label="村名" min-width="120" />
            <el-table-column prop="secretary" label="村支书" width="120" />
            <el-table-column prop="population" label="人口" width="100" />
            <el-table-column prop="area" label="面积" width="100">
              <template #default="{ row }">
                {{ row.area }}亩
              </template>
            </el-table-column>
            <el-table-column prop="income" label="集体经济收入" width="120">
              <template #default="{ row }">
                {{ row.income }}万元
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="primary" size="small" circle :icon="View" @click="viewVillage(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="编辑" placement="top">
                    <el-button type="warning" size="small" circle :icon="Edit" @click="editVillage(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button type="danger" size="small" circle :icon="Delete" @click="deleteVillage(row)"></el-button>
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="villagePage"
              v-model:page-size="villagePageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="villageTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleVillageSizeChange"
              @current-change="handleVillageCurrentChange"
            />
          </div>
        </el-tab-pane>
        
        <!-- 村民管理 -->
        <el-tab-pane label="村民管理" name="residents">
          <div class="tab-header">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item>
                <el-input v-model="searchForm.keyword" placeholder="姓名/身份证号" clearable :prefix-icon="Search" />
              </el-form-item>
              <el-form-item>
                <el-select v-model="searchForm.village" placeholder="所属村" clearable>
                  <el-option
                    v-for="item in villageOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select v-model="searchForm.type" placeholder="人员类型" clearable>
                  <el-option label="普通村民" value="normal" />
                  <el-option label="党员" value="party" />
                  <el-option label="困难户" value="difficult" />
                  <el-option label="特殊人群" value="special" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" :icon="Plus" @click="handleAddResident">新增村民</el-button>
          </div>
          <el-table :data="residentList" border stripe highlight-current-row style="width: 100%" v-loading="tableLoading">
            <el-table-column type="index" width="50" align="center" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="idCard" label="身份证号" min-width="180" />
            <el-table-column prop="village" label="所属村" width="120" />
            <el-table-column prop="type" label="人员类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getResidentTypeTag(row.type)" size="small">
                  {{ getResidentTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="性别" width="60" />
            <el-table-column prop="age" label="年龄" width="60" />
            <el-table-column prop="phone" label="联系电话" width="120" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="primary" size="small" circle :icon="View" @click="viewResident(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="编辑" placement="top">
                    <el-button type="warning" size="small" circle :icon="Edit" @click="editResident(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button type="danger" size="small" circle :icon="Delete" @click="deleteResident(row)"></el-button>
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="residentPage"
              v-model:page-size="residentPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="residentTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleResidentSizeChange"
              @current-change="handleResidentCurrentChange"
            />
          </div>
        </el-tab-pane>

        <!-- 村务公开 -->
        <el-tab-pane label="村务公开" name="public">
          <div class="tab-header">
            <el-form :inline="true" :model="publicSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="publicSearchForm.keyword" placeholder="标题关键词" clearable :prefix-icon="Search" />
              </el-form-item>
              <el-form-item>
                <el-select v-model="publicSearchForm.village" placeholder="所属村" clearable>
                  <el-option
                    v-for="item in villageOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select v-model="publicSearchForm.type" placeholder="公开类型" clearable>
                  <el-option label="村务公开" value="village" />
                  <el-option label="财务公开" value="finance" />
                  <el-option label="党务公开" value="party" />
                  <el-option label="项目公示" value="project" />
                  <el-option label="政策宣传" value="policy" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handlePublicSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="resetPublicSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" :icon="Plus" @click="handleAddPublic">发布公开</el-button>
          </div>
          <el-table :data="publicList" border stripe highlight-current-row style="width: 100%" v-loading="tableLoading">
            <el-table-column type="index" width="50" align="center" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="village" label="所属村" width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getPublicTypeTag(row.type)" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="publisher" label="发布人" width="100" />
            <el-table-column prop="publishTime" label="发布时间" width="180" sortable />
            <el-table-column prop="views" label="浏览量" width="80" sortable />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已发布' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="primary" size="small" circle :icon="View" @click="viewPublic(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="编辑" placement="top">
                    <el-button type="warning" size="small" circle :icon="Edit" @click="editPublic(row)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button type="danger" size="small" circle :icon="Delete" @click="deletePublic(row)"></el-button>
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="publicPage"
              v-model:page-size="publicPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="publicTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePublicSizeChange"
              @current-change="handlePublicCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 村务管理对话框 -->
    <CommonDialog
      v-model:visible="villageDialogVisible"
      :title="villageDialogTitle"
      :form-data="villageFormData"
      :rules="villageFormRules"
      @submit="handleVillageSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="村名" prop="name">
          <el-input v-model="formData.name" :disabled="villageDialogTitle === '查看村务'" />
        </el-form-item>
        <el-form-item label="村支书" prop="secretary">
          <el-input v-model="formData.secretary" :disabled="villageDialogTitle === '查看村务'" />
        </el-form-item>
        <el-form-item label="人口" prop="population">
          <el-input v-model="formData.population" :disabled="villageDialogTitle === '查看村务'" />
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input v-model="formData.area" :disabled="villageDialogTitle === '查看村务'">
            <template #append>亩</template>
          </el-input>
        </el-form-item>
        <el-form-item label="集体经济收入" prop="income">
          <el-input v-model="formData.income" :disabled="villageDialogTitle === '查看村务'">
            <template #append>万元</template>
          </el-input>
        </el-form-item>
      </template>
    </CommonDialog>

    <!-- 村民管理对话框 -->
    <CommonDialog
      v-model:visible="residentDialogVisible"
      :title="residentDialogTitle"
      :form-data="residentFormData"
      :rules="residentFormRules"
      @submit="handleResidentSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" :disabled="residentDialogTitle === '查看村民'" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" :disabled="residentDialogTitle === '查看村民'" />
        </el-form-item>
        <el-form-item label="所属村" prop="village">
          <el-select v-model="formData.village" :disabled="residentDialogTitle === '查看村民'" style="width: 100%">
            <el-option
              v-for="item in villageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" :disabled="residentDialogTitle === '查看村民'" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="formData.age" :disabled="residentDialogTitle === '查看村民'" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" :disabled="residentDialogTitle === '查看村民'" />
        </el-form-item>
        <el-form-item label="人员类型" prop="type">
          <el-select v-model="formData.type" :disabled="residentDialogTitle === '查看村民'" style="width: 100%">
            <el-option label="普通村民" value="normal" />
            <el-option label="党员" value="party" />
            <el-option label="困难户" value="difficult" />
            <el-option label="特殊人群" value="special" />
          </el-select>
        </el-form-item>
      </template>
    </CommonDialog>

    <!-- 村务公开对话框 -->
    <CommonDialog
      v-model:visible="publicDialogVisible"
      :title="publicDialogTitle"
      :form-data="publicFormData"
      :rules="publicFormRules"
      @submit="handlePublicSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" :disabled="publicDialogTitle === '查看公开'" />
        </el-form-item>
        <el-form-item label="所属村" prop="village">
          <el-select v-model="formData.village" :disabled="publicDialogTitle === '查看公开'" style="width: 100%">
            <el-option
              v-for="item in villageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公开类型" prop="type">
          <el-select v-model="formData.type" :disabled="publicDialogTitle === '查看公开'" style="width: 100%">
            <el-option label="村务公开" value="村务公开" />
            <el-option label="财务公开" value="财务公开" />
            <el-option label="党务公开" value="党务公开" />
            <el-option label="项目公示" value="项目公示" />
            <el-option label="政策宣传" value="政策宣传" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布人" prop="publisher">
          <el-input v-model="formData.publisher" :disabled="publicDialogTitle === '查看公开'" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            :disabled="publicDialogTitle === '查看公开'"
          />
        </el-form-item>
      </template>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  Refresh, 
  Download,
  Search,
  Plus,
  View,
  Edit,
  Delete,
  Top,
  Bottom
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import { villageList, villageMethods, residentList, residentMethods, publicList, publicMethods } from '@/store/data'
import { baseActions, dataActions } from '@/utils/buttonActions'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)

// 当前激活的标签页
const activeTab = ref('info')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  village: '',
  type: ''
})

// 村务搜索表单
const villageSearchForm = reactive({
  keyword: ''
})

// 村务公开搜索表单
const publicSearchForm = reactive({
  keyword: '',
  village: '',
  type: ''
})

// 分页相关
const villagePage = ref(1)
const villagePageSize = ref(10)
const villageTotal = ref(100)
const residentPage = ref(1)
const residentPageSize = ref(10)
const residentTotal = ref(100)
const publicPage = ref(1)
const publicPageSize = ref(10)
const publicTotal = ref(100)

// 概览数据
const overviewData = ref([
  {
    label: '行政村数量',
    value: '12',
    unit: '个',
    icon: 'Location',
    type: 'primary',
    trend: 'up',
    trendText: '较上年增加1个'
  },
  {
    label: '村民总数',
    value: '15,680',
    unit: '人',
    icon: 'User',
    type: 'success',
    trend: 'up',
    trendText: '较上年增长3.2%'
  },
  {
    label: '党员数量',
    value: '486',
    unit: '人',
    icon: 'UserFilled',
    type: 'warning',
    trend: 'up',
    trendText: '较上年增加12人'
  },
  {
    label: '村集体经济收入',
    value: '280',
    unit: '万元',
    icon: 'Money',
    type: 'info',
    trend: 'up',
    trendText: '同比增长15.7%'
  }
])

// 村选项
const villageOptions = [
  { value: '张庄村', label: '张庄村' },
  { value: '李庄村', label: '李庄村' },
  { value: '王庄村', label: '王庄村' },
  { value: '赵庄村', label: '赵庄村' },
  { value: '孙庄村', label: '孙庄村' },
  { value: '刘庄村', label: '刘庄村' },
  { value: '陈庄村', label: '陈庄村' },
  { value: '杨庄村', label: '杨庄村' },
  { value: '吴庄村', label: '吴庄村' },
  { value: '郑庄村', label: '郑庄村' },
  { value: '周庄村', label: '周庄村' },
  { value: '朱庄村', label: '朱庄村' }
]

// 村务管理相关方法
const villageDialogVisible = ref(false)
const villageDialogTitle = ref('')
const villageFormData = reactive({
  name: '',
  secretary: '',
  population: '',
  area: '',
  income: ''
})
const villageFormRules = {
  name: [{ required: true, message: '请输入村名', trigger: 'blur' }],
  secretary: [{ required: true, message: '请输入村支书姓名', trigger: 'blur' }],
  population: [{ required: true, message: '请输入人口数量', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  income: [{ required: true, message: '请输入集体经济收入', trigger: 'blur' }]
}

const handleAddVillage = () => {
  villageDialogTitle.value = '新增村务'
  Object.keys(villageFormData).forEach(key => {
    (villageFormData as any)[key] = ''
  })
  villageDialogVisible.value = true
}

const viewVillage = (row: any) => {
  villageDialogTitle.value = '查看村务'
  Object.keys(villageFormData).forEach(key => {
    (villageFormData as any)[key] = row[key]
  })
  villageDialogVisible.value = true
}

const editVillage = (row: any) => {
  villageDialogTitle.value = '编辑村务'
  Object.keys(villageFormData).forEach(key => {
    (villageFormData as any)[key] = row[key]
  })
  villageDialogVisible.value = true
}

const deleteVillage = (row: any) => {
  dataActions.delete('村务信息', row.name, () => {
    villageMethods.delete(row.id)
  })
}

const handleVillageSubmit = (formData: any) => {
  if (villageDialogTitle.value === '新增村务') {
    villageMethods.add(formData)
    ElMessage.success('添加成功')
  } else if (villageDialogTitle.value === '编辑村务') {
    const id = villageList.value.find(item => item.name === formData.name)?.id
    if (id) {
      villageMethods.update(id, formData)
      ElMessage.success('更新成功')
    }
  }
  villageDialogVisible.value = false
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  baseActions.refresh(() => {
    loading.value = false
  })
}

// 导出数据
const exportData = () => {
  baseActions.export('村务管理')
}

// 获取村民类型对应的标签类型
const getResidentTypeTag = (type: string) => {
  switch (type) {
    case 'party':
      return 'danger'
    case 'difficult':
      return 'warning'
    case 'special':
      return 'info'
    default:
      return 'success'
  }
}

// 获取村民类型对应的标签文本
const getResidentTypeLabel = (type: string) => {
  switch (type) {
    case 'party':
      return '党员'
    case 'difficult':
      return '困难户'
    case 'special':
      return '特殊人群'
    default:
      return '普通村民'
  }
}

// 获取公开类型对应的标签类型
const getPublicTypeTag = (type: string) => {
  switch (type) {
    case '村务公开':
      return 'primary'
    case '财务公开':
      return 'success'
    case '党务公开':
      return 'danger'
    case '项目公示':
      return 'warning'
    case '政策宣传':
      return 'info'
    default:
      return ''
  }
}

// 村民管理相关方法
const residentDialogVisible = ref(false)
const residentDialogTitle = ref('')
const residentFormData = reactive({
  name: '',
  idCard: '',
  village: '',
  gender: '',
  age: '',
  phone: '',
  type: ''
})
const residentFormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  village: [{ required: true, message: '请选择所属村', trigger: 'change' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  type: [{ required: true, message: '请选择人员类型', trigger: 'change' }]
}

const handleSearch = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
  console.log('搜索条件:', searchForm)
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.village = ''
  searchForm.type = ''
}

const handleAddResident = () => {
  residentDialogTitle.value = '新增村民'
  Object.keys(residentFormData).forEach(key => {
    (residentFormData as any)[key] = ''
  })
  residentDialogVisible.value = true
}

const viewResident = (row: any) => {
  residentDialogTitle.value = '查看村民'
  Object.keys(residentFormData).forEach(key => {
    (residentFormData as any)[key] = row[key]
  })
  residentDialogVisible.value = true
}

const editResident = (row: any) => {
  residentDialogTitle.value = '编辑村民'
  Object.keys(residentFormData).forEach(key => {
    (residentFormData as any)[key] = row[key]
  })
  residentDialogVisible.value = true
}

const deleteResident = (row: any) => {
  dataActions.delete('村民信息', row.name, () => {
    residentMethods.delete(row.id)
  })
}

const handleResidentSubmit = (formData: any) => {
  if (residentDialogTitle.value === '新增村民') {
    residentMethods.add(formData)
    ElMessage.success('添加成功')
  } else if (residentDialogTitle.value === '编辑村民') {
    const id = residentList.value.find(item => item.idCard === formData.idCard)?.id
    if (id) {
      residentMethods.update(id, formData)
      ElMessage.success('更新成功')
    }
  }
  residentDialogVisible.value = false
}

const handleResidentSizeChange = (val: number) => {
  residentPageSize.value = val
  // 重新加载数据
}

const handleResidentCurrentChange = (val: number) => {
  residentPage.value = val
  // 重新加载数据
}

// 村务公开相关方法
const publicDialogVisible = ref(false)
const publicDialogTitle = ref('')
const publicFormData = reactive({
  title: '',
  village: '',
  type: '',
  publisher: '',
  content: ''
})
const publicFormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  village: [{ required: true, message: '请选择所属村', trigger: 'change' }],
  type: [{ required: true, message: '请选择公开类型', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入发布人', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const handlePublicSearch = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
  console.log('搜索条件:', publicSearchForm)
}

const resetPublicSearch = () => {
  publicSearchForm.keyword = ''
  publicSearchForm.village = ''
  publicSearchForm.type = ''
}

const handleAddPublic = () => {
  publicDialogTitle.value = '发布公开'
  Object.keys(publicFormData).forEach(key => {
    (publicFormData as any)[key] = ''
  })
  publicDialogVisible.value = true
}

const viewPublic = (row: any) => {
  publicDialogTitle.value = '查看公开'
  Object.keys(publicFormData).forEach(key => {
    (publicFormData as any)[key] = row[key]
  })
  publicDialogVisible.value = true
}

const editPublic = (row: any) => {
  publicDialogTitle.value = '编辑公开'
  Object.keys(publicFormData).forEach(key => {
    (publicFormData as any)[key] = row[key]
  })
  publicDialogVisible.value = true
}

const deletePublic = (row: any) => {
  dataActions.delete('公开信息', row.title, () => {
    publicMethods.delete(row.id)
  })
}

const handlePublicSubmit = (formData: any) => {
  if (publicDialogTitle.value === '发布公开') {
    publicMethods.add(formData)
    ElMessage.success('发布成功')
  } else if (publicDialogTitle.value === '编辑公开') {
    const id = publicList.value.find(item => item.title === formData.title)?.id
    if (id) {
      publicMethods.update(id, formData)
      ElMessage.success('更新成功')
    }
  }
  publicDialogVisible.value = false
}

const handlePublicSizeChange = (val: number) => {
  publicPageSize.value = val
  // 重新加载数据
}

const handlePublicCurrentChange = (val: number) => {
  publicPage.value = val
  // 重新加载数据
}

// 村务信息相关方法
const handleVillageSearch = () => {
  console.log('搜索条件:', villageSearchForm)
}

const resetVillageSearch = () => {
  villageSearchForm.keyword = ''
}

const handleVillageSizeChange = (val: number) => {
  villagePageSize.value = val
  // 重新加载数据
}

const handleVillageCurrentChange = (val: number) => {
  villagePage.value = val
  // 重新加载数据
}

// 页面初始化
onMounted(() => {
  // 加载数据
})
</script>

<style scoped>
.village-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.village-overview {
  margin-bottom: 20px;
}

.overview-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  height: 100%;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  padding: 10px;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.card-icon.primary {
  background-color: #ecf5ff;
  color: #409EFF;
}

.card-icon.success {
  background-color: #f0f9eb;
  color: #67C23A;
}

.card-icon.warning {
  background-color: #fdf6ec;
  color: #E6A23C;
}

.card-icon.info {
  background-color: #f4f4f5;
  color: #909399;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.stat-trend .el-icon {
  margin-right: 4px;
}

.village-management {
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

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
}

@media screen and (max-width: 768px) {
  .village-container {
    padding: 10px;
  }

  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form {
    margin-bottom: 10px;
  }
}
</style> 