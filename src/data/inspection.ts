import { InspectionRoute } from '@/types';

export const inspectionRoutes: InspectionRoute[] = [
  {
    id: 'IR001',
    name: '1层日常巡检',
    floor: '1F',
    totalPoints: 6,
    checkedPoints: 0,
    status: 'pending',
    points: [
      { id: 'P001', name: '北门消防通道', floor: '1F', location: 'A区1层北门', checked: false },
      { id: 'P002', name: '消火栓箱A-01', floor: '1F', location: 'A区1层东侧', checked: false },
      { id: 'P003', name: '灭火器柜A-02', floor: '1F', location: 'A区1层西侧', checked: false },
      { id: 'P004', name: 'B区消防通道', floor: '1F', location: 'B区1层中庭', checked: false },
      { id: 'P005', name: 'C区疏散指示', floor: '1F', location: 'C区1层西侧', checked: false },
      { id: 'P006', name: '配电房入口', floor: '1F', location: 'B区地下1层', checked: false }
    ]
  },
  {
    id: 'IR002',
    name: '2层日常巡检',
    floor: '2F',
    totalPoints: 5,
    checkedPoints: 3,
    status: 'in_progress',
    startTime: '2026-06-10 09:00',
    points: [
      { id: 'P007', name: '消火栓箱B-01', floor: '2F', location: 'B区2层东侧', checked: true, checkTime: '2026-06-10 09:15', remark: '正常' },
      { id: 'P008', name: '灭火器柜B-02', floor: '2F', location: 'B区2层西侧', checked: true, checkTime: '2026-06-10 09:25', remark: '正常' },
      { id: 'P009', name: '疏散通道B-03', floor: '2F', location: 'B区2层北侧', checked: true, checkTime: '2026-06-10 09:35', remark: '通道畅通' },
      { id: 'P010', name: '防火门B-04', floor: '2F', location: 'B区2层楼梯间', checked: false },
      { id: 'P011', name: '烟感报警器B-05', floor: '2F', location: 'B区2层中庭', checked: false }
    ]
  },
  {
    id: 'IR003',
    name: '3层日常巡检',
    floor: '3F',
    totalPoints: 5,
    checkedPoints: 5,
    status: 'completed',
    startTime: '2026-06-10 08:00',
    endTime: '2026-06-10 08:45',
    points: [
      { id: 'P012', name: '消火栓箱C-01', floor: '3F', location: 'A区3层东侧', checked: true, checkTime: '2026-06-10 08:10', remark: '正常' },
      { id: 'P013', name: '灭火器柜C-02', floor: '3F', location: 'A区3层西侧', checked: true, checkTime: '2026-06-10 08:20', remark: '正常' },
      { id: 'P014', name: '安全通道C-03', floor: '3F', location: 'A区3层301旁', checked: true, checkTime: '2026-06-10 08:25', remark: '发现堵塞已上报' },
      { id: 'P015', name: '防火门C-04', floor: '3F', location: 'A区3层楼梯间', checked: true, checkTime: '2026-06-10 08:35', remark: '正常' },
      { id: 'P016', name: '应急照明C-05', floor: '3F', location: 'C区3层走廊', checked: true, checkTime: '2026-06-10 08:40', remark: '正常' }
    ]
  },
  {
    id: 'IR004',
    name: '4层日常巡检',
    floor: '4F',
    totalPoints: 4,
    checkedPoints: 0,
    status: 'pending',
    points: [
      { id: 'P017', name: '消火栓箱D-01', floor: '4F', location: 'A区4层东侧', checked: false },
      { id: 'P018', name: '防火门D-02', floor: '4F', location: 'A区4层楼梯间', checked: false },
      { id: 'P019', name: '疏散通道D-03', floor: '4F', location: 'A区4层北侧', checked: false },
      { id: 'P020', name: '灭火器柜D-04', floor: '4F', location: 'B区4层西侧', checked: false }
    ]
  },
  {
    id: 'IR005',
    name: '5层日常巡检',
    floor: '5F',
    totalPoints: 5,
    checkedPoints: 0,
    status: 'pending',
    points: [
      { id: 'P021', name: '消火栓箱E-01', floor: '5F', location: 'A区5层东侧', checked: false },
      { id: 'P022', name: '烟感报警器E-02', floor: '5F', location: 'A区5层美食广场', checked: false },
      { id: 'P023', name: '灭火器柜E-03', floor: '5F', location: 'A区5层西侧', checked: false },
      { id: 'P024', name: '疏散通道E-04', floor: '5F', location: 'B区5层北侧', checked: false },
      { id: 'P025', name: '防火门E-05', floor: '5F', location: 'B区5层楼梯间', checked: false }
    ]
  }
];
