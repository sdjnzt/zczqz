<template>
  <div class="emergency-container">
    <!-- 应急概览 -->
    <el-row :gutter="20" class="emergency-overview">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>当前预警</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">{{ warningList.filter(item => item.status === '生效中').length }}</div>
            <div class="unit">个</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>应急事件</span>
              <el-tag size="small" type="danger">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">{{ eventList.filter(item => item.status !== '已完成').length }}</div>
            <div class="unit">起</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待调度资源</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">{{ resourceList.length }}</div>
            <div class="unit">项</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月事件处理率</span>
              <el-tag size="small" type="success">月度</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="value">{{ handleRate }}</div>
            <div class="unit">%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 应急管理标签页 -->
    <el-card class="emergency-management" shadow="hover">
      <el-tabs v-model="activeTab">
        <!-- 预警信息 -->
        <el-tab-pane label="预警信息" name="warning">
          <div class="tab-header">
            <el-form :inline="true" :model="warningSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="warningSearchForm.keyword" placeholder="预警标题" clearable />
              </el-form-item>
              <el-form-item>
                <el-select v-model="warningSearchForm.level" placeholder="预警等级" clearable>
                  <el-option label="红色预警" value="红色预警" />
                  <el-option label="橙色预警" value="橙色预警" />
                  <el-option label="黄色预警" value="黄色预警" />
                  <el-option label="蓝色预警" value="蓝色预警" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleWarningSearch" :loading="warningLoading">搜索</el-button>
                <el-button @click="resetWarningSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="handleAddWarning">发布预警</el-button>
          </div>
          <el-table :data="filteredWarningList" style="width: 100%" v-loading="warningLoading">
            <el-table-column prop="title" label="预警标题" min-width="200" />
            <el-table-column prop="type" label="预警类型" width="120" />
            <el-table-column prop="level" label="预警等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getWarningLevelType(row.level)">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="area" label="影响区域" width="150" />
            <el-table-column prop="publishTime" label="发布时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已解除' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-dropdown>
                  <el-button link type="primary">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewWarning(row)">查看</el-dropdown-item>
                      <el-dropdown-item @click="handleWarning(row)">处理</el-dropdown-item>
                      <el-dropdown-item @click="deleteWarning(row)" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 应急事件 -->
        <el-tab-pane label="应急事件" name="event">
          <div class="tab-header">
            <el-form :inline="true" :model="eventSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="eventSearchForm.keyword" placeholder="事件标题" clearable />
              </el-form-item>
              <el-form-item>
                <el-select v-model="eventSearchForm.status" placeholder="处理状态" clearable>
                  <el-option label="待处理" value="待处理" />
                  <el-option label="处理中" value="处理中" />
                  <el-option label="已完成" value="已完成" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleEventSearch" :loading="eventLoading">搜索</el-button>
                <el-button @click="resetEventSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="handleAddEvent">新增事件</el-button>
          </div>
          <el-table :data="filteredEventList" style="width: 100%" v-loading="eventLoading">
            <el-table-column prop="title" label="事件标题" min-width="200" />
            <el-table-column prop="type" label="事件类型" width="120" />
            <el-table-column prop="level" label="事件等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventLevelType(row.level)">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="事发地点" width="150" />
            <el-table-column prop="reportTime" label="上报时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-dropdown>
                  <el-button link type="primary">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewEvent(row)">查看</el-dropdown-item>
                      <el-dropdown-item @click="handleEvent(row)">处理</el-dropdown-item>
                      <el-dropdown-item @click="deleteEvent(row)" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 资源调度 -->
        <el-tab-pane label="资源调度" name="resource">
          <div class="tab-header">
            <el-form :inline="true" :model="resourceSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="resourceSearchForm.keyword" placeholder="资源名称" clearable />
              </el-form-item>
              <el-form-item>
                <el-select v-model="resourceSearchForm.type" placeholder="资源类型" clearable>
                  <el-option label="人员" value="人员" />
                  <el-option label="物资" value="物资" />
                  <el-option label="车辆" value="车辆" />
                  <el-option label="设备" value="设备" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleResourceSearch" :loading="resourceLoading">搜索</el-button>
                <el-button @click="resetResourceSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="handleAddResource">新增资源</el-button>
          </div>
          <el-table :data="filteredResourceList" style="width: 100%" v-loading="resourceLoading">
            <el-table-column prop="name" label="资源名称" min-width="150" />
            <el-table-column prop="type" label="资源类型" width="100" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="location" label="存放位置" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '可用' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-dropdown>
                  <el-button link type="primary">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewResource(row)">查看</el-dropdown-item>
                      <el-dropdown-item @click="dispatchResource(row)">调度</el-dropdown-item>
                      <el-dropdown-item @click="deleteResource(row)" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 应急预案 -->
        <el-tab-pane label="应急预案" name="plan">
          <div class="tab-header">
            <el-form :inline="true" :model="planSearchForm" class="search-form">
              <el-form-item>
                <el-input v-model="planSearchForm.keyword" placeholder="预案名称" clearable />
              </el-form-item>
              <el-form-item>
                <el-select v-model="planSearchForm.type" placeholder="预案类型" clearable>
                  <el-option label="自然灾害" value="自然灾害" />
                  <el-option label="事故灾难" value="事故灾难" />
                  <el-option label="公共卫生" value="公共卫生" />
                  <el-option label="社会安全" value="社会安全" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handlePlanSearch" :loading="planLoading">搜索</el-button>
                <el-button @click="resetPlanSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="handleAddPlan">新增预案</el-button>
          </div>
          <el-table :data="filteredPlanList" style="width: 100%" v-loading="planLoading">
            <el-table-column prop="name" label="预案名称" min-width="200" />
            <el-table-column prop="type" label="预案类型" width="120" />
            <el-table-column prop="level" label="响应等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPlanLevelType(row.level)">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="责任部门" width="150" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已启用' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-dropdown>
                  <el-button link type="primary">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewPlan(row)">查看</el-dropdown-item>
                      <el-dropdown-item @click="editPlan(row)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="deletePlan(row)" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 预警对话框 -->
    <el-dialog v-model="warningDialogVisible" :title="warningDialogTitle" width="500px">
      <el-form :model="warningForm" :rules="warningRules" ref="warningFormRef" label-width="100px">
        <el-form-item label="预警标题" prop="title">
          <el-input v-model="warningForm.title" :disabled="warningDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="预警类型" prop="type">
          <el-select v-model="warningForm.type" style="width: 100%" :disabled="warningDialogType === 'view'">
            <el-option label="气象预警" value="气象预警" />
            <el-option label="地质预警" value="地质预警" />
            <el-option label="水文预警" value="水文预警" />
            <el-option label="森林火灾预警" value="森林火灾预警" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级" prop="level">
          <el-select v-model="warningForm.level" style="width: 100%" :disabled="warningDialogType === 'view'">
            <el-option label="红色预警" value="红色预警" />
            <el-option label="橙色预警" value="橙色预警" />
            <el-option label="黄色预警" value="黄色预警" />
            <el-option label="蓝色预警" value="蓝色预警" />
          </el-select>
        </el-form-item>
        <el-form-item label="影响区域" prop="area">
          <el-input v-model="warningForm.area" :disabled="warningDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="预警内容" prop="content">
          <el-input type="textarea" v-model="warningForm.content" :rows="4" :disabled="warningDialogType === 'view'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="warningDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWarningForm" v-if="warningDialogType !== 'view'">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 事件对话框 -->
    <el-dialog v-model="eventDialogVisible" :title="eventDialogTitle" width="500px">
      <el-form :model="eventForm" :rules="eventRules" ref="eventFormRef" label-width="100px">
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="eventForm.title" :disabled="eventDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="eventForm.type" style="width: 100%" :disabled="eventDialogType === 'view'">
            <el-option label="自然灾害" value="自然灾害" />
            <el-option label="事故灾难" value="事故灾难" />
            <el-option label="公共卫生事件" value="公共卫生事件" />
            <el-option label="社会安全事件" value="社会安全事件" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件等级" prop="level">
          <el-select v-model="eventForm.level" style="width: 100%" :disabled="eventDialogType === 'view'">
            <el-option label="特别重大" value="特别重大" />
            <el-option label="重大" value="重大" />
            <el-option label="较大" value="较大" />
            <el-option label="一般" value="一般" />
          </el-select>
        </el-form-item>
        <el-form-item label="事发地点" prop="location">
          <el-input v-model="eventForm.location" :disabled="eventDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="事件描述" prop="description">
          <el-input type="textarea" v-model="eventForm.description" :rows="4" :disabled="eventDialogType === 'view'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="eventDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEventForm" v-if="eventDialogType !== 'view'">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资源对话框 -->
    <el-dialog v-model="resourceDialogVisible" :title="resourceDialogTitle" width="500px">
      <el-form :model="resourceForm" :rules="resourceRules" ref="resourceFormRef" label-width="100px">
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="resourceForm.name" :disabled="resourceDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="资源类型" prop="type">
          <el-select v-model="resourceForm.type" style="width: 100%" :disabled="resourceDialogType === 'view'">
            <el-option label="人员" value="人员" />
            <el-option label="物资" value="物资" />
            <el-option label="车辆" value="车辆" />
            <el-option label="设备" value="设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input v-model="resourceForm.quantity" :disabled="resourceDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="存放位置" prop="location">
          <el-input v-model="resourceForm.location" :disabled="resourceDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="resourceForm.status" style="width: 100%" :disabled="resourceDialogType === 'view'">
            <el-option label="可用" value="可用" />
            <el-option label="已调用" value="已调用" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resourceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResourceForm" v-if="resourceDialogType !== 'view'">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预案对话框 -->
    <el-dialog v-model="planDialogVisible" :title="planDialogTitle" width="500px">
      <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-width="100px">
        <el-form-item label="预案名称" prop="name">
          <el-input v-model="planForm.name" :disabled="planDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="预案类型" prop="type">
          <el-select v-model="planForm.type" style="width: 100%" :disabled="planDialogType === 'view'">
            <el-option label="自然灾害" value="自然灾害" />
            <el-option label="事故灾难" value="事故灾难" />
            <el-option label="公共卫生" value="公共卫生" />
            <el-option label="社会安全" value="社会安全" />
          </el-select>
        </el-form-item>
        <el-form-item label="响应等级" prop="level">
          <el-select v-model="planForm.level" style="width: 100%" :disabled="planDialogType === 'view'">
            <el-option label="一级" value="一级" />
            <el-option label="二级" value="二级" />
            <el-option label="三级" value="三级" />
            <el-option label="四级" value="四级" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任部门" prop="department">
          <el-input v-model="planForm.department" :disabled="planDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="预案内容" prop="content">
          <el-input type="textarea" v-model="planForm.content" :rows="4" :disabled="planDialogType === 'view'" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="planForm.status" style="width: 100%" :disabled="planDialogType === 'view'">
            <el-option label="已启用" value="已启用" />
            <el-option label="未启用" value="未启用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="planDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPlanForm" v-if="planDialogType !== 'view'">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { baseActions, dataActions, eventActions } from '@/utils/buttonActions'
