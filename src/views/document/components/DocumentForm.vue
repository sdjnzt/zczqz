<template>
  <div class="document-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="公文标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入公文标题" maxlength="100" show-word-limit />
      </el-form-item>
      
      <el-form-item label="公文类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择公文类型" style="width: 100%">
          <el-option
            v-for="item in documentTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="接收部门" prop="receiver">
        <el-select v-model="formData.receiver" placeholder="请选择接收部门" style="width: 100%">
          <el-option
            v-for="item in departments"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="紧急程度" prop="urgency">
        <el-radio-group v-model="formData.urgency">
          <el-radio label="平件">平件</el-radio>
          <el-radio label="急">急件</el-radio>
          <el-radio label="特急">特急</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="公文内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          placeholder="请输入公文内容"
          :rows="8"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="附件">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
          :limit="5"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 定义事件
const emit = defineEmits(['submit', 'cancel'])

// 表单引用
const formRef = ref<FormInstance>()

// 文件列表
const fileList = ref<Array<any>>([])

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

// 部门选项
const departments = [
  { label: '镇政府办', value: '镇政府办' },
  { label: '财政所', value: '财政所' },
  { label: '民政所', value: '民政所' },
  { label: '社会保障所', value: '社会保障所' },
  { label: '农业农村办公室', value: '农业农村办公室' },
  { label: '城建办公室', value: '城建办公室' },
  { label: '综治办公室', value: '综治办公室' },
  { label: '安监办', value: '安监办' },
  { label: '环保办', value: '环保办' },
  { label: '文教中心', value: '文教中心' }
]

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  receiver: '',
  urgency: '平件',
  content: '',
  attachments: [] as Array<{ name: string; url: string }>
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入公文标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择公文类型', trigger: 'change' }
  ],
  receiver: [
    { required: true, message: '请选择接收部门', trigger: 'change' }
  ],
  urgency: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入公文内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '内容长度在 5 到 2000 个字符', trigger: 'blur' }
  ]
}

// 定义上传文件类型
interface UploadFile {
  name: string;
  raw: File;
}

// 文件变更处理
const handleFileChange = (_uploadFile: any, uploadFiles: Array<UploadFile>) => {
  fileList.value = uploadFiles
  formData.attachments = uploadFiles.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file.raw)
  }))
}

// 移除文件
const handleRemove = (_uploadFile: any, uploadFiles: Array<UploadFile>) => {
  fileList.value = uploadFiles
  formData.attachments = uploadFiles.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file.raw)
  }))
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...formData })
    }
  })
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.document-form {
  padding: 10px;
}
</style> 