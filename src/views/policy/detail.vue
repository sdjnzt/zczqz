<template>
  <div class="policy-detail-container">
    <el-page-header @back="goBack" :icon="ArrowLeft">
      <template #content>
        <div class="page-header-content">
          <span class="page-title">{{ policy.title }}</span>
          <el-tag
            class="policy-tag"
            :type="getTagType(policy.category)"
            effect="plain"
            size="large"
          >
            {{ getCategoryName(policy.category) }}
          </el-tag>
        </div>
      </template>
      <template #extra>
        <div class="extra-buttons">
          <el-button type="primary" @click="downloadPolicy">
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
          <el-button @click="printPolicy">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
          <el-button type="info" @click="sharePolicy">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
        </div>
      </template>
    </el-page-header>

    <el-card class="policy-main-card">
      <div class="policy-meta">
        <div class="meta-item">
          <el-icon><OfficeBuilding /></el-icon>
          <span class="meta-label">发布单位：</span>
          <span>{{ policy.source }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Calendar /></el-icon>
          <span class="meta-label">发布日期：</span>
          <span>{{ formatDate(policy.publishDate) }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Document /></el-icon>
          <span class="meta-label">文号：</span>
          <span>{{ policy.documentNo || '无' }}</span>
        </div>
        <div class="meta-item">
          <el-icon><View /></el-icon>
          <span class="meta-label">阅读次数：</span>
          <span>{{ policy.views }}</span>
        </div>
      </div>

      <el-divider />

      <div class="policy-content">
        <el-alert
          v-if="policy.summary"
          type="info"
          :closable="false"
          class="policy-summary"
        >
          <template #title>
            <div class="summary-title">摘要</div>
          </template>
          <div class="summary-content">{{ policy.summary }}</div>
        </el-alert>

        <div class="policy-text">
          <h3 class="content-title">正文</h3>
          <div class="content-body" v-html="policy.content"></div>
        </div>

        <div v-if="policy.attachments && policy.attachments.length > 0" class="policy-attachments">
          <h3 class="content-title">附件</h3>
          <div class="attachment-cards">
            <el-card 
              v-for="(attachment, index) in policy.attachments" 
              :key="index" 
              class="attachment-card"
              shadow="hover"
              @click="downloadAttachment(attachment)"
            >
              <div class="attachment-icon">
                <el-icon size="24"><Document /></el-icon>
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="related-policies-card">
      <template #header>
        <div class="card-header">
          <h3>相关政策</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="related in relatedPolicies" :key="related.id">
          <div class="related-policy-card" @click="viewPolicy(related.id)">
            <div class="related-header">
              <el-tag :type="getTagType(related.category)" effect="plain" size="small">
                {{ getCategoryName(related.category) }}
              </el-tag>
              <span class="related-date">{{ formatDate(related.publishDate) }}</span>
            </div>
            <h4 class="related-title">{{ related.title }}</h4>
            <p class="related-summary">{{ related.summary }}</p>
            <div class="related-footer">
              <span class="related-source">{{ related.source }}</span>
              <span class="related-views">
                <el-icon><View /></el-icon> {{ related.views }}
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="policy-actions">
      <el-button type="primary" @click="viewInterpretation" v-if="policy.hasInterpretation">
        <el-icon><Reading /></el-icon>
        查看政策解读
      </el-button>
      <el-button @click="reportError">
        <el-icon><Warning /></el-icon>
        问题反馈
      </el-button>
    </div>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享政策" width="400px" destroy-on-close align-center>
      <div class="share-dialog-content">
        <div class="share-url">
          <el-input v-model="shareUrl" readonly>
            <template #append>
              <el-button @click="copyShareUrl">复制</el-button>
            </template>
          </el-input>
        </div>
        <div class="share-qrcode">
          <div class="qrcode-placeholder">二维码将在这里显示</div>
        </div>
        <div class="share-platforms">
          <el-button round type="primary">微信</el-button>
          <el-button round type="success">QQ</el-button>
          <el-button round type="danger">微博</el-button>
          <el-button round type="warning">钉钉</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 问题反馈对话框 -->
    <el-dialog v-model="feedbackDialogVisible" title="问题反馈" width="500px" destroy-on-close align-center>
      <el-form ref="feedbackFormRef" :model="feedbackForm" label-width="100px">
        <el-form-item label="问题类型" prop="type">
          <el-select v-model="feedbackForm.type" placeholder="请选择问题类型" style="width: 100%">
            <el-option label="内容错误" value="content" />
            <el-option label="链接失效" value="link" />
            <el-option label="附件损坏" value="attachment" />
            <el-option label="其他问题" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="content">
          <el-input 
            v-model="feedbackForm.content" 
            type="textarea" 
            rows="4" 
            placeholder="请详细描述您发现的问题..."
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="feedbackForm.contact" placeholder="请留下您的联系方式（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedbackDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="下载" placement="left">
        <el-button type="success" circle class="action-button" @click="downloadPolicy">
          <el-icon><Download /></el-icon>
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="分享" placement="left">
        <el-button type="primary" circle class="action-button" @click="sharePolicy">
          <el-icon><Share /></el-icon>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download,
  Printer,
  Share,
  Document,
  Calendar,
  OfficeBuilding,
  View,
  Reading,
  Warning,
  ArrowLeft,
  Top
} from '@element-plus/icons-vue'

interface Attachment {
  name: string;
  url: string;
  size: number;
}

interface PolicyData {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishDate: string;
  source: string;
  documentNo?: string;
  views: number;
  attachments?: Attachment[];
  hasInterpretation?: boolean;
}

const route = useRoute()
const router = useRouter()
const policyId = ref<number>(0)
const shareDialogVisible = ref(false)
const feedbackDialogVisible = ref(false)
const shareUrl = ref('')

// 反馈表单
const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})

