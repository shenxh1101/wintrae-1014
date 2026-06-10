import { MessageItem } from '@/types';

export const messageList: MessageItem[] = [
  {
    id: 'MSG001',
    type: 'overdue',
    priority: 'urgent',
    title: '整改逾期提醒',
    content: '隐患「安全通道被货物堵塞」已超过整改期限，请尽快处理',
    time: '2026-06-10 08:00',
    read: false,
    relatedId: 'HZ001'
  },
  {
    id: 'MSG002',
    type: 'high_risk',
    priority: 'urgent',
    title: '高风险隐患通知',
    content: '新上报高风险隐患「消防通道停放电动车」，请立即安排整改',
    time: '2026-06-10 07:55',
    read: false,
    relatedId: 'HZ006'
  },
  {
    id: 'MSG003',
    type: 'repeat',
    priority: 'important',
    title: '重复隐患预警',
    content: 'A区3层安全通道堵塞问题本月第3次上报，建议重点关注',
    time: '2026-06-09 15:00',
    read: false,
    relatedId: 'HZ001'
  },
  {
    id: 'MSG004',
    type: 'rectify',
    priority: 'important',
    title: '整改完成通知',
    content: '隐患「C区1层灭火器缺失」已完成整改，请确认复查',
    time: '2026-06-09 16:05',
    read: true,
    relatedId: 'HZ003'
  },
  {
    id: 'MSG005',
    type: 'training',
    priority: 'normal',
    title: '培训签到提醒',
    content: '消防安全培训将于6月12日14:00在5层会议室举行，请准时参加',
    time: '2026-06-09 10:00',
    read: true
  },
  {
    id: 'MSG006',
    type: 'system',
    priority: 'normal',
    title: '巡检任务提醒',
    content: '今日1层、4层、5层巡检路线尚未开始，请在18:00前完成',
    time: '2026-06-10 09:00',
    read: false
  },
  {
    id: 'MSG007',
    type: 'overdue',
    priority: 'urgent',
    title: '整改逾期提醒',
    content: '隐患「违规使用大功率电器」整改期限为今日，请尽快完成',
    time: '2026-06-10 08:30',
    read: false,
    relatedId: 'HZ002'
  },
  {
    id: 'MSG008',
    type: 'rectify',
    priority: 'important',
    title: '新整改任务',
    content: '您被指派处理隐患「配电房门未上锁」，请在期限内完成整改',
    time: '2026-06-10 09:15',
    read: false,
    relatedId: 'HZ007'
  },
  {
    id: 'MSG009',
    type: 'high_risk',
    priority: 'urgent',
    title: '高风险隐患通知',
    content: '新上报高风险隐患「烟感报警器遮挡」，请立即安排整改',
    time: '2026-06-09 16:25',
    read: true,
    relatedId: 'HZ009'
  },
  {
    id: 'MSG010',
    type: 'system',
    priority: 'normal',
    title: '器材到期提醒',
    content: 'B区3层西侧灭火器已过期，请尽快更换',
    time: '2026-06-08 09:00',
    read: true,
    relatedId: 'EQ003'
  }
];

export const messageTypeMap: Record<string, string> = {
  overdue: '逾期',
  repeat: '重复',
  high_risk: '高风险',
  rectify: '整改',
  training: '培训',
  system: '系统'
};
