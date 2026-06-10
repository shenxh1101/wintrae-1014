import { TrainingItem } from '@/types';

export const trainingList: TrainingItem[] = [
  {
    id: 'TR001',
    title: '消防安全知识培训',
    trainer: '消防大队 李教官',
    location: '5层多功能会议室',
    time: '2026-06-12 14:00',
    duration: '2小时',
    signedIn: false
  },
  {
    id: 'TR002',
    title: '灭火器使用实操培训',
    trainer: '消防大队 张教官',
    location: '1层南门广场',
    time: '2026-06-15 09:00',
    duration: '1.5小时',
    signedIn: false
  },
  {
    id: 'TR003',
    title: '应急疏散演练',
    trainer: '商场安全部 王部长',
    location: '全楼',
    time: '2026-06-20 10:00',
    duration: '1小时',
    signedIn: false
  },
  {
    id: 'TR004',
    title: '消防设施日常检查培训',
    trainer: '设备科 赵科长',
    location: '3层培训室',
    time: '2026-06-05 14:00',
    duration: '2小时',
    signedIn: true,
    signTime: '2026-06-05 13:55'
  },
  {
    id: 'TR005',
    title: '新员工消防安全入职培训',
    trainer: '消防大队 李教官',
    location: '5层多功能会议室',
    time: '2026-06-01 09:00',
    duration: '3小时',
    signedIn: true,
    signTime: '2026-06-01 08:50'
  }
];
