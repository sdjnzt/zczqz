import { ref } from 'vue'

// 网格数据
export const gridList = ref([
  { id: 1, name: '第一网格', manager: '张三', population: 1200, households: 350, area: '2.5', status: '正常' },
  { id: 2, name: '第二网格', manager: '李四', population: 980, households: 280, area: '2.0', status: '正常' },
  { id: 3, name: '第三网格', manager: '王五', population: 1500, households: 420, area: '3.0', status: '正常' },
  { id: 4, name: '第四网格', manager: '赵六', population: 1100, households: 320, area: '2.2', status: '正常' },
  { id: 5, name: '第五网格', manager: '钱七', population: 1300, households: 380, area: '2.8', status: '正常' }
])

// 村务数据
export const villageList = ref([
  { id: 1, name: '张庄村', secretary: '张建国', population: 1250, area: 2800, income: 35 },
  { id: 2, name: '李庄村', secretary: '李志强', population: 980, area: 2200, income: 28 },
  { id: 3, name: '王庄村', secretary: '王伟', population: 1100, area: 2500, income: 32 },
  { id: 4, name: '赵庄村', secretary: '赵云', population: 870, area: 1800, income: 21 },
  { id: 5, name: '孙庄村', secretary: '孙磊', population: 1340, area: 3000, income: 40 }
])

// 村民数据
export const residentList = ref([
  { id: 1, name: '张志强', idCard: '370881198503154378', village: '张庄村', gender: '男', age: 38, phone: '15865432198', type: 'party' },
  { id: 2, name: '李丽华', idCard: '370881199007123425', village: '李庄村', gender: '女', age: 33, phone: '13776549821', type: 'normal' },
  { id: 3, name: '王文明', idCard: '370881196805127865', village: '王庄村', gender: '男', age: 55, phone: '18932156478', type: 'party' },
  { id: 4, name: '赵小丽', idCard: '370881200201087654', village: '赵庄村', gender: '女', age: 21, phone: '13798765432', type: 'normal' },
  { id: 5, name: '孙志远', idCard: '370881197305128907', village: '孙庄村', gender: '男', age: 50, phone: '17865432109', type: 'party' }
])

// 村务公开数据
export const publicList = ref([
  { id: 1, title: '张庄村2025年第一季度村务公开', village: '张庄村', type: '村务公开', publisher: '张建国', publishTime: '2025-06-05 10:00', views: 356, status: '已发布' },
  { id: 2, title: '张庄村2025年基础设施建设项目公示', village: '张庄村', type: '项目公示', publisher: '张建国', publishTime: '2025-06-10 14:30', views: 289, status: '已发布' },
  { id: 3, title: '李庄村2025年第一季度财务收支情况公开', village: '李庄村', type: '财务公开', publisher: '李志强', publishTime: '2025-06-08 09:20', views: 198, status: '已发布' },
  { id: 4, title: '王庄村2025年乡村振兴项目资金使用情况', village: '王庄村', type: '财务公开', publisher: '王伟', publishTime: '2025-06-12 11:10', views: 176, status: '已发布' },
  { id: 5, title: '赵庄村2025年道路硬化工程施工公告', village: '赵庄村', type: '项目公示', publisher: '赵云', publishTime: '2025-06-15 15:00', views: 210, status: '已发布' }
])

// 生成新的ID
export const generateId = (list: any[]) => {
  return Math.max(...list.map(item => item.id), 0) + 1
}

// 网格管理相关方法
export const gridMethods = {
  add: (data: any) => {
    const id = generateId(gridList.value)
    gridList.value.push({ ...data, id })
  },
  update: (id: number, data: any) => {
    const index = gridList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      gridList.value[index] = { ...gridList.value[index], ...data }
    }
  },
  delete: (id: number) => {
    const index = gridList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      gridList.value.splice(index, 1)
    }
  }
}

// 村务管理相关方法
export const villageMethods = {
  add: (data: any) => {
    const id = generateId(villageList.value)
    villageList.value.push({ ...data, id })
  },
  update: (id: number, data: any) => {
    const index = villageList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      villageList.value[index] = { ...villageList.value[index], ...data }
    }
  },
  delete: (id: number) => {
    const index = villageList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      villageList.value.splice(index, 1)
    }
  }
}

// 村民管理相关方法
export const residentMethods = {
  add: (data: any) => {
    const id = generateId(residentList.value)
    residentList.value.push({ ...data, id })
  },
  update: (id: number, data: any) => {
    const index = residentList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      residentList.value[index] = { ...residentList.value[index], ...data }
    }
  },
  delete: (id: number) => {
    const index = residentList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      residentList.value.splice(index, 1)
    }
  }
}

// 村务公开相关方法
export const publicMethods = {
  add: (data: any) => {
    const id = generateId(publicList.value)
    publicList.value.push({ ...data, id, publishTime: new Date().toLocaleString(), views: 0, status: '已发布' })
  },
  update: (id: number, data: any) => {
    const index = publicList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      publicList.value[index] = { ...publicList.value[index], ...data }
    }
  },
  delete: (id: number) => {
    const index = publicList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      publicList.value.splice(index, 1)
    }
  }
} 