import type { FormInstance } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('warning')

// 加载状态
const warningLoading = ref(false)
const eventLoading = ref(false)
const resourceLoading = ref(false)
const planLoading = ref(false)

// 处理率计算
const handleRate = computed(() => {
  const total = eventList.value.length
  if (total === 0) return 100
  const completed = eventList.value.filter(item => item.status === '已完成').length
  return Math.round((completed / total) * 100)
})

// 搜索过滤
const filteredWarningList = computed(() => {
  let result = [...warningList.value]
  if (warningSearchForm.keyword) {
    result = result.filter(item => 
      item.title.includes(warningSearchForm.keyword) || 
      item.area.includes(warningSearchForm.keyword)
    )
  }
  if (warningSearchForm.level) {
    result = result.filter(item => item.level === warningSearchForm.level)
  }
  return result
})

const filteredEventList = computed(() => {
  let result = [...eventList.value]
  if (eventSearchForm.keyword) {
    result = result.filter(item => 
      item.title.includes(eventSearchForm.keyword) || 
      item.location.includes(eventSearchForm.keyword)
    )
  }
  if (eventSearchForm.status) {
    result = result.filter(item => item.status === eventSearchForm.status)
  }
  return result
})

const filteredResourceList = computed(() => {
  let result = [...resourceList.value]
  if (resourceSearchForm.keyword) {
    result = result.filter(item => 
      item.name.includes(resourceSearchForm.keyword) || 
      item.location.includes(resourceSearchForm.keyword)
    )
  }
  if (resourceSearchForm.type) {
    result = result.filter(item => item.type === resourceSearchForm.type)
  }
  return result
})