// 分类数据
const categories = [
  { label: '农业政策', value: 'agriculture' },
  { label: '教育政策', value: 'education' },
  { label: '医疗卫生', value: 'healthcare' },
  { label: '社会保障', value: 'social-security' },
  { label: '财政金融', value: 'finance' },
  { label: '城乡建设', value: 'construction' }
]

// 示例政策详情数据
const policy = ref<PolicyData>({
  id: 1,
  title: '关于促进城前镇农业产业化发展的实施意见',
  summary: '为加快推进城前镇农业产业化发展，提升农业现代化水平，特制定本实施意见。',
  content: `<p>城前镇人民政府关于促进农业产业化发展的实施意见</p>
    <p>发文字号：城前政发〔2025〕12号</p>
    <p>各村委会，镇政府各部门：</p>
    <p>为深入贯彻落实党的二十大精神，全面推进乡村振兴战略，加快推进农业农村现代化，根据《邹城市人民政府关于促进农业产业化发展的指导意见》（邹政发〔2025〕25号）文件要求，结合我镇实际，特制定本实施意见。</p>
    <h4>一、总体要求</h4>
    <p>以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，坚持农业农村优先发展，按照产业兴旺、生态宜居、乡风文明、治理有效、生活富裕的总要求，以推进农业供给侧结构性改革为主线，以提高农业质量效益和竞争力为目标，大力实施农业品牌战略，促进农村一二三产业融合发展，构建现代农业产业体系、生产体系、经营体系，推动我镇农业农村经济高质量发展。</p>
    <h4>二、发展目标</h4>
    <p>到2027年，全镇农业产业化经营水平明显提高，农业产业结构明显优化，农产品质量安全水平明显提升，农业品牌影响力明显增强，农民收入水平明显提高。具体目标为：</p>
    <p>——农业产业化组织体系更加完善。培育发展农业龙头企业10家，农民专业合作社30个，家庭农场50家，带动全镇70%以上的农户参与产业化经营。</p>
    <p>——农业产业结构更加优化。全镇优质粮食种植面积达到2万亩，设施蔬菜种植面积达到5000亩，特色果品种植面积达到3000亩，畜牧水产养殖规模稳步提升。</p>
    <p>——农产品质量安全水平显著提高。农产品质量安全监测合格率保持在98%以上，主要农产品绿色、有机认证面积达到总产地面积的35%以上。</p>
    <p>——农业品牌建设成效显著。培育区域公用品牌2个，企业品牌5个，产品品牌10个，品牌农产品年销售收入达到2亿元。</p>
    <p>——农民收入持续增加。到2027年，全镇农民人均可支配收入达到3万元，年均增长8%以上。</p>
    <h4>三、重点任务</h4>
    <p>(一)大力发展现代农业园区</p>
    <p>1.加快现代农业产业园建设。以"一园多区"的模式，规划建设城前镇现代农业产业园，重点打造粮食生产功能区、设施蔬菜产业区、特色果品产业区、畜禽养殖区和农产品加工区五大功能区，推动形成产加销一体化发展格局。</p>
    <p>2.提升园区基础设施水平。加强园区内农田水利、道路交通、电力通信等基础设施建设，实施高标准农田建设项目，提高农田设施装备水平和农业生产能力。</p>
    <p>3.增强园区科技创新能力。建立产学研合作机制，引进先进适用技术，建设技术示范基地，培育一批农业科技示范户，推动农业科技成果转化和应用。</p>
    <p>(二)培育壮大农业经营主体</p>
    <p>1.扶持农业龙头企业发展。支持农业龙头企业扩大生产规模，提升产品质量，延伸产业链条，打造品牌，拓展市场。重点扶持发展粮食加工、果蔬加工、畜产品加工等龙头企业。</p>
    <p>2.发展壮大农民专业合作社。支持农民专业合作社标准化生产、规模化经营、品牌化销售，提高组织化程度和服务能力。鼓励合作社开展农产品加工、储藏、运输、销售等服务。</p>
    <p>3.规范发展家庭农场。支持有条件的农户发展适度规模经营，创办家庭农场，健全家庭农场名录管理制度，提升家庭农场标准化生产水平和经营管理能力。</p>
    <p>(三)加强农产品品牌建设</p>
    <p>1.实施农产品品牌战略。坚持区域公用品牌、企业品牌、产品品牌协同发展，打造具有城前特色的农产品品牌体系。重点打造"城前大米"、"城前蔬菜"区域公用品牌，提升品牌知名度和影响力。</p>
    <p>2.强化品牌保护和管理。建立健全品牌管理制度，规范品牌使用，加强品牌监管，严厉打击侵权假冒行为，维护品牌声誉。</p>
    <p>3.加大品牌宣传推广力度。利用各类展会、媒体平台等多种渠道，加大品牌宣传推广力度，提高品牌影响力和市场认可度。</p>
    <p>(四)推动农村一二三产业融合发展</p>
    <p>1.延伸农业产业链。大力发展农产品精深加工，提高农产品加工转化率和附加值。支持农业龙头企业建设农产品加工园区，形成农产品加工产业集群。</p>
    <p>2.发展农村电子商务。建设农村电子商务服务站点，培训电商人才，搭建农产品网络销售平台，拓宽农产品销售渠道。</p>
    <p>3.发展乡村旅游。依托城前镇良好的生态环境和农业资源，开发观光农业、休闲农业、农事体验等乡村旅游项目，促进农业与旅游、文化、教育等产业深度融合。</p>
    <h4>四、保障措施</h4>
    <p>(一)加强组织领导</p>
    <p>成立城前镇农业产业化发展工作领导小组，由镇长任组长，分管副镇长任副组长，相关部门负责人为成员，统筹协调全镇农业产业化发展工作。各村要结合实际，制定具体实施方案，细化工作措施，确保各项任务落到实处。</p>
    <p>(二)加大政策支持</p>
    <p>整合涉农资金，重点支持农业产业化发展。落实农业补贴、农业保险等支农惠农政策，降低农业生产经营风险。创新金融服务方式，满足农业经营主体多样化融资需求。</p>
    <p>(三)强化科技支撑</p>
    <p>加强与农业科研院所、高等院校的合作，引进先进适用技术，提高农业科技贡献率。建立健全农业技术推广服务体系，加强农业技术培训，提高农民科学种养水平。</p>
    <p>(四)完善利益联结机制</p>
    <p>引导农业龙头企业、农民专业合作社等经营主体通过"保底收益+按股分红"、"订单收购+就业增收"等方式，与小农户建立紧密利益联结机制，让农民共享产业发展红利。</p>
    <p>(五)加强监督考核</p>
    <p>建立农业产业化发展考核评价机制，将农业产业化发展成效纳入村级组织和相关部门绩效考核内容，定期开展督导检查，确保政策措施落实到位。</p>
    <p>本意见自发布之日起实施。</p>
    <p style="text-align: right;">城前镇人民政府</p>
    <p style="text-align: right;">2025年6月1日</p>`,
  category: 'agriculture',
  publishDate: '2025-06-01',
  source: '邹城市城前镇人民政府',
  documentNo: '城前政发〔2025〕12号',
  views: 245,
  attachments: [
    {
      name: '关于促进城前镇农业产业化发展的实施意见.pdf',
      url: '/attachments/policy_1.pdf',
      size: 2048576 // 2MB
    },
    {
      name: '附件1：城前镇农业产业化项目申报指南.docx',
      url: '/attachments/policy_1_attachment_1.docx',
      size: 1048576 // 1MB
    }
  ],
  hasInterpretation: true
})

