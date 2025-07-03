import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 通用按钮操作工具库
 * 为系统中的各种按钮提供统一的操作方法
 */

// 基础操作
export const baseActions = {
  /**
   * 通用刷新操作
   * @param callback 刷新后的回调函数
   */
  refresh: (callback?: () => void) => {
    const loadingMsg = ElMessage({
      message: '正在刷新数据...',
      duration: 0,
      type: 'info'
    })
    
    setTimeout(() => {
      loadingMsg.close && loadingMsg.close()
      ElMessage.success('数据已刷新')
      callback && callback()
    }, 800)
  },
  
  /**
   * 通用导出操作
   * @param type 导出类型
   */
  export: (type: string) => {
    ElMessage({
      message: `正在导出${type}数据...`,
      type: 'info'
    })
    
    setTimeout(() => {
      ElMessage.success(`${type}数据已导出`)
    }, 1500)
  },
  
  /**
   * 通用打印操作
   * @param type 打印类型
   */
  print: (type: string) => {
    ElMessage({
      message: `正在准备打印${type}...`,
      type: 'info'
    })
    
    setTimeout(() => {
      ElMessage.success(`${type}打印请求已发送`)
    }, 1200)
  }
}

// 数据操作
export const dataActions = {
  /**
   * 通用添加操作
   * @param type 数据类型
   * @param callback 添加成功后的回调
   */
  add: (type: string, callback?: () => void) => {
    ElMessage.success(`${type}添加成功`)
    callback && callback()
  },
  
  /**
   * 通用编辑操作
   * @param type 数据类型
   * @param callback 编辑成功后的回调
   */
  edit: (type: string, callback?: () => void) => {
    ElMessage.success(`${type}更新成功`)
    callback && callback()
  },
  
  /**
   * 通用删除操作
   * @param type 数据类型
   * @param name 数据名称
   * @param callback 删除成功后的回调
   */
  delete: (type: string, name: string, callback?: () => void) => {
    return ElMessageBox.confirm(
      `确定要删除${name ? `"${name}"` : '该' + type}吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage.success(`${type}删除成功`)
      callback && callback()
    }).catch(() => {
      // 取消删除，不做任何操作
    })
  },
  
  /**
   * 通用查看详情操作
   * @param type 数据类型
   * @param callback 查看详情的回调
   */
  view: (type: string, callback?: () => void) => {
    ElMessage.info(`查看${type}详情`)
    callback && callback()
  },
  
  /**
   * 通用状态切换操作
   * @param type 数据类型
   * @param status 当前状态
   * @param callback 状态切换后的回调
   */
  toggleStatus: (type: string, status: string, callback?: (newStatus: string) => void) => {
    const newStatus = status === 'active' ? 'inactive' : 'active'
    const statusText = newStatus === 'active' ? '启用' : '禁用'
    
    ElMessage.success(`${type}已${statusText}`)
    callback && callback(newStatus)
    return newStatus
  }
}

// 系统操作
export const systemActions = {
  /**
   * 重启系统操作
   * @param system 系统名称
   * @param callback 重启后的回调
   */
  restart: (system: string, callback?: () => void) => {
    return ElMessageBox.confirm(
      `确定要重启${system}吗？重启过程中系统将暂时不可用。`,
      '重启确认',
      {
        confirmButtonText: '确定重启',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage({
        type: 'info',
        message: `${system}正在重启中，请稍候...`
      })
      
      // 模拟重启过程
      setTimeout(() => {
        ElMessage.success(`${system}已成功重启`)
        callback && callback()
      }, 3000)
    })
  },
  
  /**
   * 系统配置操作
   * @param system 系统名称
   * @param callback 配置操作的回调
   */
  config: (system: string, callback?: () => void) => {
    ElMessage.info(`正在配置${system}...`)
    callback && callback()
  },
  
  /**
   * 生成报表操作
   * @param type 报表类型
   * @param callback 生成报表后的回调
   */
  generateReport: (type: string, callback?: () => void) => {
    ElMessage.info(`正在生成${type}报表...`)
    
    setTimeout(() => {
      ElMessage.success(`${type}报表已生成`)
      callback && callback()
    }, 1500)
  }
}

// 页面导航操作
export const navigationActions = {
  /**
   * 页面跳转操作
   * @param pageName 目标页面名称
   * @param callback 跳转后的回调
   */
  navigate: (pageName: string, callback?: () => void) => {
    ElMessage.info(`正在跳转到${pageName}页面...`)
    
    setTimeout(() => {
      ElMessage.success(`已跳转到${pageName}页面`)
      callback && callback()
    }, 800)
  }
}

// 处理告警和事件
export const eventActions = {
  /**
   * 处理告警或事件
   * @param type 类型（告警/事件）
   * @param callback 处理后的回调
   */
  process: (type: string, callback?: () => void) => {
    ElMessage.success(`${type}已处理`)
    callback && callback()
  },
  
  /**
   * 批量处理告警或事件
   * @param type 类型（告警/事件）
   * @param count 处理数量
   * @param callback 处理后的回调
   */
  batchProcess: (type: string, count: number, callback?: () => void) => {
    ElMessageBox.confirm(
      `确定要批量处理选中的${count}个${type}吗？`,
      '批量处理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage.success(`已批量处理${count}个${type}`)
      callback && callback()
    })
  }
}

// 导出所有操作
export default {
  ...baseActions,
  ...dataActions,
  ...systemActions,
  ...navigationActions,
  ...eventActions
} 