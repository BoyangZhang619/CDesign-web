/**
 * 页面路由清单与功能定义
 * 
 * 以下是健康数字孪生系统的 12 个功能页面及其对应路由
 */

export const PAGES_STRUCTURE = {
  // 1. 个人基础信息页
  basicInfo: {
    path: '/profile/basic-info',
    name: 'basic-info',
    component: 'BasicInfoView',
    icon: '👤',
    title: '个人基础信息',
    description: '配置健康模型初始参数',
    dataSource: '用户主动填写',
    twinRelation: '模型初始条件输入'
  },

  // 2. 健康打卡页
  dailyCheckin: {
    path: '/health/daily-checkin',
    name: 'daily-checkin',
    component: 'DailyCheckinView',
    icon: '📝',
    title: '健康打卡',
    description: '记录每日饮食、运动、体重、睡眠等实时数据',
    dataSource: '用户每日输入与可选AI识别',
    twinRelation: '现实生活行为映射为数字模型输入'
  },

  // 3. 历史记录页
  history: {
    path: '/health/history',
    name: 'history',
    component: 'HistoryView',
    icon: '📊',
    title: '历史记录',
    description: '查询历史打卡详情，支持按类型和时间筛选',
    dataSource: '健康打卡历史数据',
    twinRelation: '为模型演化提供时间维度支撑'
  },

  // 4. 健康画像（数字孪生）页
  portrait: {
    path: '/analysis/portrait',
    name: 'portrait',
    component: 'PortraitView',
    icon: '🎨',
    title: '健康画像',
    description: '展示数字孪生模型，用雷达图呈现多维指标',
    dataSource: '基础信息与历史打卡数据综合计算',
    twinRelation: '核心模型展示层'
  },

  // 5. 趋势分析页
  trends: {
    path: '/analysis/trends',
    name: 'trends',
    component: 'TrendsView',
    icon: '📈',
    title: '趋势分析',
    description: '分析体重、摄入、运动等指标的变化趋势',
    dataSource: '历史记录数据',
    twinRelation: '反映模型随时间的演化过程'
  },

  // 6. 未来预测页
  forecast: {
    path: '/analysis/forecast',
    name: 'forecast',
    component: 'ForecastView',
    icon: '🔮',
    title: '未来预测',
    description: '预测体重与健康评分变化，识别潜在风险',
    dataSource: '近期行为数据与模型计算结果',
    twinRelation: '利用数字模型进行未来状态推演'
  },

  // 7. 情景模拟页
  simulation: {
    path: '/analysis/simulation',
    name: 'simulation',
    component: 'SimulationView',
    icon: '🧪',
    title: '情景模拟',
    description: '调整变量查看不同生活方式的健康结果',
    dataSource: '当前模型与用户设定参数',
    twinRelation: '体现数字孪生的可实验性'
  },

  // 8. 个性化建议页
  recommendations: {
    path: '/recommendations',
    name: 'recommendations',
    component: 'RecommendationsView',
    icon: '💡',
    title: '个性化建议',
    description: '基于分析结果生成饮食、运动、作息建议',
    dataSource: '模型分析结果',
    twinRelation: '将模型输出转化为现实干预策略'
  },

  // 9. 健康目标页
  goals: {
    path: '/goals',
    name: 'goals',
    component: 'GoalsView',
    icon: '🎯',
    title: '健康目标',
    description: '设定和跟踪健康目标，展示完成进度',
    dataSource: '用户输入与系统计算',
    twinRelation: '为模型优化提供方向'
  },

  // 10. 校园饮食推荐页
  campusDiet: {
    path: '/recommendations/campus-diet',
    name: 'campus-diet',
    component: 'CampusDietView',
    icon: '🍽️',
    title: '校园饮食推荐',
    description: '提供食堂搭配、外卖选择和宿舍方案',
    dataSource: '系统规则与用户画像',
    twinRelation: '增强模型输出的校园场景可落地性'
  },

  // 11. 消息与提醒页
  notifications: {
    path: '/notifications',
    name: 'notifications',
    component: 'NotificationsView',
    icon: '🔔',
    title: '消息与提醒',
    description: '打卡提醒、健康警告和周期性总结推送',
    dataSource: '实时数据与规则触发',
    twinRelation: '作为模型干预机制，推动用户持续参与'
  },

  // 12. AI 对话页
  aiChat: {
    path: '/ai-chat',
    name: 'ai-chat',
    component: 'AIChatView',
    icon: '🤖',
    title: 'AI 对话',
    description: '与AI助手交互获取个性化健康咨询',
    dataSource: '用户输入与AI模型',
    twinRelation: '提供基于数字孪生的智能对话服务'
  }
}

/**
 * 获取所有页面列表
 */
export function getAllPages() {
  return Object.values(PAGES_STRUCTURE)
}

/**
 * 按类别获取页面
 */
export function getPagesByCategory(category: 'profile' | 'health' | 'analysis' | 'recommendations' | 'settings') {
  const pages = getAllPages()
  
  const categoryMap = {
    profile: ['basicInfo'],
    health: ['dailyCheckin', 'history'],
    analysis: ['portrait', 'trends', 'forecast', 'simulation'],
    recommendations: ['recommendations', 'goals', 'campusDiet'],
    settings: ['notifications', 'aiChat']
  }

  return pages.filter(page => {
    const key = Object.keys(PAGES_STRUCTURE).find(k => PAGES_STRUCTURE[k as keyof typeof PAGES_STRUCTURE] === page)
    return key && categoryMap[category].includes(key)
  })
}