// 相关政策
const relatedPolicies = ref([
  {
    id: 4,
    title: '城前镇农业生产补贴政策实施细则',
    summary: '明确农业生产补贴政策的实施范围、申请条件、补贴标准和程序。',
    category: 'agriculture',
    publishDate: '2025-05-10',
    source: '邹城市财政局',
    views: 320
  },
  {
    id: 2,
    title: '城前镇农村宅基地管理办法（试行）',
    summary: '规范城前镇农村宅基地管理，保障农民合法权益，促进农村和谐稳定。',
    category: 'construction',
    publishDate: '2025-05-20',
    source: '邹城市自然资源局',
    views: 198
  },
  {
    id: 6,
    title: '关于加强城前镇乡村治理体系建设的指导意见',
    summary: '健全完善城前镇乡村治理体系，提升乡村治理能力和水平。',
    category: 'social-security',
    publishDate: '2025-05-01',
    source: '邹城市民政局',
    views: 176
  }
])

// 返回上一页
const goBack = () => {
  router.back()
}

// 下载政策文件
const downloadPolicy = () => {
  ElMessage.success(`正在下载: ${policy.value.title}`)
}

// 打印政策
const printPolicy = () => {
  ElMessage.success('正在准备打印...')
  window.print()
}

// 分享政策
const sharePolicy = () => {
  shareUrl.value = `${window.location.origin}/policy/detail/${policy.value.id}`
  shareDialogVisible.value = true
}