const filteredPlanList = computed(() => {
  let result = [...planList.value]
  if (planSearchForm.keyword) {
    result = result.filter(item => 
      item.name.includes(planSearchForm.keyword) || 
      item.department.includes(planSearchForm.keyword)
    )
  }
  if (planSearchForm.type) {
    result = result.filter(item => item.type === planSearchForm.type)
  }
  return result
})

// 预警搜索表单
const warningSearchForm = reactive({
  keyword: '',
  level: ''
})

// 事件搜索表单
const eventSearchForm = reactive({
  keyword: '',
  status: ''
})

// 资源搜索表单
const resourceSearchForm = reactive({
  keyword: '',
  type: ''
})

// 预案搜索表单
const planSearchForm = reactive({
  keyword: '',
  type: ''
})

// 预警表单相关
const warningDialogVisible = ref(false)
const warningDialogTitle = ref('')
const warningDialogType = ref<'add' | 'edit' | 'view'>('add')
const warningFormRef = ref<FormInstance>()
const warningForm = reactive({
  id: 0,
  title: '',
  type: '',
  level: '',
  area: '',
  content: '',
  publishTime: '',
  status: '生效中'
})
const warningRules = {
  title: [{ required: true, message: '请输入预警标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择预警类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择预警等级', trigger: 'change' }],
  area: [{ required: true, message: '请输入影响区域', trigger: 'blur' }],
  content: [{ required: true, message: '请输入预警内容', trigger: 'blur' }]
}

