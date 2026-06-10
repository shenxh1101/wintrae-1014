import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { HazardItem, InspectionRoute, EquipmentItem, TrainingItem, MessageItem, HazardLevel, HazardType, HazardStatus, UserRole } from '@/types';
import { hazardList } from '@/data/hazard';
import { inspectionRoutes } from '@/data/inspection';
import { equipmentList } from '@/data/equipment';
import { trainingList } from '@/data/training';
import { messageList as defaultMessageList } from '@/data/message';

interface AppState {
  hazards: HazardItem[];
  inspections: InspectionRoute[];
  equipments: EquipmentItem[];
  trainings: TrainingItem[];
  messages: MessageItem[];

  addHazard: (h: Omit<HazardItem, 'id' | 'reporter' | 'reporterRole' | 'reportTime' | 'status'> & {
    type: HazardType;
    level: HazardLevel;
    location: string;
    description: string;
    imageUrl: string;
    floor: string;
    sourcePointId?: string;
    sourceRouteId?: string;
    sourcePointName?: string;
  }) => void;

  updateHazardRectify: (id: string, patch: {
    rectifyRequirement: string;
    deadline: string;
    inspector?: string;
    reviewResult?: 'pass' | 'fail' | '';
    reviewNote?: string;
  }) => void;

  getHazardById: (id: string) => HazardItem | undefined;

  checkPoint: (routeId: string, pointId: string) => void;

  completeRoute: (routeId: string) => void;

  getRouteById: (id: string) => InspectionRoute | undefined;

  getEquipmentByCode: (code: string) => EquipmentItem | undefined;

  signInTraining: (id: string) => void;

  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;

  checkOverdue: () => void;
}

const STORAGE_KEY = 'fire_mgmt_store_v2';

const nowStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
};

const loadPersisted = () => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'object') {
      return raw as Partial<AppState>;
    }
  } catch (e) {
    console.error('[Store] loadPersisted failed:', e);
  }
  return null;
};

const persist = (state: Partial<AppState>) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, {
      hazards: state.hazards,
      inspections: state.inspections,
      equipments: state.equipments,
      trainings: state.trainings,
      messages: state.messages,
    });
  } catch (e) {
    console.error('[Store] persist failed:', e);
  }
};

const persisted = loadPersisted();

const addMessageInternal = (
  msgs: MessageItem[],
  type: MessageItem['type'],
  priority: MessageItem['priority'],
  title: string,
  content: string,
  relatedId?: string,
  relatedType?: 'hazard' | 'equipment'
): MessageItem[] => {
  const newMsg: MessageItem = {
    id: `MSG${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`,
    type,
    priority,
    title,
    content,
    time: nowStr(),
    read: false,
    relatedId,
    relatedType,
  };
  return [newMsg, ...msgs];
};

