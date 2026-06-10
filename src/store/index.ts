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
}

const STORAGE_KEY = 'fire_mgmt_store_v1';

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

export const useAppStore = create<AppState>((set, get) => ({
  hazards: persisted?.hazards ?? hazardList,
  inspections: persisted?.inspections ?? inspectionRoutes,
  equipments: persisted?.equipments ?? equipmentList,
  trainings: persisted?.trainings ?? trainingList,
  messages: persisted?.messages ?? defaultMessageList,

  addHazard: (payload) => {
    const newId = `HZ${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newHazard: HazardItem = {
      id: newId,
      title: payload.description.slice(0, 20) || '隐患上报',
      status: 'pending',
      reporter: '当前用户',
      reporterRole: 'tenant' as UserRole,
      reportTime: timeStr,
      ...payload,
    };

    set(s => {
      const nextState = { hazards: [newHazard, ...s.hazards] };
      persist(nextState);
      return nextState;
    });
  },

  updateHazardRectify: (id, patch) => {
    set(s => {
      const hazards = s.hazards.map(h => {
        if (h.id !== id) return h;
        let status: HazardStatus = h.status;
        let rectifyResult = h.rectifyResult;
        let reviewTime = h.reviewTime;

        if (patch.reviewResult === 'pass') {
          status = 'rectified';
          rectifyResult = patch.reviewNote || '复查合格';
          const n = new Date();
          reviewTime = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
        } else if (patch.reviewResult === 'fail') {
          status = 'processing';
          rectifyResult = patch.reviewNote || '复查不合格，需重新整改';
        } else if (patch.rectifyRequirement) {
          status = 'processing';
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
      const nextState = { hazards };
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
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const points = r.points.map(p =>
          p.id === pointId && !p.checked
            ? { ...p, checked: true, checkTime: timeStr, remark: '正常' }
            : p
        );
        const checkedCount = points.filter(p => p.checked).length;
        return {
          ...r,
          points,
          checkedPoints: checkedCount,
          status: checkedCount === 0 ? 'pending' : checkedCount === points.length ? 'completed' : 'in_progress',
          startTime: r.startTime || timeStr,
          endTime: checkedCount === points.length ? timeStr : r.endTime,
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
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return { ...r, status: 'completed', endTime: timeStr };
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
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
        return { ...t, signedIn: true, signTime: timeStr };
      });
      const nextState = { trainings };
      persist(nextState);
      return nextState;
    });
  },
}));