// 事件表单相关
const eventDialogVisible = ref(false)
const eventDialogTitle = ref('')
const eventDialogType = ref<'add' | 'edit' | 'view'>('add')
const eventFormRef = ref<FormInstance>()
const eventForm = reactive({
  id: 0,
  title: '',
  type: '',
  level: '',
  location: '',
  description: '',
  reportTime: '',
  status: '待处理'
})
const eventRules = {
  title: [{ required: true, message: '请输入事件标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择事件等级', trigger: 'change' }],
  location: [{ required: true, message: '请输入事发地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入事件描述', trigger: 'blur' }]
}

// 资源表单相关
const resourceDialogVisible = ref(false)
const resourceDialogTitle = ref('')
const resourceDialogType = ref<'add' | 'edit' | 'view'>('add')
const resourceFormRef = ref<FormInstance>()
const resourceForm = reactive({
  id: 0,
  name: '',
  type: '',
  quantity: '',
  location: '',
  status: '可用',
  updateTime: ''
})
const resourceRules = {
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 预案表单相关
const planDialogVisible = ref(false)
const planDialogTitle = ref('')
const planDialogType = ref<'add' | 'edit' | 'view'>('add')
const planFormRef = ref<FormInstance>()
const planForm = reactive({
  id: 0,
  name: '',
  type: '',
  level: '',
  department: '',
  content: '',
  updateTime: '',
  status: '已启用'
})
const planRules = {
  name: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择预案类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择响应等级', trigger: 'change' }],
  department: [{ required: true, message: '请输入责任部门', trigger: 'blur' }],
  content: [{ required: true, message: '请输入预案内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 预警列表数据
const warningList = ref([
  {
    id: 1,
    title: '暴雨橙色预警',
    type: '气象预警',
    level: '橙色预警',
    area: '城前镇全域',
    content: '预计未来12小时内将出现强降雨，可能引发山洪、滑坡等灾害，请做好防范。',
    publishTime: '2025-06-15 08:00',
    status: '生效中'
  },
  {
    id: 2,
    title: '大风黄色预警',
    type: '气象预警',
    level: '黄色预警',
    area: '城前镇北部',
    content: '预计未来24小时内将出现6-7级大风，请注意防范大风可能造成的危害。',
    publishTime: '2025-06-17 10:30',
    status: '已解除'
  },
  {
    id: 3,
    title: '地质灾害红色预警',
    type: '地质预警',
    level: '红色预警',
    area: '城前镇东部山区',
    content: '受持续强降雨影响，东部山区发生滑坡、泥石流等地质灾害风险极高，请立即转移危险区域人员。',
    publishTime: '2025-06-18 07:15',
    status: '生效中'
  },
  {
    id: 4,
    title: '洪水蓝色预警',
    type: '水文预警',
    level: '蓝色预警',
    area: '城前镇南部',
    content: '南部河流水位上涨，预计未来24小时内可能达到警戒水位，请相关部门做好防汛准备。',
    publishTime: '2025-06-20 09:30',
    status: '生效中'
  },
  {
    id: 5,
    title: '森林火险黄色预警',
    type: '森林火灾预警',
    level: '黄色预警',
    area: '城前镇西部林区',
    content: '近期天气干燥，西部林区火险等级较高，请注意防火，禁止一切野外用火活动。',
    publishTime: '2025-06-16 14:00',
    status: '已解除'
  }
])

// 事件列表数据
const eventList = ref([
  {
    id: 1,
    title: '道路积水严重',
    type: '自然灾害',
    level: '一般',
    location: '城前村主干道',
    description: '主干道积水严重，影响车辆通行，需要抽水处理。',
    reportTime: '2025-06-15 09:15',
    status: '处理中'
  },
  {
    id: 2,
    title: '树木倒伏',
    type: '自然灾害',
    level: '一般',
    location: '李庄村道路',
    description: '一棵大树倒伏在道路上，阻碍交通，需要清理。',
    reportTime: '2025-06-17 11:20',
    status: '待处理'
  },
  {
    id: 3,
    title: '山体滑坡',
    type: '自然灾害',
    level: '重大',
    location: '东山村后山',
    description: '后山发生山体滑坡，约500立方米土石流入村庄，造成3户房屋受损，无人员伤亡。',
    reportTime: '2025-06-18 08:30',
    status: '处理中'
  },
  {
    id: 4,
    title: '农田被淹',
    type: '自然灾害',
    level: '较大',
    location: '南湖村',
    description: '约200亩农田被淹，农作物受损严重，需要排水和灾后补偿评估。',
    reportTime: '2025-06-20 10:45',
    status: '待处理'
  },
  {
    id: 5,
    title: '桥梁受损',
    type: '事故灾难',
    level: '较大',
    location: '西河村小桥',
    description: '连接西河村的小桥受洪水冲击，桥面出现裂缝，存在安全隐患，需要紧急维修。',
    reportTime: '2025-06-21 11:30',
    status: '待处理'
  },
  {
    id: 6,
    title: '供电线路故障',
    type: '事故灾难',
    level: '一般',
    location: '北山村',
    description: '北山村供电线路受大风影响出现故障，全村停电，需要抢修。',
    reportTime: '2025-06-17 16:20',
    status: '已完成'
  },
  {
    id: 7,
    title: '燃气泄漏',
    type: '事故灾难',
    level: '较大',
    location: '中心村2组',
    description: '中心村2组一户居民家中发生燃气泄漏，已疏散周边居民，需要紧急处理。',
    reportTime: '2025-06-19 19:40',
    status: '已完成'
  }
])

// 资源列表数据
const resourceList = ref([
  {
    id: 1,
    name: '应急抢险队',
    type: '人员',
    quantity: '20人',
    location: '镇政府',
    status: '可用',
    updateTime: '2025-06-15 08:00'
  },
  {
    id: 2,
    name: '抽水泵',
    type: '设备',
    quantity: '5台',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-15 08:00'
  },
  {
    id: 3,
    name: '消防队',
    type: '人员',
    quantity: '15人',
    location: '消防站',
    status: '可用',
    updateTime: '2025-06-16 08:00'
  },
  {
    id: 4,
    name: '医疗救护队',
    type: '人员',
    quantity: '12人',
    location: '卫生院',
    status: '可用',
    updateTime: '2025-06-17 08:00'
  },
  {
    id: 5,
    name: '应急发电机',
    type: '设备',
    quantity: '3台',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-18 08:00'
  },
  {
    id: 6,
    name: '应急照明设备',
    type: '设备',
    quantity: '30套',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-19 08:00'
  },
  {
    id: 7,
    name: '救援车辆',
    type: '车辆',
    quantity: '4辆',
    location: '镇政府车库',
    status: '可用',
    updateTime: '2025-06-20 08:00'
  },
  {
    id: 8,
    name: '救生衣',
    type: '物资',
    quantity: '50件',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-21 08:00'
  },
  {
    id: 9,
    name: '救生艇',
    type: '设备',
    quantity: '2艘',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-22 08:00'
  },
  {
    id: 10,
    name: '应急食品',
    type: '物资',
    quantity: '200份',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-23 08:00'
  },
  {
    id: 11,
    name: '饮用水',
    type: '物资',
    quantity: '500箱',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-24 08:00'
  },
  {
    id: 12,
    name: '应急帐篷',
    type: '物资',
    quantity: '30顶',
    location: '物资仓库',
    status: '可用',
    updateTime: '2025-06-25 08:00'
  }
])

// 预案列表数据
const planList = ref([
  {
    id: 1,
    name: '防汛抗旱应急预案',
    type: '自然灾害',
    level: '一级',
    department: '应急管理办公室',
    content: '针对暴雨、洪水等灾害的应急处置预案，包括预警信息发布、人员疏散、物资调度等内容。',
    updateTime: '2025-06-10',
    status: '已启用'
  },
  {
    id: 2,
    name: '突发公共卫生事件应急预案',
    type: '公共卫生',
    level: '二级',
    department: '卫生健康办公室',
    content: '针对传染病疫情等突发公共卫生事件的应急处置预案，包括疫情监测、隔离措施、医疗救治等内容。',
    updateTime: '2025-06-12',
    status: '已启用'
  },
  {
    id: 3,
    name: '地质灾害应急预案',
    type: '自然灾害',
    level: '一级',
    department: '应急管理办公室',
    content: '针对滑坡、泥石流等地质灾害的应急处置预案，包括监测预警、人员疏散、抢险救援等内容。',
    updateTime: '2025-06-14',
    status: '已启用'
  },
  {
    id: 4,
    name: '森林火灾应急预案',
    type: '自然灾害',
    level: '二级',
    department: '林业站',
    content: '针对森林火灾的应急处置预案，包括火情监测、扑救队伍组织、火灾扑救等内容。',
    updateTime: '2025-06-16',
    status: '已启用'
  },
  {
    id: 5,
    name: '危险化学品事故应急预案',
    type: '事故灾难',
    level: '一级',
    department: '安全生产监督管理站',
    content: '针对危险化学品泄漏、爆炸等事故的应急处置预案，包括现场处置、人员疏散、环境监测等内容。',
    updateTime: '2025-06-18',
    status: '已启用'
  },
  {
    id: 6,
    name: '道路交通事故应急预案',
    type: '事故灾难',
    level: '三级',
    department: '交通运输办公室',
    content: '针对道路交通事故的应急处置预案，包括现场救援、交通疏导、伤员救治等内容。',
    updateTime: '2025-06-20',
    status: '已启用'
  },
  {
    id: 7,
    name: '群体性事件应急预案',
    type: '社会安全',
    level: '二级',
    department: '综治办',
    content: '针对群体性事件的应急处置预案，包括情况研判、矛盾化解、秩序维护等内容。',
    updateTime: '2025-06-22',
    status: '已启用'
  },
  {
    id: 8,
    name: '食品安全事故应急预案',
    type: '公共卫生',
    level: '三级',
    department: '市场监督管理所',
    content: '针对食品安全事故的应急处置预案，包括事故调查、应急处置、医疗救治等内容。',
    updateTime: '2025-06-24',
    status: '已启用'
  }
])

// 获取预警等级对应的标签类型
const getWarningLevelType = (level: string) => {
  switch (level) {
    case '红色预警':
      return 'danger'
    case '橙色预警':
      return 'warning'
    case '黄色预警':
      return 'warning'
    case '蓝色预警':
      return 'info'
    default:
      return 'info'
  }
}

// 获取事件等级对应的标签类型
const getEventLevelType = (level: string) => {
  switch (level) {
    case '特别重大':
      return 'danger'
    case '重大':
      return 'warning'
    case '较大':
      return 'warning'
    case '一般':
      return 'info'
    default:
      return 'info'
  }
}

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

// 获取预案等级对应的标签类型
const getPlanLevelType = (level: string) => {
  switch (level) {
    case '一级':
      return 'danger'
    case '二级':
      return 'warning'
    case '三级':
      return 'info'
    case '四级':
      return 'info'
    default:
      return 'info'
  }
}

// 预警相关方法
const handleWarningSearch = () => {
  warningLoading.value = true
  baseActions.refresh(() => {
    ElMessage.success('预警数据已刷新')
    console.log('搜索条件:', warningSearchForm)
    warningLoading.value = false
  })
}

const resetWarningSearch = () => {
  warningSearchForm.keyword = ''
  warningSearchForm.level = ''
}

const handleAddWarning = () => {
  warningDialogType.value = 'add'
  warningDialogTitle.value = '发布预警'
  Object.assign(warningForm, {
    id: Date.now(),
    title: '',
    type: '',
    level: '',
    area: '',
    content: '',
    publishTime: new Date().toLocaleString(),
    status: '生效中'
  })
  warningDialogVisible.value = true
}

const viewWarning = (row: any) => {
  warningDialogType.value = 'view'
  warningDialogTitle.value = '查看预警'
  Object.assign(warningForm, row)
  warningDialogVisible.value = true
}

const handleWarning = (row: any) => {
  eventActions.process('预警', () => {
    row.status = '已解除'
    ElMessage.success(`${row.title}已处理`)
  })
}

const deleteWarning = (row: any) => {
  dataActions.delete('预警信息', row.title, () => {
    const index = warningList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      warningList.value.splice(index, 1)
    }
  })
}

const submitWarningForm = async () => {
  if (!warningFormRef.value) return
  
  await warningFormRef.value.validate((valid) => {
    if (valid) {
      if (warningDialogType.value === 'add') {
        // 添加新预警
        warningList.value.unshift({
          ...warningForm,
          publishTime: new Date().toLocaleString()
        })
        ElMessage.success('预警发布成功')
      } else if (warningDialogType.value === 'edit') {
        // 编辑预警
        const index = warningList.value.findIndex(item => item.id === warningForm.id)
        if (index !== -1) {
          warningList.value[index] = { ...warningForm }
        }
        ElMessage.success('预警更新成功')
      }
      warningDialogVisible.value = false
    }
  })
}

// 事件相关方法
const handleEventSearch = () => {
  eventLoading.value = true
  baseActions.refresh(() => {
    ElMessage.success('事件数据已刷新')
    console.log('搜索条件:', eventSearchForm)
    eventLoading.value = false
  })
}

const resetEventSearch = () => {
  eventSearchForm.keyword = ''
  eventSearchForm.status = ''
}

const handleAddEvent = () => {
  eventDialogType.value = 'add'
  eventDialogTitle.value = '新增事件'
  Object.assign(eventForm, {
    id: Date.now(),
    title: '',
    type: '',
    level: '',
    location: '',
    description: '',
    reportTime: new Date().toLocaleString(),
    status: '待处理'
  })
  eventDialogVisible.value = true
}

const viewEvent = (row: any) => {
  eventDialogType.value = 'view'
  eventDialogTitle.value = '查看事件'
  Object.assign(eventForm, row)
  eventDialogVisible.value = true
}

const handleEvent = (row: any) => {
  eventActions.process('应急事件', () => {
    if (row.status === '待处理') {
      row.status = '处理中'
    } else if (row.status === '处理中') {
      row.status = '已完成'
    }
    ElMessage.success(`${row.title}已更新处理状态`)
  })
}

const deleteEvent = (row: any) => {
  dataActions.delete('应急事件', row.title, () => {
    const index = eventList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      eventList.value.splice(index, 1)
    }
  })
}

const submitEventForm = async () => {
  if (!eventFormRef.value) return
  
  await eventFormRef.value.validate((valid) => {
    if (valid) {
      if (eventDialogType.value === 'add') {
        // 添加新事件
        eventList.value.unshift({
          ...eventForm,
          reportTime: new Date().toLocaleString()
        })
        ElMessage.success('事件添加成功')
      } else if (eventDialogType.value === 'edit') {
        // 编辑事件
        const index = eventList.value.findIndex(item => item.id === eventForm.id)
        if (index !== -1) {
          eventList.value[index] = { ...eventForm }
        }
        ElMessage.success('事件更新成功')
      }
      eventDialogVisible.value = false
    }
  })
}

// 资源相关方法
const handleResourceSearch = () => {
  resourceLoading.value = true
  baseActions.refresh(() => {
    ElMessage.success('资源数据已刷新')
    console.log('搜索条件:', resourceSearchForm)
    resourceLoading.value = false
  })
}

const resetResourceSearch = () => {
  resourceSearchForm.keyword = ''
  resourceSearchForm.type = ''
}

const handleAddResource = () => {
  resourceDialogType.value = 'add'
  resourceDialogTitle.value = '新增资源'
  Object.assign(resourceForm, {
    id: Date.now(),
    name: '',
    type: '',
    quantity: '',
    location: '',
    status: '可用',
    updateTime: new Date().toLocaleString()
  })
  resourceDialogVisible.value = true
}

const viewResource = (row: any) => {
  resourceDialogType.value = 'view'
  resourceDialogTitle.value = '查看资源'
  Object.assign(resourceForm, row)
  resourceDialogVisible.value = true
}

const dispatchResource = (row: any) => {
  ElMessageBox.prompt(
    `请输入调度${row.name}的数量`,
    '资源调度',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '请输入有效的数量'
    }
  ).then(({ value }) => {
    ElMessage.success(`已调度${row.name} ${value}${row.type === '人员' ? '人' : '个'}`)
    // 如果调度数量超过总数，则标记为已调用
    const num = parseInt(value)
    const total = parseInt(row.quantity)
    if (num >= total) {
      row.status = '已调用'
    }
  }).catch(() => {
    // 取消操作
  })
}

const deleteResource = (row: any) => {
  dataActions.delete('应急资源', row.name, () => {
    const index = resourceList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      resourceList.value.splice(index, 1)
    }
  })
}