// 复制分享链接
const copyShareUrl = () => {
  navigator.clipboard.writeText(shareUrl.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 下载附件
const downloadAttachment = (attachment: Attachment) => {
  ElMessage.success(`正在下载附件: ${attachment.name}`)
}

// 查看政策解读
const viewInterpretation = () => {
  ElMessageBox.alert(
    '政策解读详情页面正在建设中，敬请期待。',
    '功能提示',
    {
      confirmButtonText: '确定'
    }
  )
}

// 查看相关政策
const viewPolicy = (id: number) => {
  router.push(`/policy/detail/${id}`)
}

// 报告问题
const reportError = () => {
  feedbackDialogVisible.value = true
}

// 提交反馈
const submitFeedback = () => {
  if (!feedbackForm.value.type) {
    ElMessage.warning('请选择问题类型')
    return
  }
  if (!feedbackForm.value.content) {
    ElMessage.warning('请输入问题描述')
    return
  }
  
  ElMessage.success('感谢您的反馈，我们将尽快处理')
  feedbackDialogVisible.value = false
  
  // 重置表单
  feedbackForm.value = {
    type: '',
    content: '',
    contact: ''
  }
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.label : categoryId
}

// 获取标签类型
const getTagType = (categoryId: string): string => {
  const typeMap: { [key: string]: string } = {
    'agriculture': 'success',
    'education': 'primary',
    'healthcare': 'info',
    'social-security': 'warning',
    'finance': 'danger',
    'construction': ''
  }
  return typeMap[categoryId] || ''
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dateStr
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  // 获取路由参数中的政策ID
  const id = Number(route.params.id)
  policyId.value = id
  
  // 实际应用中，这里应该根据ID从API获取政策详情数据
  console.log(`获取政策ID: ${id} 的详细信息`)
  
  // 更新浏览次数
  policy.value.views += 1
})
</script>

<style scoped>
.policy-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}

.policy-tag {
  margin-left: 10px;
}

.extra-buttons {
  display: flex;
  gap: 10px;
}

.policy-main-card {
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.policy-meta {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.meta-item {
  margin-right: 30px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.meta-item .el-icon {
  margin-right: 5px;
  color: #909399;
}

.meta-label {
  font-weight: bold;
  color: #606266;
  margin-right: 5px;
}

.policy-content {
  margin: 20px 0;
}

.policy-summary {
  margin-bottom: 20px;
}

.summary-title {
  font-weight: bold;
  font-size: 16px;
}

.summary-content {
  margin-top: 8px;
  line-height: 1.8;
  color: #606266;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.content-body {
  line-height: 1.8;
  color: #303133;
  font-size: 15px;
}

.content-body h4 {
  margin-top: 20px;
  margin-bottom: 15px;
  font-weight: bold;
  color: #303133;
}

.content-body p {
  margin-bottom: 15px;
  text-indent: 2em;
}

.policy-attachments {
  margin: 30px 0;
}

.attachment-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.attachment-card {
  width: 200px;
  cursor: pointer;
  transition: all 0.3s;
}

.attachment-card:hover {
  transform: translateY(-5px);
}

.attachment-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  color: #409EFF;
}

.attachment-info {
  text-align: center;
}

.attachment-name {
  font-weight: 500;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
}

.related-policies-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.card-header h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.related-policy-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.related-policy-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
  border-color: #c6e2ff;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.related-date {
  font-size: 12px;
  color: #909399;
}

.related-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
  color: #303133;
}

.related-summary {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.related-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.related-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.policy-actions {
  display: flex;
  justify-content: center;
  margin: 30px 0;
  gap: 20px;
}

.share-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-qrcode {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qrcode-placeholder {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  color: #909399;
  border-radius: 4px;
}

.share-platforms {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .extra-buttons {
    margin-top: 10px;
    justify-content: flex-start;
    width: 100%;
  }
  
  .meta-item {
    width: 100%;
    margin-right: 0;
  }
  
  .policy-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .share-platforms {
    flex-direction: column;
  }
}
</style> 