<template>
  <div class="system-container">
    <div class="operation-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="系统名称/负责人" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="运行状态" clearable style="width: 140px">
            <el-option label="运行中" value="运行中" />
            <el-option label="异常" value="异常" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card class="system-list-card">
      <el-row :gutter="20">
        <el-col v-for="item in systemList" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="system-card" shadow="hover" @click="handleDetail(item)">
            <div class="sys-icon">
              <el-icon :size="32">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="sys-title">{{ item.systemName }}</div>
            <div class="sys-desc">{{ item.desc }}</div>
            <div class="sys-meta">
              <span class="sys-owner">负责人：{{ item.owner }}</span>
              <el-tag :type="item.status === '运行中' ? 'success' : item.status === '异常' ? 'danger' : 'info'" size="small">
                {{ item.status }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div class="pagination">
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
    </el-card>
    <el-drawer v-model="drawerVisible" title="系统详情" size="400px" direction="rtl">
      <div v-if="currentDetail">
        <div class="sys-detail-title">
          <el-icon :size="32" style="vertical-align: middle; margin-right: 8px;">
            <component :is="currentDetail.icon" />
          </el-icon>
          <span>{{ currentDetail.systemName }}</span>
        </div>
        <div class="sys-detail-meta">
          <el-tag :type="currentDetail.status === '运行中' ? 'success' : currentDetail.status === '异常' ? 'danger' : 'info'" size="small">
            {{ currentDetail.status }}
          </el-tag>
          <span style="margin-left: 16px;">负责人：{{ currentDetail.owner }}</span>
        </div>
        <div class="sys-detail-desc">{{ currentDetail.desc }}</div>
        <div class="sys-detail-update">更新时间：{{ currentDetail.updateTime }}</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Monitor, Platform, Cpu, DataLine, Warning, Box, Folder, DataAnalysis } from '@element-plus/icons-vue'

interface SystemItem {
  id: number;
  systemName: string;
  owner: string;
  status: string;
  desc: string;
  updateTime: string;
  icon: any;
}

const originalSystemList = ref<SystemItem[]>([
  { id: 1, systemName: '政务便民服务平台', owner: '王晓强', status: '运行中', desc: '政务服务、事项办理、政策公开', updateTime: '2025-06-01 09:00', icon: Platform },
  { id: 2, systemName: '村务管理系统', owner: '李文娜', status: '运行中', desc: '村级事务、人口管理、党务公开', updateTime: '2025-06-01 08:30', icon: Folder },
  { id: 3, systemName: '农业信息化平台', owner: '刘志洋', status: '运行中', desc: '农情监测、农产品溯源、政策推送', updateTime: '2025-06-02 10:00', icon: DataAnalysis },
  { id: 4, systemName: '应急指挥系统', owner: '张丽敏', status: '运行中', desc: '应急事件上报、资源调度、预案管理', updateTime: '2025-06-03 11:00', icon: Box },
  { id: 5, systemName: '网格化管理平台', owner: '赵明', status: '运行中', desc: '网格员管理、事件流转、巡查统计', updateTime: '2025-06-04 12:00', icon: DataLine },
  { id: 6, systemName: '数据备份系统', owner: '许静', status: '运行中', desc: '数据定时备份、容灾恢复、安全存储', updateTime: '2025-06-05 13:00', icon: Cpu },
  { id: 7, systemName: '硬件资源管理', owner: '刘强', status: '运行中', desc: '服务器、存储、网络设备统一管理', updateTime: '2025-06-06 14:00', icon: Monitor },
  { id: 8, systemName: '视频监控平台', owner: '王芳', status: '运行中', desc: '视频监控、智能分析、告警联动', updateTime: '2025-06-07 15:00', icon: Warning },
  { id: 9, systemName: '镇村资产管理', owner: '宋倩', status: '运行中', desc: '公共资产、物资、设施管理', updateTime: '2025-06-08 16:00', icon: Folder },
  { id: 10, systemName: '数据服务平台', owner: '冯媛', status: '运行中', desc: '数据采集、共享、分析服务', updateTime: '2025-06-09 17:00', icon: DataAnalysis }
])
const systemList = ref<SystemItem[]>([])

const searchForm = reactive({
  keyword: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const drawerVisible = ref(false)
const currentDetail = ref<SystemItem | null>(null)

const handleSearch = () => {
  let filtered = [...originalSystemList.value]
  if (searchForm.keyword) {
    filtered = filtered.filter(d => d.systemName.includes(searchForm.keyword) || d.owner.includes(searchForm.keyword))
  }
  if (searchForm.status) {
    filtered = filtered.filter(d => d.status === searchForm.status)
  }
  total.value = filtered.length
  systemList.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
  handleSearch()
}

const handleDetail = (item: SystemItem) => {
  currentDetail.value = item
  drawerVisible.value = true
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.system-container {
  padding: 20px;
}
.operation-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  display: flex;
  align-items: center;
}
.system-list-card {
  margin-bottom: 20px;
}
.system-card {
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 10px;
  transition: box-shadow 0.2s;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.system-card:hover {
  box-shadow: 0 4px 16px rgba(64,158,255,0.15);
}
.sys-icon {
  margin-bottom: 8px;
  color: #409EFF;
}
.sys-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}
.sys-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}
.sys-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}
.sys-owner {
  font-size: 13px;
  color: #666;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.sys-detail-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.sys-detail-meta {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sys-detail-desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
}
.sys-detail-update {
  font-size: 13px;
  color: #999;
}
</style> 