const submitResourceForm = async () => {
  if (!resourceFormRef.value) return
  
  await resourceFormRef.value.validate((valid) => {
    if (valid) {
      if (resourceDialogType.value === 'add') {
        // 添加新资源
        resourceList.value.unshift({
          ...resourceForm,
          updateTime: new Date().toLocaleString()
        })
        ElMessage.success('资源添加成功')
      } else if (resourceDialogType.value === 'edit') {
        // 编辑资源
        const index = resourceList.value.findIndex(item => item.id === resourceForm.id)
        if (index !== -1) {
          resourceList.value[index] = { 
            ...resourceForm,
            updateTime: new Date().toLocaleString()
          }
        }
        ElMessage.success('资源更新成功')
      }
      resourceDialogVisible.value = false
    }
  })
}

// 预案相关方法
const handlePlanSearch = () => {
  planLoading.value = true
  baseActions.refresh(() => {
    ElMessage.success('预案数据已刷新')
    console.log('搜索条件:', planSearchForm)
    planLoading.value = false
  })
}

const resetPlanSearch = () => {
  planSearchForm.keyword = ''
  planSearchForm.type = ''
}

const handleAddPlan = () => {
  planDialogType.value = 'add'
  planDialogTitle.value = '新增预案'
  Object.assign(planForm, {
    id: Date.now(),
    name: '',
    type: '',
    level: '',
    department: '',
    content: '',
    updateTime: new Date().toLocaleString(),
    status: '已启用'
  })
  planDialogVisible.value = true
}

