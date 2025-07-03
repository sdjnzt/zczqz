<template>
  <el-table
    :data="data"
    style="width: 100%"
    border
    stripe
    highlight-current-row
    v-loading="loading"
  >
    <el-table-column type="index" width="50" align="center" />
    <el-table-column prop="name" label="姓名" width="120" />
    <el-table-column prop="phone" label="手机号" width="120" />
    <el-table-column prop="grid" label="所属网格" width="120" />
    <el-table-column prop="area" label="负责区域" min-width="200" show-overflow-tooltip />
    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)" effect="dark">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180" fixed="right">
      <template #default="{ row }">
        <el-button-group>
          <el-button type="primary" :icon="View" @click="handleView(row)" />
          <el-button type="warning" :icon="Edit" @click="handleEdit(row)" />
          <el-button type="danger" :icon="Delete" @click="handleDelete(row)" />
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { View, Edit, Delete } from '@element-plus/icons-vue'

interface StaffItem {
  id: number
  name: string
  phone: string
  grid: string
  area: string
  status: '在岗' | '请假'
}

defineProps<{
  data: any[];
  loading: boolean;
}>()

const emit = defineEmits<{
  (e: 'view', row: StaffItem): void
  (e: 'edit', row: StaffItem): void
  (e: 'delete', row: StaffItem): void
}>()

const getStatusType = (status: string) => {
  return status === '在岗' ? 'success' : 'info'
}

const handleView = (row: StaffItem) => {
  emit('view', row)
}

const handleEdit = (row: StaffItem) => {
  emit('edit', row)
}

const handleDelete = (row: StaffItem) => {
  emit('delete', row)
}
</script> 