export const useAppStore = create<AppState>((set, get) => ({
  hazards: persisted?.hazards ?? hazardList,
  inspections: persisted?.inspections ?? inspectionRoutes,
  equipments: persisted?.equipments ?? equipmentList,
  trainings: persisted?.trainings ?? trainingList,
  messages: persisted?.messages ?? defaultMessageList,

  addHazard: (payload) => {
    const newId = `HZ${Date.now().toString().slice(-6)}`;
    const newHazard: HazardItem = {
      id: newId,
      title: payload.description.slice(0, 20) || '隐患上报',
      status: 'pending',
      reporter: '当前用户',
      reporterRole: 'tenant' as UserRole,
      reportTime: nowStr(),
      ...payload,
    };

    set(s => {
      let newMessages = s.messages;
      if (payload.level === 'high') {
        const src = payload.sourcePointName
          ? `（来源：巡检-${payload.sourcePointName}）`
          : '';
        newMessages = addMessageInternal(
          newMessages, 'high_risk', 'urgent',
          '高风险隐患通知',
          `新上报高风险隐患${src}「${newHazard.title}」，请立即安排整改`,
          newId, 'hazard'
        );
      }
      if (payload.sourcePointName) {
        newMessages = addMessageInternal(
          newMessages, 'rectify', 'important',
          '巡检异常上报',
          `巡检点位「${payload.sourcePointName}」发现异常，已自动生成隐患记录`,
          newId, 'hazard'
        );
      }
      const nextState = { hazards: [newHazard, ...s.hazards], messages: newMessages };
      persist(nextState);
      return nextState;
    });
  },

  updateHazardRectify: (id, patch) => {
    set(s => {
      let newMessages = s.messages;
      const hazards = s.hazards.map(h => {
        if (h.id !== id) return h;
        let status: HazardStatus = h.status;
        let rectifyResult = h.rectifyResult;
        let reviewTime = h.reviewTime;

        if (patch.reviewResult === 'pass') {
          status = 'rectified';
          rectifyResult = patch.reviewNote || '复查合格';
          reviewTime = nowStr();
          newMessages = addMessageInternal(
            newMessages, 'rectify', 'important',
            '整改完成通知',
            `隐患「${h.title}」已完成整改，复查合格`,
            id, 'hazard'
          );
        } else if (patch.reviewResult === 'fail') {
          status = 'processing';
          rectifyResult = patch.reviewNote || '复查不合格，需重新整改';
          newMessages = addMessageInternal(
            newMessages, 'rectify', 'urgent',
            '复查不合格提醒',
            `隐患「${h.title}」复查不合格，需重新整改`,
            id, 'hazard'
          );
        } else if (patch.rectifyRequirement) {
          status = 'processing';
          newMessages = addMessageInternal(
            newMessages, 'rectify', 'important',
            '新整改任务',
            `您被指派处理隐患「${h.title}」，请在期限内完成整改`,
            id, 'hazard'
          );
        }

        return {
          ...h,
          rectifyRequirement: patch.rectifyRequirement || h.rectifyRequirement,
          deadline: patch.deadline || h.deadline,
          inspector: patch.inspector || h.inspector,
          rectifyResult,
          reviewTime,
          status,
        };
      });
      const nextState = { hazards, messages: newMessages };
      persist(nextState);
      return nextState;
    });
  },

  getHazardById: (id) => {
    return get().hazards.find(h => h.id === id);
  },

  checkPoint: (routeId, pointId) => {
    set(s => {
      const inspections = s.inspections.map(r => {
        if (r.id !== routeId) return r;
        const points = r.points.map(p =>
          p.id === pointId && !p.checked
            ? { ...p, checked: true, checkTime: nowStr(), remark: '正常' }
            : p
        );
        const checkedCount = points.filter(p => p.checked).length;
        return {
          ...r,
          points,
          checkedPoints: checkedCount,
          status: checkedCount === 0 ? 'pending' : checkedCount === points.length ? 'completed' : 'in_progress',
          startTime: r.startTime || nowStr(),
          endTime: checkedCount === points.length ? nowStr() : r.endTime,
        };
      });
      const nextState = { inspections };
      persist(nextState);
      return nextState;
    });
  },

  completeRoute: (routeId) => {
    set(s => {
      const inspections = s.inspections.map(r => {
        if (r.id !== routeId) return r;
        return { ...r, status: 'completed', endTime: nowStr() };
      });
      const nextState = { inspections };
      persist(nextState);
      return nextState;
    });
  },

  getRouteById: (id) => {
    return get().inspections.find(r => r.id === id);
  },

  getEquipmentByCode: (code) => {
    return get().equipments.find(e => e.qrCode === code || e.id === code);
  },

  signInTraining: (id) => {
    set(s => {
      const trainings = s.trainings.map(t => {
        if (t.id !== id || t.signedIn) return t;
        return { ...t, signedIn: true, signTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') };
      });
      const nextState = { trainings };
      persist(nextState);
      return nextState;
    });
  },

  markMessageRead: (id) => {
    set(s => {
      const messages = s.messages.map(m =>
        m.id === id ? { ...m, read: true } : m
      );
      const nextState = { messages };
      persist(nextState);
      return nextState;
    });
  },

  markAllMessagesRead: () => {
    set(s => {
      const messages = s.messages.map(m => ({ ...m, read: true }));
      const nextState = { messages };
      persist(nextState);
      return nextState;
    });
  },

  checkOverdue: () => {
    set(s => {
      const now = new Date();
      let newMessages = s.messages;
      const hazards = s.hazards.map(h => {
        if (h.status === 'processing' && h.deadline) {
          const deadlineDate = new Date(h.deadline);
          if (deadlineDate < now) {
            const existingOverdue = s.messages.find(m =>
              m.relatedId === h.id && m.type === 'overdue' && !m.read
            );
            if (!existingOverdue) {
              newMessages = addMessageInternal(
                newMessages, 'overdue', 'urgent',
                '整改逾期提醒',
                `隐患「${h.title}」已超过整改期限，请尽快处理`,
                h.id, 'hazard'
              );
            }
          }
        }
        return h;
      });
      if (newMessages !== s.messages) {
        const nextState = { hazards, messages: newMessages };
        persist(nextState);
        return nextState;
      }
      return s;
    });
  },
}));