const viewPlan = (row: any) => {
  planDialogType.value = 'view'
  planDialogTitle.value = '查看预案'
  Object.assign(planForm, row)
  planDialogVisible.value = true
}

const editPlan = (row: any) => {
  planDialogType.value = 'edit'
  planDialogTitle.value = '编辑预案'
  Object.assign(planForm, row)
  planDialogVisible.value = true
}

const deletePlan = (row: any) => {
  dataActions.delete('应急预案', row.name, () => {
    const index = planList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      planList.value.splice(index, 1)
    }
  })
}

const submitPlanForm = async () => {
  if (!planFormRef.value) return
  
  await planFormRef.value.validate((valid) => {
    if (valid) {
      if (planDialogType.value === 'add') {
        // 添加新预案
        planList.value.unshift({
          ...planForm,
          updateTime: new Date().toLocaleString()
        })
        ElMessage.success('预案添加成功')
      } else if (planDialogType.value === 'edit') {
        // 编辑预案
        const index = planList.value.findIndex(item => item.id === planForm.id)
        if (index !== -1) {
          planList.value[index] = { 
            ...planForm,
            updateTime: new Date().toLocaleString()
          }
        }
        ElMessage.success('预案更新成功')
      }
      planDialogVisible.value = false
    }
  })
}

// 页面初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑，如从API获取数据等
})
</script>

<style scoped>
.emergency-container {
  padding: 20px;
}

.emergency-overview {
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

.emergency-management {
  margin-bottom: 20px;
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
}

:deep(.el-card__header) {
  padding: 15px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-button) {
  transition: none;
}

:deep(.el-button:hover) {
  opacity: 1;
}

:deep(.el-button--primary):not(.is-link) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #fff;
}

:deep(.el-button--primary:not(.is-link):hover) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #fff;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--primary.is-link:hover) {
  background: none !important;
  border: none !important;
  color: #409EFF !important;
  box-shadow: none !important;
}
</style> 